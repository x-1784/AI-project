"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

import "./energy-core.css";
import { EnergyCoreFallback } from "./energy-core-fallback";

/* 3D 场景必须按需加载且不进服务端渲染，避免阻塞首屏 HTML */
const EnergyCoreCanvas = dynamic(
  () => import("./energy-core-canvas").then((m) => m.EnergyCoreCanvas),
  { ssr: false },
);

/**
 * 渲染档位。
 * - pending：服务端与首次水合，只出静态轮廓
 * - fallback：WebGL 不可用，用 SVG 回退
 * - reduced：用户要求减少动态或设备偏弱，真 3D 静态帧，不跑自动动画
 * - compact：窄屏（≤767px），粒子与 DPR 各降一档
 * - full：完整档
 */
type Mode = "pending" | "full" | "compact" | "reduced" | "fallback";

const NARROW_QUERY = "(max-width: 767px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * 探测 WebGL 是否可用。
 *
 * 建出来的 context 必须主动丢掉：浏览器对同时存在的 WebGL context 数量
 * 有上限，探测用的这个若留着等垃圾回收，会让真正要渲染的那个更容易被
 * 丢弃。WEBGL_lose_context 扩展就是给这种场景用的。
 */
function probeWebGL(): boolean {
  let context: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  try {
    if (!window.WebGLRenderingContext) return false;
    const canvas = document.createElement("canvas");
    context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    return Boolean(context);
  } catch {
    return false;
  } finally {
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

/**
 * WebGL 可用性在页面生命周期内不会变化，探测一次就够。
 * 建 canvas 试探是有成本的操作，不能每次 getSnapshot 都做。
 */
let webglSupported: boolean | null = null;

function supportsWebGL(): boolean {
  if (webglSupported === null) webglSupported = probeWebGL();
  return webglSupported;
}

/** 低性能设备：内存或核心数偏小。缺 API 时按"不弱"处理，避免误判降级。 */
function isLowEndDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  return memory <= 4 || cores <= 4;
}

/*
 * media query 对象懒初始化并复用：
 * subscribe 与 getSnapshot 必须引用同一批对象，否则监听挂在一处、
 * 读取在另一处，变化永远收不到。
 */
let narrowMql: MediaQueryList | null = null;
let reducedMql: MediaQueryList | null = null;

function mediaQueries() {
  narrowMql ??= window.matchMedia(NARROW_QUERY);
  reducedMql ??= window.matchMedia(REDUCED_QUERY);
  return { narrow: narrowMql, reduced: reducedMql };
}

/**
 * 每次返回一个字符串，React 用 Object.is 比较即可判断是否需要重渲染。
 * 判定顺序有意义：WebGL 不可用优先于一切，减少动态优先于窄屏降级。
 */
function getSnapshot(): Mode {
  if (!supportsWebGL()) return "fallback";

  const { narrow, reduced } = mediaQueries();

  /* 减少动态：仍然渲染真 3D，但只出一帧静态画面。
     不给 SVG 降级图，因为静态 3D 帧的画质高于回退图。 */
  if (reduced.matches || isLowEndDevice()) return "reduced";

  /* 窄屏：按 docs/design/HOME_IA.md §7.2 降到 800 粒子 / DPR 1.25 */
  if (narrow.matches) return "compact";

  return "full";
}

/* 服务端与首次水合统一按 pending 渲染（静态轮廓），
   水合完成后 React 会自动切到客户端快照，不会报 hydration 不匹配 */
function getServerSnapshot(): Mode {
  return "pending";
}

/**
 * 真实订阅媒体查询变化。
 * 窗口缩放跨过 768px、用户在系统里改"减少动态"偏好、或在 DevTools 的
 * Rendering 面板勾 prefers-reduced-motion，都会实时重算档位，不需要刷新。
 */
function subscribe(onStoreChange: () => void): () => void {
  const { narrow, reduced } = mediaQueries();
  narrow.addEventListener("change", onStoreChange);
  reduced.addEventListener("change", onStoreChange);

  return () => {
    narrow.removeEventListener("change", onStoreChange);
    reduced.removeEventListener("change", onStoreChange);
  };
}

type Props = {
  className?: string;
  /** 静态回退图的无障碍标签 */
  fallbackLabel: string;
};

export function EnergyCoreStage({ className, fallbackLabel }: Props) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const showCanvas =
    mode === "full" || mode === "compact" || mode === "reduced";
  /* 显式收窄：showCanvas 为真时不可能是 pending / fallback */
  const intensity =
    mode === "full" || mode === "compact" || mode === "reduced"
      ? mode
      : "reduced";

  return (
    /* pointer-events-none：画布铺满首屏区域，若不关掉指针事件会挡住下方的
       AI 输入框。视差是通过 window 上的 pointermove 实现的（见 canvas 内
       onPointerMove），所以关掉画布自身的指针事件不影响交互。 */
    <div
      className={["pointer-events-none", className].filter(Boolean).join(" ")}
    >
      {/* 静态轮廓先占位，3D 就绪后淡入覆盖，避免闪黑/跳变 */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          showCanvas ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      >
        <EnergyCoreFallback label={fallbackLabel} />
      </div>

      {showCanvas ? (
        <div className="absolute inset-0 animate-[nx-fade-in_320ms_ease-out]">
          <EnergyCoreCanvas
            /* 细分与粒子数在创建时固定，运行时改不了，所以按档位重建场景。
               重建比同时维护三套资源更省内存，且切换频率极低。 */
            key={intensity}
            intensity={intensity}
            interactive={intensity === "full" || intensity === "compact"}
          />
        </div>
      ) : null}
    </div>
  );
}
