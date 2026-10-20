/**
 * `/api/chat` 与健康检查的共享契约。
 *
 * 这个文件刻意不 import "server-only"：前端需要引用这里的类型和上限常量，
 * 但它只包含类型和不可变常量，不含任何实现或密钥。
 *
 * 阶段 1 只定义契约，不实现路由；请求校验在阶段 4 用 Zod 按本文件的常量实现。
 * 阶段 2（P2-CONTRACT-01）冻结流式帧与传输方式，详细语义见同目录 `CHAT_CONTRACT.md`。
 */

import type { AiErrorBody } from "./errors";

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
 * 契约版本号。
 *
 * 破坏性变更（删字段、改语义）才递增；新增可选字段不递增。
 * 服务端通过响应头 `X-Contract-Version` 回传，前端可据此在灰度期做兼容分支。
 */
export const CHAT_CONTRACT_VERSION = 1;

/** 流式响应必须使用的 Content-Type。 */
export const CHAT_STREAM_CONTENT_TYPE =
  "application/x-ndjson; charset=utf-8" as const;

/** 流结束的原因。见 `CHAT_CONTRACT.md` §4.3。 */
export type ChatFinishReason = "stop" | "length" | "aborted";

/**
 * 首帧：把服务端的这次生成绑定到前端的一条消息上。
 *
 * 没有它，前端只能靠 `Date.now()` 猜消息 id，刷新或并发多轮时会串。
 */
export interface ChatStreamStart {
  type: "start";
  /** 贯穿本次请求的 id，同时写入服务端日志与响应头 `X-Request-Id`。 */
  requestId: string;
  /** 本次助手消息的 id，阶段 3 的 UI 用它做 key 与后续落库。 */
  messageId: string;
}

/** 增量文本。前端直接 append，不假设分片落在字符或词边界上。 */
export interface ChatStreamTextDelta {
  type: "text-delta";
  text: string;
}

/**
 * 终止帧之一：正常结束。
 *
 * `usage` 可能缺失：部分 OpenAI 兼容服务在流式下不返回用量，
 * 前端不得依赖它做计费或进度条。
 */
export interface ChatStreamFinish {
  type: "finish";
  reason: ChatFinishReason;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * 终止帧之一：流中途失败。
 *
 * 直接复用 `AiErrorBody` 的嵌套结构，保证与 HTTP 错误响应体形状一致 ——
 * 前端可以用同一段渲染逻辑处理「首个字节前失败」和「流中途失败」。
 */
export interface ChatStreamError extends AiErrorBody {
  type: "error";
}

/**
 * 流式响应的帧契约（阶段 2 冻结，详见 `CHAT_CONTRACT.md`）。
 *
 * 传输方式为 NDJSON：每行一个 JSON 对象，以 `\n` 分隔。
 * 帧顺序严格为：`start` → `text-delta`* → (`finish` | `error`)。
 */
export type ChatStreamEvent =
  ChatStreamStart | ChatStreamTextDelta | ChatStreamFinish | ChatStreamError;

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
