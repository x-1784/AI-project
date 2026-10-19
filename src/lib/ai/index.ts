import "server-only";

/**
 * `src/lib/ai` 的服务端入口。
 *
 * 这个 barrel 带 `server-only`：只要客户端组件误引入，构建就会失败，
 * 而不是把服务端逻辑（以及它读取的环境变量）打进浏览器 bundle。
 *
 * 前端如果要复用类型和上限常量，请直接从 `@/lib/ai/contracts` 引入 ——
 * 那个文件不含服务端代码，可以安全地出现在客户端。
 */

export * from "./config";
export * from "./contracts";
export * from "./errors";
export * from "./service";
