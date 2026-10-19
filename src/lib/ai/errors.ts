/**
 * AI 接口的稳定错误码与错误响应结构。
 *
 * 为什么单独成文件：前端要按错误码渲染文案和决定是否重试，
 * 所以错误码必须比实现更稳定 —— 换 provider、换模型都不能改这里的值。
 * `AI_BACKEND.md` §4.2 的 8 条错误码以本文件为唯一实现来源。
 */

export const AI_ERROR_CODES = [
  "INVALID_REQUEST",
  "AI_NOT_CONFIGURED",
  "AI_UNAUTHORIZED",
  "AI_RATE_LIMITED",
  "AI_TIMEOUT",
  "AI_UNAVAILABLE",
  "STREAM_ABORTED",
  "INTERNAL_ERROR",
] as const;

export type AiErrorCode = (typeof AI_ERROR_CODES)[number];

/**
 * 错误码到 HTTP 状态的映射。
 *
 * `STREAM_ABORTED` 用 499 只是内部约定：客户端已经断开，这个状态码不会被真的写回浏览器，
 * 保留它只是为了日志和调用方能区分「用户主动停止」与「服务出错」。
 */
export const AI_ERROR_HTTP_STATUS: Record<AiErrorCode, number> = {
  INVALID_REQUEST: 400,
  AI_NOT_CONFIGURED: 503,
  AI_UNAUTHORIZED: 502,
  AI_RATE_LIMITED: 429,
  AI_TIMEOUT: 504,
  AI_UNAVAILABLE: 502,
  STREAM_ABORTED: 499,
  INTERNAL_ERROR: 500,
};

/**
 * 对外的安全消息。
 *
 * 刻意写得笼统：真正的可读文案由前端按 `code` 从 `messages/*.json` 取，
 * 这里只是以防调用方直接显示 message 时不至于暴露上游细节或内部路径。
 */
const SAFE_ERROR_MESSAGES: Record<AiErrorCode, string> = {
  INVALID_REQUEST: "Request payload is invalid.",
  AI_NOT_CONFIGURED: "AI service is not configured.",
  AI_UNAUTHORIZED: "AI service authentication failed.",
  AI_RATE_LIMITED: "Too many requests, please retry later.",
  AI_TIMEOUT: "AI service timed out.",
  AI_UNAVAILABLE: "AI service is unavailable.",
  STREAM_ABORTED: "Stream aborted by client.",
  INTERNAL_ERROR: "Internal server error.",
};

/** 稳定的错误响应体：`{ "error": { "code", "message", "requestId?" } }`。 */
export interface AiErrorBody {
  error: {
    code: AiErrorCode;
    message: string;
    requestId?: string;
  };
}

export function isAiErrorCode(value: string): value is AiErrorCode {
  return (AI_ERROR_CODES as readonly string[]).includes(value);
}

export function httpStatusForAiError(code: AiErrorCode): number {
  return AI_ERROR_HTTP_STATUS[code];
}

export function safeMessageForAiError(code: AiErrorCode): string {
  return SAFE_ERROR_MESSAGES[code];
}

/**
 * 构造错误响应体。
 *
 * `requestId` 建议由调用方生成并同时写进服务端日志，这样用户反馈问题时可定位，
 * 又不需要把上游错误原文透给他们。
 */
export function createAiErrorBody(
  code: AiErrorCode,
  requestId?: string,
): AiErrorBody {
  const body: AiErrorBody = {
    error: { code, message: SAFE_ERROR_MESSAGES[code] },
  };
  if (requestId !== undefined) body.error.requestId = requestId;
  return body;
}

/**
 * 服务端内部抛出的错误。
 *
 * `cause` 只用于服务端日志，序列化响应时绝不会带出去（见 `createAiErrorBody`）。
 */
export class AiServiceError extends Error {
  readonly code: AiErrorCode;
  readonly requestId?: string;

  constructor(
    code: AiErrorCode,
    options: { cause?: unknown; requestId?: string } = {},
  ) {
    super(SAFE_ERROR_MESSAGES[code], { cause: options.cause });
    this.name = "AiServiceError";
    this.code = code;
    this.requestId = options.requestId;
  }
}

/**
 * 把任意异常收敛成错误码。
 *
 * 未知异常一律归为 `INTERNAL_ERROR`：宁可给用户一个通用提示，
 * 也不要把堆栈或上游原文漏出去。
 */
export function toAiErrorCode(error: unknown): AiErrorCode {
  return error instanceof AiServiceError ? error.code : "INTERNAL_ERROR";
}
