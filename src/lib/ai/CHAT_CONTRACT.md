# `POST /api/chat` 接口契约

> 任务：P2-CONTRACT-01（Issue [#20](https://github.com/x-1784/AI-project/issues/20)）
> 归属：`@Nanami1-1`（角色 B / AI 与后端）｜评审：`@x-1784`
> 契约版本：**1**（见 `CHAT_CONTRACT_VERSION`）
> 状态：**已冻结，待评审确认**。阶段 2 只出契约，**不实现路由、不接真实 AI**。

这份文件回答一个问题：**前端在阶段 3 写工作台时，能不能只靠这份文档把流式对话做出来，不用回头问后端？**

答案是能。所有类型都是 `src/lib/ai/contracts.ts` 里的真实导出，不是本文档自己编的；所有错误码都是 `src/lib/ai/errors.ts` 里的 8 条之一。**文档与代码不一致时以代码为准**，并提 issue 修文档。

---

## 0. 一句话概览

```
POST /api/chat
Content-Type: application/json
{ "messages": [{ "role": "user", "content": "..." }] }

→ 200, application/x-ndjson
{"type":"start","requestId":"r_...","messageId":"m_..."}
{"type":"text-delta","text":"你"}
{"type":"text-delta","text":"好"}
{"type":"finish","reason":"stop"}
```

失败分两条路径：**首个字节前失败**返回 HTTP 错误码 + JSON 错误体；**已经开始流式后失败**返回 `type:"error"` 帧。前端两条都要处理，这是最容易漏的地方。

---

## 1. 范围

**包含**：请求结构、流式帧、错误码映射、abort、超时、消息数量/长度上限、前端消费方式、版本兼容。

**不包含**（阶段 4/5 才做，现在写进来就是提前实现）：

- `src/app/api/chat/route.ts` 本身
- `zod` / `ai` / `@ai-sdk/openai-compatible` 依赖
- 真实模型调用、提示词、温度等参数
- 数据库、会话历史、认证
- 前端组件与 `messages/*.json` 文案（归角色 C 与角色 A）

---

## 2. 传输方式：NDJSON，不用 SSE

**结论**：响应体是 **NDJSON**（Newline-Delimited JSON），每行一个完整 JSON 对象，`\n` 结尾。

```
Content-Type: application/x-ndjson; charset=utf-8
Cache-Control: no-store
X-Request-Id: <与 start.requestId 相同>
X-Contract-Version: 1
X-Accel-Buffering: no
```

**为什么不用 `text/event-stream`**

1. `EventSource` 只支持 GET，而这里要 POST 带消息体，本来就得手写解析 —— SSE 的浏览器原生优势用不上。
2. SSE 的帧格式有 `data:`、空行分隔、注释行、`retry:` 等多个可选项，手写解析器要处理的边界比 NDJSON 多一倍，且容易写出「半个事件」的 bug。
3. NDJSON 每行自包含，日志里可直接 grep，测试里可直接按行断言。

**代价**：不能用 `EventSource` 自动重连；不需要 —— 中断就是中断，由前端显式重试（见 §5.4）。

**为什么带 `X-Accel-Buffering: no`**：反向代理（nginx / 部分 PaaS 网关）默认会缓冲响应，导致流式变成「一次性吐完」。这个头是明确关掉它。

---

## 3. 请求契约

### 3.1 结构

```ts
interface ChatRequest {
  messages: ChatMessage[];        // 至少 1 条，最后一条必须是 user
}
interface ChatMessage {
  role: "user" | "assistant";     // 不含 system，提示词由服务端决定
  content: string;                // 1 ~ 8000 字符（按 JS 字符串长度计）
}
```

```json
{
  "messages": [
    { "role": "user", "content": "帮我把这段话改得更简洁" },
    { "role": "assistant", "content": "可以，把原文发我。" },
    { "role": "user", "content": "就是这句……" }
  ]
}
```

**为什么客户端不能传 `system`**：提示词是产品行为的一部分，放给客户端等于让它改产品逻辑，也是注入入口。服务端自己注入。

**为什么最后一条必须是 `user`**：最后一条是 `assistant` 时，模型没有可回应的输入，只会续写自己的话。直接拒绝比让用户看到诡异输出好。

**多轮上下文怎么带**：客户端每次把完整历史一起发（无状态）。阶段 5 引入 `conversationId` 后服务端可从库里取，但**该字段现在不存在，前端不要预留**。

### 3.2 上限（与 `CHAT_LIMITS` 同一份常量）

| 项 | 上限 | 常量 |
| --- | --- | --- |
| 消息条数 | 50 | `CHAT_LIMITS.maxMessages` |
| 单条字符数 | 8000 | `CHAT_LIMITS.maxMessageChars` |
| 合计字符数 | 32000 | `CHAT_LIMITS.maxTotalChars` |
| 请求体字节数 | 131072（128 KiB） | `CHAT_LIMITS.maxBodyBytes` |

前端应在发送前用同一组常量做预检：超限时直接提示用户，不必打一次必然失败的请求，也不用自己复制一份数字。

### 3.3 校验顺序（服务端）

顺序是契约的一部分，因为**先失败的那一项决定了用户看到什么错误**。

| # | 检查 | 失败返回 |
| --- | --- | --- |
| 1 | `Content-Length` / 实际读取字节 > `maxBodyBytes` | `400 INVALID_REQUEST` |
| 2 | 按 IP 的本地限流 | `429 AI_RATE_LIMITED` |
| 3 | JSON 解析 | `400 INVALID_REQUEST` |
| 4 | 结构校验（字段、类型、role 枚举、content 非空白） | `400 INVALID_REQUEST` |
| 5 | 条数 / 单条长度 / 合计长度 | `400 INVALID_REQUEST` |
| 6 | 最后一条为 `user` | `400 INVALID_REQUEST` |
| 7 | AI 配置是否就绪 | `503 AI_NOT_CONFIGURED` |
| 8 | 调用上游 | 见 §5 |

限流放在解析前：解析是 CPU 活，让被限流的请求先被挡掉，比先给它做一遍 schema 校验更省。体积检查放在限流前：`Content-Length` 是读头部就有的，比计数更便宜。

**注意**：`400` 一律不区分「太大 / 太短 / 角色非法」，具体原因只进服务端日志。对外只给一个笼统文案，避免把校验规则当探测接口用。

---

## 4. 响应契约

### 4.1 帧类型

四种，以 `type` 判别。类型定义见 `contracts.ts` 的 `ChatStreamEvent`。

| `type` | 出现次数 | 载荷 |
| --- | --- | --- |
| `start` | **恰好 1 次，必须是第一帧** | `requestId`、`messageId` |
| `text-delta` | 0 ~ N 次 | `text`（增量片段，非整句） |
| `finish` | 终止帧之一 | `reason`、可选 `usage` |
| `error` | 终止帧之一 | `error: { code, message, requestId? }` |

**顺序是强约束**：`start` → (`text-delta`)* → (`finish` | `error`)。终止帧之后不会再有任何帧。

### 4.2 为什么第一帧单独发 `start`

因为前端需要两样东西，而它们都不能靠猜：

- `messageId`：流式消息要挂进列表，必须有个稳定 id 做 React key、做「停止后重新生成」的定位。用 `Date.now()` 或自增序号会在「同时开两条会话」「刷新后恢复」时撞车。
- `requestId`：用户报错时能对上服务端日志。它同时写在响应头 `X-Request-Id` 里，方便网络面板直接看到。

`start` 必须在**任何上游调用之前**发出，这样即使上游立刻失败，前端也已经有消息壳可以渲染错误态。

### 4.3 `finish.reason` 的三种取值

| 值 | 含义 | 前端应做什么 |
| --- | --- | --- |
| `stop` | 模型正常说完 | 结束流式态，展示完整消息 |
| `length` | 撞到 `AI_MAX_OUTPUT_TOKENS` | 结束流式态，提示「回答被截断」，提供「继续」入口 |
| `aborted` | 服务端主动终止（超时前的收尾、上游取消） | 结束流式态，按已收到的内容展示，标「已停止」 |

**`aborted` 通常到不了前端**：用户在浏览器点「停止」时连接已被 abort，写回去也没人收。它存在是为了服务端日志，以及阶段 5 把半截消息落库时能区分「停止」和「说完」。前端不要写「必须收到 finish」的断言。

### 4.4 `usage` 不可信

部分 OpenAI 兼容服务在流式下不返回用量。`usage` 是 `optional`，**不能拿来算钱、算进度、算是否被截断**（截断看 `reason === "length"`）。

### 4.5 完整示例

正常：

```
{"type":"start","requestId":"r_01J9Z3","messageId":"m_01J9Z4"}
{"type":"text-delta","text":"这段话可以"}
{"type":"text-delta","text":"再短一些："}
{"type":"text-delta","text":"「已完成。」"}
{"type":"finish","reason":"stop","usage":{"completionTokens":18}}
```

流中途失败：

```
{"type":"start","requestId":"r_01J9Z5","messageId":"m_01J9Z6"}
{"type":"text-delta","text":"这段话"}
{"type":"error","error":{"code":"AI_UNAVAILABLE","message":"AI service is unavailable.","requestId":"r_01J9Z5"}}
```

---

## 5. 错误与状态码

### 5.1 两条路径（关键）

| 路径 | 时机 | 表现 | 前端怎么判 |
| --- | --- | --- | --- |
| **A. 首个字节前失败** | 还没写任何响应体 | HTTP 4xx/5xx + `AiErrorBody` JSON | `!res.ok` |
| **B. 流中途失败** | 已写出 `start`（HTTP 头已定 200） | `200` + `type:"error"` 帧 | 解析到 `type === "error"` |

**为什么不能统一成一条**：HTTP 状态码在响应头发出时就固定了，流到一半发现上游挂了，没办法把 200 改成 502。所以必须两条都实现。**只处理 `!res.ok` 的前端会在上游中途挂掉时永远转圈**——这是本契约里最容易踩的坑。

### 5.2 错误码表（`errors.ts` 为唯一来源）

| 错误码 | HTTP | 触发场景 | 路径 | 可重试 | 前端文案方向 |
| --- | --- | --- | --- | --- | --- |
| `INVALID_REQUEST` | 400 | 体积超限、JSON 坏、结构/上限/角色不合法 | A | 否 | 「输入内容不符合要求」 |
| `AI_NOT_CONFIGURED` | 503 | 缺 `AI_API_KEY` / `AI_MODEL` / `AI_BASE_URL` | A | 否 | 「AI 功能尚未配置」 |
| `AI_UNAUTHORIZED` | 502 | 上游 401/403 | A / B | 否 | 「服务暂时不可用」，同时告警 |
| `AI_RATE_LIMITED` | 429 | 本地限流或上游 429 | A / B | 是（退避） | 「请求过于频繁，稍后再试」 |
| `AI_TIMEOUT` | 504 | 超过 `AI_TIMEOUT_MS` | A / B | 是 | 「响应超时」，给重试按钮 |
| `AI_UNAVAILABLE` | 502 | 上游 5xx、连接失败 | A / B | 是 | 「服务暂时不可用」，给重试按钮 |
| `STREAM_ABORTED` | 499（仅内部） | 客户端断开 | A | 否 | 不展示错误，标「已停止」 |
| `INTERNAL_ERROR` | 500 | 未分类异常 | A / B | 是（一次） | 通用错误 |

**`AI_UNAUTHORIZED` 为什么是 502 而不是 401**：401 的语义是「你的请求没通过认证」，会把用户误导成「我登录有问题」。真实原因是**服务端**配置的密钥不对，对用户而言就是上游不可用。

**`STREAM_ABORTED` 的 499** 是 nginx 的非标准码，仅内部使用：客户端已经走了，这个状态不会真的写回浏览器，保留它是为了日志能区分「用户停止」和「服务出错」。

### 5.3 错误响应体（路径 A）

```json
{
  "error": {
    "code": "AI_NOT_CONFIGURED",
    "message": "AI service is not configured.",
    "requestId": "r_01J9Z7"
  }
}
```

`message` 是笼统英文兜底，**不要直接展示给用户**。按 `code` 去 `messages/*.json` 取本地化文案（归角色 C）。`requestId` 可选，用于把用户反馈对上日志。

### 5.4 重试语义

| 场景 | 建议 |
| --- | --- |
| 用户点「停止」 | 不自动重试，保留已收内容 |
| `429` | 前端不做自动重试（会加剧限流），提示用户手动重试 |
| `502` / `504` | 可自动重试 1 次，间隔 ≥1s；再失败交给用户 |
| `503 AI_NOT_CONFIGURED` | 永远不重试，这是部署配置问题，重试 100 次也一样 |
| `500` | 自动重试 1 次，仍失败给通用提示 |

**重试必须整轮重来**，不能「从断点续」——服务端是无状态的，没有断点这个概念。

---

## 6. abort 与超时

### 6.1 客户端中止（用户点「停止」）

```
前端 AbortController.abort()
  → 浏览器断开连接
  → 服务端 request.signal 触发 abort
  → 服务端把同一个 signal 传给上游 streamText({ abortSignal })
  → 上游停止生成，不再计费
  → 服务端记录 STREAM_ABORTED(499)，不写任何帧
```

**必须做到**：abort 一路透传到上游。只关掉自己的响应而让上游继续生成，等于用户按了停止、账单还在涨。

**前端写法**：`fetch(url, { signal })`，把同一个 `AbortController` 也用在超时上（`AbortSignal.timeout` 只能单选一个，需要 `AbortSignal.any([userSignal, timeoutSignal])`）。

### 6.2 服务端超时（`AI_TIMEOUT_MS`，默认 60000）

**定义**：从建立上游连接到**最后一帧写完**的总时长预算，不是「首字节超时」。

超时发生时：

- 还没写响应体 → 路径 A，`504 AI_TIMEOUT`
- 已在流式中 → 路径 B，发 `error` 帧（`code: "AI_TIMEOUT"`）再关流

**为什么不做首字节超时 + 总时长两套**：两个预算的组合规则会让「到底该报哪个错」变得不可预测，前端和测试都难写。一个总预算够用，且行为确定。

### 6.3 服务端主动收尾

超时或上游异常但连接仍活着时，服务端**先补一个 `finish`/`error` 帧再关流**，而不是直接断连接。直接断会让前端分不清「说完了」和「网卡了」。

---

## 7. 限流

| 项 | 值 |
| --- | --- |
| 维度 | 按 IP |
| 窗口 | 60 秒 |
| 上限 | 20 次（**提案值，阶段 4 可调**） |
| 存储 | 进程内存 |
| 超限 | `429 AI_RATE_LIMITED` |

**必须写进文档的局限**：内存计数在多实例 / Serverless 下**不共享**，N 个实例就等于 N 倍配额；实例重启计数清零。所以它是「防手滑和低烈度滥用」的下限保护，不是真正的配额系统。阶段 5 再考虑持久化（Redis / 数据库）。

IP 取法：优先 `x-forwarded-for` 第一段，取不到用连接地址。这两个值都可能被伪造或缺失，所以只当粗粒度限流用，**不做任何鉴权判断**。

---

## 8. 前端消费方式（角色 C 可直接抄）

### 8.1 参考实现

```ts
import type { ChatStreamEvent } from "@/lib/ai/contracts";

type Handlers = {
  onStart: (requestId: string, messageId: string) => void;
  onDelta: (text: string) => void;
  onFinish: (reason: "stop" | "length" | "aborted") => void;
  onError: (code: string) => void;
};

export async function streamChat(
  messages: { role: "user" | "assistant"; content: string }[],
  handlers: Handlers,
  userSignal?: AbortSignal,
) {
  // 用户停止 + 超时必须合并成同一个 signal，否则两者只能生效一个
  const signal = userSignal
    ? AbortSignal.any([userSignal, AbortSignal.timeout(120_000)])
    : AbortSignal.timeout(120_000);

  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch (err) {
    // 用户主动停止会抛 AbortError，不要当错误展示
    if (signal.aborted && userSignal?.aborted) return;
    handlers.onError("AI_TIMEOUT");
    return;
  }

  // 路径 A：首个字节前失败
  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => null);
    handlers.onError(body?.error?.code ?? "INTERNAL_ERROR");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let terminal = false;

  try {
    while (!terminal) {
      const { done, value } = await reader.read();
      if (done) break;

      // stream: true —— 一个 UTF-8 多字节字符可能被拆在两个 chunk 之间
      buffer += decoder.decode(value, { stream: true });

      let newline = buffer.indexOf("\n");
      while (newline >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf("\n");
        if (!line) continue;

        const event = JSON.parse(line) as ChatStreamEvent;
        switch (event.type) {
          case "start":
            handlers.onStart(event.requestId, event.messageId);
            break;
          case "text-delta":
            handlers.onDelta(event.text);
            break;
          case "finish":
            terminal = true;
            handlers.onFinish(event.reason);
            break;
          case "error":
            // 路径 B：流中途失败
            terminal = true;
            handlers.onError(event.error.code);
            break;
          default:
            // 未来新增的帧类型：忽略，不要抛错，否则旧前端会被新后端打挂
            break;
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}
```

### 8.2 四个容易写错的点

1. **`TextDecoder` 必须带 `{ stream: true }`**。中文一个字 3 字节，chunk 边界很可能切在字符中间，不加会出乱码。
2. **必须按 `\n` 切缓冲区**，不能假设「一个 chunk = 一个 JSON」。网络层完全不保证这个。
3. **`error` 帧也要停止读取**，不是只处理 `finish`。
4. **`default` 分支要忽略未知 `type`**。这样将来加 `tool-call` 之类的帧时，旧前端不会崩（前向兼容，见 §9）。

### 8.3 UI 状态映射

| 状态 | 进入条件 | 界面 |
| --- | --- | --- |
| `idle` | 初始 / 已结束 | 输入框可用 |
| `connecting` | 已发请求，未收到 `start` | 消息壳 + 加载指示 |
| `streaming` | 收到 `start` | 追加文本，停止按钮可用 |
| `stopped` | 用户主动 abort | 保留已收内容，标「已停止」+「重新生成」 |
| `truncated` | `finish.reason === "length"` | 同上，标「回答被截断」+「继续」 |
| `error` | `onError(code)` | 按 `code` 取文案；`429/502/504` 给重试按钮 |

**空态**：收到 `start` 后到第一个 `text-delta` 之间可能间隔数百毫秒，必须显示「正在思考」，否则用户会以为卡死。
**空回复**：模型可能返回空字符串就 `finish`。`streaming` 直接进 `idle` 时，若累计文本为空，显示「没有生成内容，请换个说法」。

---

## 9. 版本与兼容

| 变更类型 | 是否递增 `CHAT_CONTRACT_VERSION` | 旧前端会怎样 |
| --- | --- | --- |
| 新增可选请求字段 | 否 | 不受影响（服务端忽略未知字段） |
| 新增帧类型 | 否 | `default` 分支忽略，正常 |
| 新增错误码 | 否 | 落到兜底文案，可接受 |
| 删除字段 / 改语义 / 改传输方式 | **是** | 必须同步升级 |

服务端在响应头回 `X-Contract-Version`。灰度期前端可比对版本号决定是否降级。

**未知字段策略**：服务端校验时**忽略**未声明的请求字段（非 strict），否则任何一次前端小版本超前都会 400。这是刻意的宽松，代价是拼写错误不会报错——用 TypeScript 类型兜住。

---

## 10. 与现有文件的一致性

| 契约条目 | 代码来源 |
| --- | --- |
| 请求结构、上限常量 | `contracts.ts` → `ChatRequest`、`CHAT_LIMITS` |
| 帧类型 | `contracts.ts` → `ChatStreamEvent` |
| 契约版本、Content-Type | `contracts.ts` → `CHAT_CONTRACT_VERSION`、`CHAT_STREAM_CONTENT_TYPE` |
| 8 条错误码 | `errors.ts` → `AI_ERROR_CODES` |
| 错误码 → HTTP | `errors.ts` → `AI_ERROR_HTTP_STATUS` |
| 错误体结构 | `errors.ts` → `AiErrorBody`（`ChatStreamError` 复用它） |

阶段 4 实现时，`route.ts` 只允许从上述两个文件取常量和类型，**不允许在路由里另写一份数字**。

---

## 11. 待评审确认的三项

这三条是我做的判断，不是规范里写死的，请在评审里明确同意或否掉：

1. **NDJSON 而非 SSE**（§2）。若选 SSE，`ChatStreamEvent` 的 JSON 结构完全不变，只换分帧方式，改动只在前端解析器和响应头。
2. **20 次/分钟/IP 的限流值**（§7）。这是提案，阶段 4 按真实用量调。
3. **超时是总预算而非首字节预算**（§6.2）。这条影响测试写法，越早定越好。

---

## 12. 本任务没做什么

- 没有创建 `src/app/api/chat/route.ts`
- 没有新增任何依赖（`zod`、`ai`、`@ai-sdk/openai-compatible` 都在阶段 4）
- 没有触碰 `docs/`、`messages/`、`package.json`、CI
- 没有实现真实 AI 调用、数据库、认证
- 没有修改 `errors.ts`（8 条错误码保持原样）
