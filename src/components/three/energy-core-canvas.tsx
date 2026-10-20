"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

/* ============================================================
   能量核心 · 真实 WebGL 渲染
   - 三个频段的噪声叠加成内部等离子流场（低频定明暗，高频出细节）
   - 顶点噪声位移 + shader 内有限差分重算法线
   - 不用 Postprocessing bloom：紧贴球面的加性外壳 + billboard 光晕
   - 只创建一个 WebGL context，卸载时释放全部 GPU 资源
   ============================================================ */

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const CORE_VERT = /* glsl */ `
uniform float uTime;
uniform float uAmp;
varying vec3  vNormalW;
varying vec3  vPosW;
varying float vNoise;
${NOISE_GLSL}
float fbm3(vec3 p){
  float f = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++){ f += a * snoise(p); p *= 2.02; a *= 0.5; }
  return f;
}
float disp(vec3 dir){
  float t = uTime * 0.055;
  return fbm3(dir * 1.9 + vec3(t, t * 0.7, -t * 0.5));
}
void main(){
  vec3 dir = normalize(position);
  float d  = disp(dir);
  vNoise   = d;
  vec3 p   = dir * (1.0 + d * uAmp);

  /* 切线基上取两个偏移点做有限差分，法线在 GPU 上重算 */
  vec3 up = abs(dir.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 t1 = normalize(cross(up, dir));
  vec3 t2 = normalize(cross(dir, t1));
  float e = 0.022;
  vec3 dA = normalize(dir + t1 * e);
  vec3 dB = normalize(dir + t2 * e);
  vec3 pA = dA * (1.0 + disp(dA) * uAmp);
  vec3 pB = dB * (1.0 + disp(dB) * uAmp);
  vec3 n  = normalize(cross(pA - p, pB - p));
  if (dot(n, dir) < 0.0) n = -n;

  vec4 wp  = modelMatrix * vec4(p, 1.0);
  vPosW    = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * n);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const CORE_FRAG = /* glsl */ `
uniform float uTime;
uniform float uBandSpeed;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;
uniform vec3  uColorD;
uniform vec3  uLightDir;
varying vec3  vNormalW;
varying vec3  vPosW;
varying float vNoise;
${NOISE_GLSL}

void main(){
  vec3  N   = normalize(vNormalW);
  vec3  V   = normalize(cameraPosition - vPosW);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float rim  = pow(1.0 - ndv, 3.0);
  float rimT = pow(1.0 - ndv, 11.0);

  float t  = uTime * uBandSpeed;
  float nA = snoise(vPosW * 2.60 + vec3( t * 0.55, -t * 0.35,  t * 0.25));
  float nB = snoise(vPosW * 6.20 + vec3(-t * 0.60,  t * 0.45,  t * 0.35));
  float nC = snoise(vPosW * 13.5 + vec3( t * 0.90,  t * 0.20, -t * 0.70));
  float plasma = nA * 0.62 + nB * 0.34 + nC * 0.20;

  /* 高对比：允许大面积接近全黑，只让少数区域烧亮 */
  float lit  = smoothstep(0.10, 0.92, plasma);
  float core = smoothstep(0.55, 1.10, plasma);

  vec3 col = uColorA * 0.040;
  col = mix(col, uColorB * 0.74, pow(lit, 1.5) * 0.95);
  col = mix(col, uColorC * 1.15, pow(lit, 4.2) * 0.72);
  col += mix(uColorD, vec3(1.0), 0.18) * pow(core, 1.9) * 1.20;

  col += mix(uColorB, uColorD, 0.34) * pow(1.0 - ndv, 5.0) * 0.34;
  /* 亮边随噪声起伏，避免成一个完美圆环（那样会读成玻璃泡） */
  col += mix(uColorB, uColorD, 0.78) * rimT
       * (0.75 + 0.45 * sin(vPosW.y * 2.2 + t * 1.6)) * 0.95;

  float purple = smoothstep(0.34, 0.95, rim) * (1.0 - smoothstep(-0.55, 0.32, N.y));
  col = mix(col, uColorC * 1.30, purple * 0.62);

  float spec = pow(max(dot(N, normalize(uLightDir)), 0.0), 18.0);
  col += uColorD * spec * 0.16;

  vec3 c = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
  gl_FragColor = vec4(c, 1.0);
}
`;

const SHELL_VERT = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vPosW;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const SHELL_FRAG = /* glsl */ `
uniform vec3  uColorB;
uniform vec3  uColorD;
uniform float uPower;
uniform float uStrength;
varying vec3 vNormalW;
varying vec3 vPosW;
void main(){
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  float g = pow(1.0 - abs(dot(N, V)), uPower);
  gl_FragColor = vec4(mix(uColorB, uColorD, 0.55), g * uStrength);
}
`;

const GLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const GLOW_FRAG = /* glsl */ `
uniform vec3 uColorB;
uniform vec3 uColorC;
varying vec2 vUv;
void main(){
  float d = length(vUv - 0.5) * 2.0;
  float g = pow(clamp(1.0 - d, 0.0, 1.0), 3.4);
  gl_FragColor = vec4(mix(uColorC, uColorB, smoothstep(0.0, 0.85, d)), g * 0.42);
}
`;

/** 核心直径约占画布高度的 62%，剩余空间留给光晕在画布内衰减完毕，
 *  否则光晕会被画布边界切断，露出一块可见的方形面板。 */
const CORE_SCALE = 0.82;
const GLOW_SCALE = 2.5;

const PRESET = {
  full: { detail: 28, maxDpr: 1.5, particles: 1800, rings: 3 },
  reduced: { detail: 16, maxDpr: 1.0, particles: 320, rings: 0 },
} as const;

type Props = {
  intensity: keyof typeof PRESET;
  interactive: boolean;
};

export function EnergyCoreCanvas({ intensity, interactive }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const preset = PRESET[intensity];
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.set(0, 0, 4.35);

    const inner = new THREE.Group();
    inner.scale.setScalar(CORE_SCALE);
    scene.add(inner);

    const uniforms = {
      uTime: { value: 0 },
      uAmp: { value: 0.03 },
      uBandSpeed: { value: intensity === "full" ? 0.34 : 0 },
      uColorA: { value: new THREE.Color("#0B1030") },
      uColorB: { value: new THREE.Color("#2B5FD9") },
      uColorC: { value: new THREE.Color("#8B5CF6") },
      uColorD: { value: new THREE.Color("#6FE3FF") },
      uLightDir: { value: new THREE.Vector3(-0.55, 0.78, 0.62).normalize() },
    };

    const coreGeo = new THREE.IcosahedronGeometry(1, preset.detail);
    const coreMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: CORE_VERT,
      fragmentShader: CORE_FRAG,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    inner.add(core);

    const shellGeo = new THREE.IcosahedronGeometry(1.03, 8);
    const shellMat = new THREE.ShaderMaterial({
      uniforms: {
        uColorB: uniforms.uColorB,
        uColorD: uniforms.uColorD,
        uPower: { value: 14.0 },
        uStrength: { value: 0.12 },
      },
      vertexShader: SHELL_VERT,
      fragmentShader: SHELL_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    inner.add(shell);

    const glowGeo = new THREE.PlaneGeometry(2, 2);
    const glowMat = new THREE.ShaderMaterial({
      uniforms: { uColorB: uniforms.uColorB, uColorC: uniforms.uColorC },
      vertexShader: GLOW_VERT,
      fragmentShader: GLOW_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.scale.setScalar(GLOW_SCALE);
    glow.renderOrder = -1;
    inner.add(glow);

    /* 星尘粒子：紧贴球壳，铺开就会溢出到文字区，整页变成下雪 */
    const particleGeo = new THREE.BufferGeometry();
    {
      const n = preset.particles;
      const positions = new Float32Array(n * 3);
      const colors = new Float32Array(n * 3);
      const ion = new THREE.Color("#6FE3FF");
      const nebula = new THREE.Color("#8B5CF6");
      for (let i = 0; i < n; i++) {
        const r = 1.06 + Math.random() * 0.26;
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * Math.PI * 2;
        positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = r * Math.cos(theta) * 0.82;
        positions[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);
        const c = ion.clone().lerp(nebula, Math.random() * 0.85);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      particleGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    }
    const particleMat = new THREE.PointsMaterial({
      size: 0.011,
      vertexColors: true,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    inner.add(particles);

    /* 轨道环 */
    const ringGroup = new THREE.Group();
    const ringGeos: THREE.BufferGeometry[] = [];
    const ringMats: THREE.LineBasicMaterial[] = [];
    for (let i = 0; i < preset.rings; i++) {
      const seg = 220;
      const rad = 1.03 + i * 0.13;
      const pts: THREE.Vector3[] = [];
      for (let s = 0; s <= seg; s++) {
        const a = (s / seg) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * rad, 0, Math.sin(a) * rad));
      }
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const m = new THREE.LineBasicMaterial({
        color: i === 0 ? 0x8b5cf6 : 0x4b8cff,
        transparent: true,
        opacity: i === 0 ? 0.2 : 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const line = new THREE.Line(g, m);
      line.rotation.x = Math.PI / 2 + (i - 1) * 0.42;
      line.rotation.z = -0.18 + i * 0.24;
      ringGeos.push(g);
      ringMats.push(m);
      ringGroup.add(line);
    }
    inner.add(ringGroup);

    /* 尺寸：跟随容器，不用窗口尺寸 */
    let dpr = 1;
    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), preset.maxDpr);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    /* 指针视差：只写 ref，不触发 React 状态更新 */
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (interactive) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    /* 渲染循环：页面隐藏即停，回来继续 */
    let raf = 0;
    let time = 0;
    let last = performance.now();
    let visible = true;

    const onVisibility = () => {
      visible = !document.hidden;
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible) return;

      if (interactive) {
        time += dt;
        uniforms.uTime.value = time;
        inner.rotation.y += dt * 0.045;
        inner.rotation.x = Math.sin(time * 0.11) * 0.055;
        particles.rotation.y -= dt * 0.018;
      }

      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;
      camera.position.x = pointer.x * 0.1;
      camera.position.y = -pointer.y * 0.07;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    /* 卸载：释放事件、动画与全部 GPU 资源 */
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);

      coreGeo.dispose();
      coreMat.dispose();
      shellGeo.dispose();
      shellMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringGeos.forEach((g) => g.dispose());
      ringMats.forEach((m) => m.dispose());

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [intensity, interactive]);

  return <div ref={hostRef} className="h-full w-full" aria-hidden="true" />;
}
