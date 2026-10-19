/**
 * `/api/chat` 与健康检查的共享契约。
 *
 * 这个文件刻意不 import "server-only"：前端需要引用这里的类型和上限常量，
 * 但它只包含类型和不可变常量，不含任何实现或密钥。
 *
 * 阶段 1 只定义契约，不实现路由；请求校验在阶段 4 用 Zod 按本文件的常量实现。
 */

import type { AiErrorCode } from "./errors";

/** 允许的对话角色。`system` 不开放给客户端，提示词由服务端决定。 */
export const CHAT_ROLES = ["user", "assistant"] as const;

export type ChatRole = (typeof CHAT_ROLES)[number];

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/**
 * 上限值集中在这里，做三件事：
 * 1. 服务端校验（阶段 4 的 Zod schema 直接引用）；
 * 2. 前端提前拦截，少打一次必然失败的请求；
 * 3. 文档和实现不会各写一个数字。
 */
export const CHAT_LIMITS = {
  /** 上下文最多 50 条，控制成本与延迟。 */
  maxMessages: 50,
  /** 单条消息最长 8000 字符，约等于一篇长文，超出应走文件上传。 */
  maxMessageChars: 8_000,
  /** 所有消息合计最长 32000 字符，防止用多条长消息绕过单条限制。 */
  maxTotalChars: 32_000,
  /** 请求体上限 128 KiB，挡住明显的体积攻击。 */
  maxBodyBytes: 128 * 1024,
} as const;

/** `POST /api/chat` 的请求体。 */
export interface ChatRequest {
  messages: ChatMessage[];
}

/**
 * 流式响应的帧契约（草案，阶段 3 与角色 C 确认后冻结）。
 *
 * 采用一棵以 `type` 区分的事件树：
 * - `text-delta` 增量文本，前端直接 append；
 * - `finish` 正常结束，带结束原因；
 * - `error` 流中途失败，之后不会再有其他帧。
 */
export type ChatStreamEvent =
  | { type: "text-delta"; text: string }
  | { type: "finish"; reason: "stop" | "length" | "aborted" }
  | { type: "error"; code: AiErrorCode };

/**
 * `GET /api/health` 的响应结构（草案）。
 *
 * 只定义结构、不实现路由：该接口的归属仍待 Issue #3 的 D1 裁定，
 * 若最终判给角色 C，这个类型一并移交。
 */
export interface HealthCheckResponse {
  status: "ok" | "degraded";
  /** 只暴露「是否已配置」，绝不返回模型名、地址或密钥片段。 */
  ai: "configured" | "not_configured";
  timestamp: string;
}
