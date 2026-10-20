# 阶段 2 评审检查清单

> 本体文件服务于 Issue #21（P2-REVIEW-01），供阶段 2 期间每批评审复用。
> 配套的批次记录见同目录 `2026-10-20-phase2-review-01.md`。
> 归属：本文件位于 `/docs/` 下，`CODEOWNERS` 指向 `@x-1784`，新增或大改需协调人确认位置。

## 1. 使用方式

1. 拿到 PR 后，先跑 §3.0 的基线命令，确认基线可信；
2. 按 §3.1–§3.8 逐维过一遍，只记录**有证据**的结论；
3. 每条发现标 P0/P1/P2/P3，写明文件与行号、判定依据、修复方向；
4. 结论只给三种：`Approve` / `Request changes` / `Comment`（口径见 §5）；
5. 每批在 `docs/reviews/` 留一份记录，Issue #21 同步进展。

**边界**：评审只做只读检查与结论输出，不直接改被评审的代码；需要修复时由原作者在其分支完成。

## 2. 严重度定义

| 级别 | 含义 | 处理 |
| --- | --- | --- |
| P0 | 密钥泄漏、越权、生产不可用、伪造功能或测试结果 | 阻塞合并，当轮必须修复 |
| P1 | 违反项目硬性规则，或引入明确可预见风险 | 合并前修复，或由协调人书面豁免并留 Issue |
| P2 | 一致性、可维护性问题，不影响本轮功能 | 记入 Issue 跟进，不阻塞 |
| P3 | 观察项与后续建议 | 仅记录 |

## 3. 检查维度

### 3.0 基线（每次评审先做）

- [ ] `pnpm install --frozen-lockfile` 后 `node_modules` 完整（异常时先修复，不要在损坏依赖上跑结论）
- [ ] `pnpm typecheck` / `pnpm lint` / `pnpm build` 通过
- [ ] 记录本次评审实际针对的提交（PR head sha），以及**未独立验证**的部分

### 3.1 服务端 / 客户端边界

- [ ] 新增 `"use client"` 有必要：确实使用浏览器 API、状态或事件；纯展示组件不随手标记
- [ ] Server Component 未误用 `window` / `document` / `localStorage`
- [ ] 服务端密钥、`src/lib/ai/**`、数据库客户端未进入客户端可达模块图
- [ ] 消费仅类型契约时使用 `import type`，避免把服务端模块拉进客户端包
- [ ] barrel 文件（`index.ts`）同时导出客户端与服务端组件时，确认引用方仍能正确划分边界

验证：`pnpm build` 通过；反向测试（在 client 组件里 import 服务端模块应报错）。

### 3.2 密钥与凭据

- [ ] 环境变量只读自 `process.env`，不写死默认密钥
- [ ] 仅 `NEXT_PUBLIC_*` 允许进入客户端，其余不得出现在 client 模块
- [ ] `.env*` 未提交；`.env.example` 只有占位符
- [ ] 日志与错误响应不回传密钥原文

验证：`grep -rn "process.env" src/`；检查 diff 是否触及 `.env*`。

### 3.3 输入与输出安全

- [ ] 外部输入有类型与长度约束
- [ ] 不使用 `dangerouslySetInnerHTML`
- [ ] 跳转目标不是未校验的用户输入
- [ ] `new URL(...)` 等构造对外部值有兜底，不抛未捕获异常

### 3.4 3D 与资源生命周期

- [ ] `WebGLRenderer` / `Scene` / `Texture` / `Geometry` / `Material` 在卸载时 `dispose()`
- [ ] 事件监听、`requestAnimationFrame`、`ResizeObserver` 在 cleanup 中移除
- [ ] 页面隐藏或路由离开时停止渲染循环
- [ ] 无 3D 的 PR 明确声明「本 PR 不含 3D」，避免静态图冒充

验证：多次切换路由后 `renderer.info.memory` 不持续增长；控制台无 WebGL context lost 警告。

### 3.5 性能

- [ ] `backdrop-filter` / `filter` / 大面积阴影是否叠加在动画层或 3D 层上
- [ ] sticky / fixed 与 blur 组合产生的合成层数量
- [ ] 首屏 JS 体积变化（新增 client 组件、新增依赖）
- [ ] 图片带尺寸或走 `next/image`，避免 CLS
- [ ] 渐变与阴影数量收敛（本项目要求单光源）

验证：`pnpm build` 输出路由体积；DevTools Performance 录制滚动 3 秒。

### 3.6 可访问性

- [ ] 键盘可达：交互元素 Tab 可达，焦点可见
- [ ] skip link 存在，跳转目标带 `tabIndex={-1}`，且留出 sticky header 高度
- [ ] 地标唯一：`header` / `nav` / `main` / `footer` 各一个，标题层级连续
- [ ] 对比度：正文 ≥ 4.5:1，大字 ≥ 3:1；`--nx-ink-4` 仅装饰，不承载文字
- [ ] 状态变化有 `role="status"` 或 `aria-live`；loading 有可读文本而非只转圈
- [ ] `prefers-reduced-motion` 生效

验证：纯键盘走完全流程；对比度按 WCAG 2.1 相对亮度公式实算，不采信主观判断。

### 3.7 国际化（项目硬要求）

- [ ] 无硬编码用户可见文案（含 aria-label、title、placeholder）
- [ ] 新增 key 在 `zh-CN` 与 `en` 同时存在
- [ ] 默认语言仍为简体中文
- [ ] 语言切换后页面、查询参数、输入草稿不丢

### 3.8 设计 token 一致性

- [ ] 颜色只用 `nx-*` 语义 token，不写裸 hex / rgba
- [ ] 字号用 `text-ui` / `text-body` / `text-caption`，不散落 `text-sm` / `text-[0.7rem]`
- [ ] 容器宽度有单一来源，不在多个文件重复 arbitrary value
- [ ] tracking 用 `tracking-nx-caption`，不出现多个手写 em 值
- [ ] 圆角用 `rounded-nx-*`

## 4. 记录要求

每批记录至少包含：范围（PR 与 Issue 编号）、评审针对的提交、实测数据、分级发现、结论、未覆盖部分。数据必须来自实际执行，未验证的项标注「采信自述」。

## 5. 结论口径

| 结论 | 何时使用 |
| --- | --- |
| `Approve` | 无 P0 / P1，或 P1 已修复 |
| `Request changes` | 存在 P0，或 P1 影响正确性且必须本轮修 |
| `Comment` | 只有 P2 / P3，或需要原作者的领域判断后再定 |

结论使用 `Comment` 时，仍须把 P1 明确写进正文，避免被"非阻塞"误读为"可以不管"。
