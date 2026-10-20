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

type Mode = "pending" | "full" | "reduced" | "fallback";

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

/** 低性能设备：内存或核心数偏小。缺 API 时按"不弱"处理，避免误判降级。 */
function isLowEndDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  return memory <= 4 || cores <= 4;
}

/**
 * 检测结果只算一次并缓存。
 * useSyncExternalStore 要求 getSnapshot 返回稳定值，
 * 而建 canvas 试探 WebGL 是有成本的操作，不能每帧重算。
 */
let cachedMode: Mode | null = null;

function detectMode(): Mode {
  if (!hasWebGL()) return "fallback";
  /* 减少动态时仍然渲染真 3D，只是不跑动画（静态一帧），
     这样观感和 WebGL 回退图一致，也不牺牲画质 */
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  return reduceMotion || isLowEndDevice() ? "reduced" : "full";
}

function getSnapshot(): Mode {
  if (cachedMode === null) cachedMode = detectMode();
  return cachedMode;
}

/* 服务端与首次水合统一按 pending 渲染（静态轮廓），
   水合完成后 React 会自动切到客户端快照，不会报 hydration 不匹配 */
function getServerSnapshot(): Mode {
  return "pending";
}

/** 能力检测结果在页面生命周期内不会变化，无需订阅任何数据源 */
function subscribe(): () => void {
  return () => {};
}

type Props = {
  className?: string;
  /** 静态回退图的无障碍标签 */
  fallbackLabel: string;
};

export function EnergyCoreStage({ className, fallbackLabel }: Props) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const showCanvas = mode === "full" || mode === "reduced";

  return (
    /* pointer-events-none：画布铺满首屏区域，若不关掉指针事件会挡住下方的
       AI 输入框。视差是通过 window 上的 pointermove 实现的（见 canvas 内
       onPointerMove），所以关掉画布自身的指针事件不影响交互。 */
    <div className={["pointer-events-none", className].filter(Boolean).join(" ")}>
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
            intensity={mode === "reduced" ? "reduced" : "full"}
            interactive={mode === "full"}
          />
        </div>
      ) : null}
    </div>
  );
}
