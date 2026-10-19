import "server-only";

/**
 * AI 服务端配置的唯一读取入口。
 *
 * 为什么集中在这样一个文件里：
 * - 密钥只允许在服务端读取，任何 `NEXT_PUBLIC_AI_*` 形式都算泄露；
 * - 缺少或写错变量时，需要给出「可诊断但不泄密」的结论，
 *   所以这里只产出问题类型（issue），不产出变量值；
 * - 读取动作放在函数内而不是模块顶层，避免构建期把环境变量固化进产物。
 */

/** 与 `.env.example` 对齐的变量名（变量名由角色 B 提出，文件结构由角色 C 维护）。 */
export const AI_ENV_KEYS = {
  apiKey: "AI_API_KEY",
  baseUrl: "AI_BASE_URL",
  model: "AI_MODEL",
  timeoutMs: "AI_TIMEOUT_MS",
  maxOutputTokens: "AI_MAX_OUTPUT_TOKENS",
} as const;

/** 变量留空时的默认值，与 `.env.example` 的注释口径保持一致。 */
export const AI_CONFIG_DEFAULTS = {
  timeoutMs: 60_000,
  maxOutputTokens: 2_048,
} as const;

/**
 * 取值范围约束。
 *
 * 过小的超时会让正常请求必然失败，过大的超时会撑爆平台函数执行时间；
 * 输出上限不设上限则可能一次请求就耗尽额度。
 */
export const AI_CONFIG_BOUNDS = {
  minTimeoutMs: 1_000,
  maxTimeoutMs: 300_000,
  minMaxOutputTokens: 1,
  maxMaxOutputTokens: 32_000,
} as const;

/** 配置不可用的原因。禁止把变量值放进这里，它可能被写进日志。 */
export type AiConfigIssue =
  | "missing_api_key"
  | "missing_model"
  | "missing_base_url"
  | "invalid_base_url"
  | "invalid_timeout"
  | "invalid_max_output_tokens";

export interface ResolvedAiConfig {
  readonly configured: true;
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly model: string;
  readonly timeoutMs: number;
  readonly maxOutputTokens: number;
}

export interface UnconfiguredAiConfig {
  readonly configured: false;
  readonly issue: AiConfigIssue;
}

export type AiConfig = ResolvedAiConfig | UnconfiguredAiConfig;

/**
 * 只依赖「键 → 字符串」这一最小形状，而不是 `NodeJS.ProcessEnv`。
 *
 * 理由是 `NodeJS.ProcessEnv` 被 Next 的类型增强后要求 `NODE_ENV` 必填，
 * 会让测试里传入一个手写对象变得别扭；这里用不到 `NODE_ENV`，就不该要求它。
 */
export type AiEnvSource = Readonly<Record<string, string | undefined>>;

function readEnv(env: AiEnvSource, name: string): string | undefined {
  const raw = env[name];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseIntegerInRange(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number | null {
  if (raw === undefined) return fallback;
  // 只接受纯数字，避免 "60s"、"1e3" 这类看似合理实则含义不明的写法。
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) return null;
  return value;
}

function parseBaseUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    // 允许 http，是因为本地推理服务（如 Ollama、vLLM）通常不带 TLS。
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return raw.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

/**
 * 解析配置。显式接收 env 便于测试，不依赖全局可变状态。
 *
 * 判定顺序按「最可能配错」排列：先看密钥，再看模型和地址，最后看数值。
 */
export function resolveAiConfig(env: AiEnvSource = process.env): AiConfig {
  const apiKey = readEnv(env, AI_ENV_KEYS.apiKey);
  if (apiKey === undefined)
    return { configured: false, issue: "missing_api_key" };

  const model = readEnv(env, AI_ENV_KEYS.model);
  if (model === undefined) return { configured: false, issue: "missing_model" };

  const rawBaseUrl = readEnv(env, AI_ENV_KEYS.baseUrl);
  if (rawBaseUrl === undefined) {
    return { configured: false, issue: "missing_base_url" };
  }
  const baseUrl = parseBaseUrl(rawBaseUrl);
  if (baseUrl === null) return { configured: false, issue: "invalid_base_url" };

  const timeoutMs = parseIntegerInRange(
    readEnv(env, AI_ENV_KEYS.timeoutMs),
    AI_CONFIG_DEFAULTS.timeoutMs,
    AI_CONFIG_BOUNDS.minTimeoutMs,
    AI_CONFIG_BOUNDS.maxTimeoutMs,
  );
  if (timeoutMs === null)
    return { configured: false, issue: "invalid_timeout" };

  const maxOutputTokens = parseIntegerInRange(
    readEnv(env, AI_ENV_KEYS.maxOutputTokens),
    AI_CONFIG_DEFAULTS.maxOutputTokens,
    AI_CONFIG_BOUNDS.minMaxOutputTokens,
    AI_CONFIG_BOUNDS.maxMaxOutputTokens,
  );
  if (maxOutputTokens === null) {
    return { configured: false, issue: "invalid_max_output_tokens" };
  }

  return {
    configured: true,
    apiKey,
    baseUrl,
    model,
    timeoutMs,
    maxOutputTokens,
  };
}

let cachedConfig: AiConfig | undefined;

/**
 * 进程内缓存的配置。
 *
 * 缓存的理由：一次请求里可能多次询问「是否已配置」，反复解析环境变量没有意义。
 * 代价：进程内改环境变量不会生效，需要重启服务；开发和测试用 `resetAiConfigCache`。
 */
export function getAiConfig(): AiConfig {
  cachedConfig ??= resolveAiConfig();
  return cachedConfig;
}

/** 仅用于测试与本地调试；生产路径不应调用。 */
export function resetAiConfigCache(): void {
  cachedConfig = undefined;
}

/** 给服务端日志用的一句话说明，不含任何变量值。 */
export function describeAiConfigIssue(issue: AiConfigIssue): string {
  switch (issue) {
    case "missing_api_key":
      return "未设置 AI_API_KEY，AI 功能不可用";
    case "missing_model":
      return "未设置 AI_MODEL，AI 功能不可用";
    case "missing_base_url":
      return "未设置 AI_BASE_URL，AI 功能不可用";
    case "invalid_base_url":
      return "AI_BASE_URL 不是合法的 http(s) 地址";
    case "invalid_timeout":
      return `AI_TIMEOUT_MS 必须是 ${AI_CONFIG_BOUNDS.minTimeoutMs}–${AI_CONFIG_BOUNDS.maxTimeoutMs} 之间的整数`;
    case "invalid_max_output_tokens":
      return `AI_MAX_OUTPUT_TOKENS 必须是 ${AI_CONFIG_BOUNDS.minMaxOutputTokens}–${AI_CONFIG_BOUNDS.maxMaxOutputTokens} 之间的整数`;
  }
}
