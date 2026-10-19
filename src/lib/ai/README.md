# `src/lib/ai` — 角色 B 的服务端边界

> 状态：**阶段 1（只定义契约，不发起真实调用）**
> 归属：`@Nanami1-1`（角色 B）。前端如需类型，请从 `@/lib/ai/contracts` 引入。
> 上级规范：`CLAUDE.md` §8、`docs/roles/AI_BACKEND.md` §3–§4。

---

## 1. 文件职责

| 文件 | 作用 | 能否被客户端引入 |
| --- | --- | --- |
| `config.ts` | 环境变量解析与校验，唯一的配置读取入口 | 否（`server-only`） |
| `service.ts` | 服务端边界：`requireAiConfig()` / `getAiAvailability()` | 否（`server-only`） |
| `errors.ts` | 8 条稳定错误码与响应结构 | 可以（纯类型与常量） |
| `contracts.ts` | `/api/chat` 请求、上限、流式帧、健康检查结构 | 可以（纯类型与常量） |
| `index.ts` | 服务端 barrel | 否（`server-only`） |

`server-only` 由 Next.js 内置别名提供，阶段 1 **不新增任何依赖**；
客户端若误引入带 `server-only` 的文件，构建会直接失败。

---

## 2. 环境变量契约

变量名以 `.env.example` 为准（变量名由 B 提出，文件结构由 C 维护）。

| 变量 | 必填 | 缺省 | 约束 |
| --- | --- | --- | --- |
| `AI_API_KEY` | 是 | — | 非空；禁止 `NEXT_PUBLIC_` 前缀 |
| `AI_MODEL` | 是 | — | 非空 |
| `AI_BASE_URL` | 是 | — | 合法 `http(s)` 绝对地址；允许 `http`（本地推理服务） |
| `AI_TIMEOUT_MS` | 否 | `60000` | 整数，1000–300000 |
| `AI_MAX_OUTPUT_TOKENS` | 否 | `2048` | 整数，1–32000 |

解析结果只有两种形态：

```ts
{ configured: true, apiKey, baseUrl, model, timeoutMs, maxOutputTokens }
{ configured: false, issue }  // issue 是枚举，不含变量值
```

**为什么返回 `issue` 而不是抛错或返回 `null`**：调用方需要能区分「没配」和「配错」，
但日志里不能出现变量值。`describeAiConfigIssue()` 给出的是可读原因，同样不含值。

---

## 3. 错误码

`AI_BACKEND.md` §4.2 的 8 条错误码，实现以 `errors.ts` 为唯一来源。

| 错误码 | HTTP | 含义 | 前端行为 |
| --- | --- | --- | --- |
| `INVALID_REQUEST` | 400 | 请求格式或内容不合法 | 显示可读提示，不重试 |
| `AI_NOT_CONFIGURED` | 503 | 未配置密钥或模型 | 显示「AI 功能尚未配置」 |
| `AI_UNAUTHORIZED` | 502 | 上游鉴权失败 | 显示服务不可用 |
| `AI_RATE_LIMITED` | 429 | 上游或本地限流 | 提示稍后重试 |
| `AI_TIMEOUT` | 504 | 上游超时 | 提供重试 |
| `AI_UNAVAILABLE` | 502 | 上游不可用或网络错误 | 提供重试 |
| `STREAM_ABORTED` | 499（内部） | 客户端主动取消 | 不显示错误，标记已停止 |
| `INTERNAL_ERROR` | 500 | 未分类服务端错误 | 通用提示 + 重试 |

响应体固定为：

```json
{ "error": { "code": "AI_UNAVAILABLE", "message": "AI service is unavailable." } }
```

`message` 是笼统的英文兜底，**前端不要直接展示**：应按 `code` 从 `messages/*.json`
取本地化文案。`requestId` 为可选字段，用于把用户反馈和服务端日志对上。

---

## 4. `/api/chat` 契约（草案）

请求：

```json
{ "messages": [{ "role": "user", "content": "帮我整理这段文字" }] }
```

约束（`CHAT_LIMITS`，服务端与前端共用同一份常量）：

| 项 | 上限 |
| --- | --- |
| 消息条数 | 50 |
| 单条字符数 | 8000 |
| 合计字符数 | 32000 |
| 请求体大小 | 128 KiB |

- 角色只允许 `user` / `assistant`；`system` 不开放，提示词由服务端决定。
- 流式帧结构见 `contracts.ts` 的 `ChatStreamEvent`，**阶段 3 与角色 C 确认后冻结**。
- 客户端断开时必须把 abort 传递给上游，并记录为 `STREAM_ABORTED`。

**阶段 1 不实现该路由**：`src/app/api/chat/route.ts` 属于阶段 4。

---

## 5. `GET /api/health` 契约（草案，归属待定）

```json
{ "status": "ok", "ai": "configured", "timestamp": "2026-10-20T00:00:00.000Z" }
```

- 只暴露「已配置 / 未配置」，不返回模型名、上游地址或密钥片段。
- 未配置 AI 时 `status` 为 `degraded`，但 HTTP 仍返回 200（服务本身是活的）。

**本次不实现路由**：归属存在冲突（`CODEOWNERS` 判 C、`CLAUDE.md` §16.4 判 B），
等 Issue #3 的 D1 裁定后再落地；若判给 C，`HealthCheckResponse` 一并移交。

---

## 6. 没有密钥时的行为

| 场景 | 行为 |
| --- | --- |
| `pnpm dev` / `pnpm build` | 正常启动、正常构建，**不因为缺变量而失败** |
| 读取 AI 状态 | `getAiAvailability()` 返回 `not_configured` |
| 调用 AI 边界 | `requireAiConfig()` 抛 `AI_NOT_CONFIGURED`（503） |
| 用户可见结果 | UI 显示「AI 功能尚未配置」，不产生任何伪造回复 |

`config.ts` 只在函数内读 `process.env`，模块顶层不读，避免构建期把变量固化进产物。

---

## 7. 阶段边界

| 阶段 | 本目录的增量 |
| --- | --- |
| 1（已完成） | 配置契约、错误码、请求/流式/健康契约、`server-only` 边界 |
| 3 | 与 C 冻结流式帧；提供前端可消费的类型 |
| 4 | 装 `zod` + `ai` + `@ai-sdk/openai-compatible`，实现 `POST /api/chat` 真实流式、超时、abort、按 IP 限流 |
| 5 | `src/lib/db`、`src/lib/auth`、迁移目录 |

阶段 1 刻意不装 AI SDK：`streamText` 属于阶段 4，提前引入会让「是否有真实调用」
这件事变得难以验证。
