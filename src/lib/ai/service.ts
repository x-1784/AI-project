import "server-only";

import { getAiConfig, type ResolvedAiConfig } from "./config";
import { AiServiceError } from "./errors";

/**
 * 阶段 1 的服务端边界。
 *
 * 现在还没有真实调用，这里只负责一件事：把「配置是否可用」变成一个
 * 明确的、可判定的状态。等阶段 4 接入 streamText 时，所有调用都要先过这道门，
 * 这样「没密钥」就不会退化成静默失败或伪造输出。
 */

/** 供健康检查或工作台读取的安全状态，不含任何配置细节。 */
export function getAiAvailability(): "configured" | "not_configured" {
  return getAiConfig().configured ? "configured" : "not_configured";
}

/**
 * 取配置，拿不到就抛 `AI_NOT_CONFIGURED`。
 *
 * 为什么抛异常而不是返回 null：调用方漏判 null 会退化成「空回复」，
 * 而异常一定会被路由的错误映射捕获，最终变成可读的错误码。
 */
export function requireAiConfig(): ResolvedAiConfig {
  const config = getAiConfig();
  if (!config.configured) {
    throw new AiServiceError("AI_NOT_CONFIGURED", { cause: config.issue });
  }
  return config;
}
