# 阶段 2 计划：首页与视觉原型

> 版本：2026-10-20
> 状态：Active；已合入 `dev@2be2a69`，Issue #11–#22、#24 已创建
> 前置条件：阶段 1 已正式验收通过（`dev@2be2a69`，PR #8 / PR #9）
> 适用范围：@BJSH-1、@Nanami1-1、@x-1784
> 任务状态以 GitHub Issue 为准，本文件只定义计划、边界和领取规则。

---

## 1. 阶段目标

阶段 2 的目标不是“再做一个深色首页”，而是把 NEBULA AI 的视觉语言、实时 3D 能量核心和双语首页做成可运行、可评审、可持续迭代的产品界面。

本阶段必须同时满足：

- 首页第一眼有明确的品牌识别度和视觉焦点；
- 3D 能量核心是真实 WebGL 实时渲染，不是静态图片或视频；
- 3D 不阻塞输入、滚动、导航和移动端使用；
- 中英文都完整、自然，没有硬编码文案；
- 手机、平板、笔记本、桌面都可正常使用；
- 有 WebGL 回退、低性能模式和 `prefers-reduced-motion` 处理；
- 代码、文档、评审和 CI 都可追溯。

---

## 2. 范围

### 2.1 本阶段要做

- 设计 token 与视觉语言；
- 首页信息架构、首屏构图和响应式布局；
- 实时 3D 能量核心；
- 首页各区块：品牌、主标题、AI 输入入口、能力展示、工作台预览、品牌说明、页脚；
- 共享按钮、输入框、面板等基础 UI；
- 首页 i18n key、SEO、`hreflang`、语言切换；
- 导航、页脚和首页的布局集成；
- 双语、响应式、可访问性、性能和 WebGL 回退验收；
- 阶段 3 聊天接口的契约草案（只写文档，不实现接口）。

### 2.2 本阶段不做

- 不实现 `/api/chat`；
- 不接入真实 AI 模型；
- 不引入数据库、认证、文件上传；
- 不做完整对话工作台；
- 不做 Vitest / Playwright 全量测试（阶段 6 补齐）；
- 不合并旧 `BJSH` 分支的根布局、`package.json`、lockfile、`messages` 或客户端语言切换；
- 不为“平均分工”让后端角色写 3D 或视觉代码。

---

## 3. 验收标准

阶段 2 结束时，以下条件必须同时满足：

1. 首页可运行，视觉完整，有明确的品牌识别度；
2. 3D 能量核心是真实实时渲染，不是静态图片；
3. 3D 不阻塞输入、滚动、导航和主要交互；
4. 中英文界面完整，无硬编码文案，无溢出和错位；
5. 360px、390px、768px、1024px、1440px 下可用；
6. WebGL 不可用时有同色调回退；
7. `prefers-reduced-motion` 下关闭或弱化自动动画；
8. 键盘焦点可见，按钮和输入框有可访问标签；
9. 无控制台错误、无明显资源泄漏；
10. `pnpm format:check`、`pnpm lint`、`pnpm typecheck`、`pnpm build` 通过；
11. 所有 PR 至少 1 人评审，CI 通过；
12. 阶段 2 总结记录实际命令、截图、遗留问题和阶段 3 入口条件。

---

## 4. 工作流与负责人

| 工作流 | 负责人 | 主要内容 |
| --- | --- | --- |
| 视觉与 3D | `@BJSH-1` | 设计 token、首页构图、3D 能量核心、响应式视觉、回退与性能 |
| 集成与质量 | `@x-1784` | i18n、共享 UI、布局集成、双语/响应式/可访问性验收、CI、文档 |
| 契约与评审 | `@Nanami1-1` | 阶段 3 契约草案、PR 评审、安全与性能检查清单 |

> 阶段 2 是视觉密集型阶段，工作量不会平均分配。@Nanami1-1 的重心是契约、评审和安全把关，不强行参与 3D 实现。

---

## 5. 任务卡

### P2-PLAN-01 · 阶段 2 计划与任务拆分

- **负责人**：`@x-1784`
- **依赖**：阶段 1 正式验收
- **产出**：本文件；Phase 2 总追踪 Issue；子 Issue 清单；标签和里程碑
- **验收**：计划评审通过；Issue 创建完成；任务依赖和领取规则清晰
- **验证**：文档评审；Issue 链接可访问
- **状态**：✅ 已完成（PR #10，Issue #22）

### P2-INFRA-01 · 阶段 2 启动与质量门禁

- **负责人**：`@x-1784`
- **依赖**：无
- **产出**：`quality` 设为 `dev` 必需检查；核对里程碑、标签和 Issue；合并 kickoff 文档 PR #23；发出领取提示词
- **验收**：`quality` 是 `dev` 必需检查；Issue/标签/里程碑可用；PR #23 合并；无业务代码改动
- **验证**：检查分支保护；检查 Issue 列表；PR #23 CI 通过

### P2-DESIGN-01 · 设计 token 与视觉语言

- **负责人**：`@BJSH-1`
- **依赖**：P2-PLAN-01
- **产出**：颜色、背景层级、文字层级、强调色、辉光、边框、圆角、间距、字体层级、动效原则的 token 方案；在 Issue/PR 中说明，不直接改 `CLAUDE.md`
- **涉及**：设计说明；全局 CSS token 由 @x-1784 协调合入
- **验收**：token 命名语义化；深色背景对比度足够；中英文标题层级可用；减少动态效果有说明；没有一次性色值
- **验证**：设计评审；@x-1784 确认可落地

### P2-HOME-01 · 首页信息架构与首屏构图

- **负责人**：`@BJSH-1`
- **依赖**：P2-DESIGN-01
- **产出**：首页区块顺序、首屏构图、3D 核心位置、AI 输入入口、能力展示、工作台预览、页脚布局；桌面和移动端草图说明
- **验收**：不是“居中标题 + 三张同构卡片”；有主次、留白和视觉节奏；3D 与文字/背景融合；移动端不遮挡输入
- **验证**：设计评审；@x-1784 确认 i18n key 和 SEO 可落地

### P2-3D-01 · 实时 3D 能量核心

- **负责人**：`@BJSH-1`
- **依赖**：P2-DESIGN-01；3D 依赖由 @x-1784 评审后引入
- **涉及**：`src/components/three/**`
- **产出**：R3F/Drei + Three.js 场景；自定义 shader；能量球体、流动光带、粒子、Fresnel 边缘光；动态加载和客户端边界
- **验收**：真实 WebGL；不是静态图片；单 Canvas；DPR 有上限；不在每帧创建几何体/材质；组件卸载释放资源；不阻塞首屏和输入
- **验证**：浏览器实测；控制台无错误；`pnpm build`；截图记录

### P2-3D-02 · WebGL 回退、减少动态与性能

- **负责人**：`@BJSH-1`
- **依赖**：P2-3D-01、P2-HOME-02
- **涉及**：`src/components/three/**`
- **产出**：WebGL 不可用回退、低性能模式、`prefers-reduced-motion`、离开视口/标签页隐藏暂停、移动端降级
- **验收**：回退外观与 3D 核心同色调；减少动态时停止或弱化自动动画；离开视口暂停；无明显内存泄漏；移动端不明显掉帧
- **验证**：禁用 WebGL；模拟 reduced motion；切换标签页；移动端设备模拟

### P2-HOME-02 · 首页区块实现与响应式

- **负责人**：`@BJSH-1`
- **依赖**：P2-HOME-01、P2-3D-01、P2-I18N-01、P2-UI-01
- **涉及**：`src/app/[locale]/page.tsx`、`src/components/marketing/**`
- **产出**：首页各区块实现；3D 集成；响应式布局；不重复实现导航和页脚
- **验收**：首页完整；中英文不溢出；360/390/768/1024/1440 可用；键盘可用；3D 不阻塞交互
- **验证**：浏览器多尺寸检查；`pnpm format:check`、`pnpm lint`、`pnpm typecheck`、`pnpm build`；截图

### P2-I18N-01 · 首页 i18n、SEO 与语言切换

- **负责人**：`@x-1784`
- **依赖**：P2-HOME-01
- **涉及**：`messages/zh-CN.json`、`messages/en.json`、首页 metadata
- **产出**：首页所有文案 key；中英文自然表达；标题、描述、Open Graph、`hreflang`、canonical；语言切换保留路径和查询参数
- **验收**：无硬编码文案；中英文 key 结构一致；无缺失 key；切换后 `<html lang>` 和 metadata 正确；刷新后语言保持
- **验证**：`pnpm typecheck`、`pnpm build`；`curl` 检查 metadata；浏览器切换

### P2-UI-01 · 共享 UI 基础组件

- **负责人**：`@x-1784`
- **依赖**：P2-DESIGN-01
- **涉及**：`src/components/ui/**`
- **产出**：按钮、输入框、文本域、面板、徽章等首页所需基础组件；焦点态、禁用态、加载态
- **验收**：使用设计 token；键盘可操作；焦点可见；`aria` 合理；没有一次性色值；首页可复用
- **验证**：组件评审；浏览器键盘检查；`pnpm build`

### P2-LAYOUT-01 · 布局与导航/页脚集成

- **负责人**：`@x-1784`
- **依赖**：P2-HOME-01、P2-UI-01
- **涉及**：`src/app/[locale]/layout.tsx`、`src/components/layout/**`
- **产出**：导航、页脚、skip link、首页容器和间距整合；确保只有一个 header/footer
- **验收**：不重复导航/页脚；skip link 可用；sticky header 不遮挡内容；移动端布局正常
- **验证**：浏览器多尺寸；键盘 Tab；`pnpm build`

### P2-QA-01 · 阶段 2 双语、响应式、可访问性与验收

- **负责人**：`@x-1784`
- **依赖**：P2-HOME-02、P2-3D-02、P2-LAYOUT-01
- **涉及**：`docs/PHASE2_SUMMARY.md`（新建）、测试记录、截图
- **产出**：阶段 2 验收记录；双语/响应式/可访问性/性能检查结果；遗留问题清单
- **验收**：阶段 2 验收标准全部检查；问题有负责人和后续动作；CI 通过；无密钥和调试信息残留
- **验证**：`pnpm format:check`、`pnpm lint`、`pnpm typecheck`、`pnpm build`；浏览器检查；截图

### P2-CONTRACT-01 · 阶段 3 聊天接口契约草案（仅文档）

- **负责人**：`@Nanami1-1`
- **依赖**：无；可与视觉任务并行
- **产出**：`/api/chat` 请求结构、流式事件、错误码、abort、超时、消息数量/长度限制的契约草案；贴在 Issue/PR，不创建 `src/app/api/chat`
- **验收**：与 `src/lib/ai/contracts.ts` 和 `errors.ts` 一致；前端可据此设计工作台；不提前实现真实 AI
- **验证**：契约评审；不与现有类型冲突

### P2-REVIEW-01 · 阶段 2 评审与安全/性能检查

- **负责人**：`@Nanami1-1`
- **依赖**：无；贯穿阶段 2
- **产出**：主要 PR 的评审意见；3D 资源清理、客户端/服务端边界、密钥、输入安全、性能检查清单
- **验收**：主要 PR 至少 1 次评审；发现的问题有结论；不在前端引入服务端密钥
- **验证**：PR review 记录；Issue 评论

---

## 6. 依赖与顺序

```text
P2-PLAN-01
  ↓
P2-DESIGN-01
  ├─ P2-HOME-01 ── P2-I18N-01
  ├─ P2-3D-01
  └─ P2-UI-01
        ↓
P2-LAYOUT-01
        ↓
P2-HOME-02
        ↓
P2-3D-02
        ↓
P2-QA-01
```

并行项：

- `P2-CONTRACT-01` 可由 @Nanami1-1 从阶段 2 开始就做，只写契约；
- `P2-REVIEW-01` 贯穿全程；
- `P2-HOME-01` 和 `P2-UI-01` 可在设计 token 确认后并行。

---

## 7. GitHub Issue、标签与里程碑

### 7.1 里程碑

- `Phase 2 — 首页与视觉原型`

### 7.2 标签

- `phase:2`
- `area:visual`
- `area:3d`
- `area:i18n`
- `area:ui`
- `area:infra`
- `area:docs`
- `area:api-contract`
- `type:feature`
- `type:docs`
- `status:blocked`
- `status:ready`
- `status:in-review`
- `priority:p0`
- `priority:p1`
- `priority:p2`

### 7.3 Issue 清单

| 任务 | Issue | 初始状态 |
| --- | --- | --- |
| P2-PLAN-01 | [#22](https://github.com/x-1784/AI-project/issues/22) | 总追踪 Issue |
| P2-INFRA-01 | [#24](https://github.com/x-1784/AI-project/issues/24) | `status:ready` |
| P2-DESIGN-01 | [#11](https://github.com/x-1784/AI-project/issues/11) | `status:ready` |
| P2-HOME-01 | [#12](https://github.com/x-1784/AI-project/issues/12) | `status:blocked` |
| P2-3D-01 | [#13](https://github.com/x-1784/AI-project/issues/13) | `status:blocked` |
| P2-3D-02 | [#14](https://github.com/x-1784/AI-project/issues/14) | `status:blocked` |
| P2-HOME-02 | [#15](https://github.com/x-1784/AI-project/issues/15) | `status:blocked` |
| P2-I18N-01 | [#16](https://github.com/x-1784/AI-project/issues/16) | `status:blocked` |
| P2-UI-01 | [#17](https://github.com/x-1784/AI-project/issues/17) | `status:blocked` |
| P2-LAYOUT-01 | [#18](https://github.com/x-1784/AI-project/issues/18) | `status:blocked` |
| P2-QA-01 | [#19](https://github.com/x-1784/AI-project/issues/19) | `status:blocked` |
| P2-CONTRACT-01 | [#20](https://github.com/x-1784/AI-project/issues/20) | `status:ready` |
| P2-REVIEW-01 | [#21](https://github.com/x-1784/AI-project/issues/21) | `status:ready` |

> 任务状态只在 Issue 中更新，不在本文件里手动改“进行中/已完成”。

### 7.4 总追踪 Issue

标题：`[Phase 2] 首页与视觉原型 — 任务总览`

Issue：[#22](https://github.com/x-1784/AI-project/issues/22)

正文包含：

- 阶段 2 目标和验收标准；
- 所有子 Issue 的 checklist；
- 当前阻塞项；
- 当前进行中的任务；
- 阶段 2 验收记录链接。

---

## 8. AI 领取协议

### 8.1 领取前置条件

AI 只能领取同时满足以下条件的 Issue：

1. 标签包含 `phase:2` 和 `status:ready`；
2. 没有 assignee；
3. 依赖任务已关闭；
4. 任务属于自己负责的目录；
5. 负责人已确认任务可以开始。

### 8.2 领取步骤

1. 在 Issue 下评论：

```text
claiming
角色：<@GitHub 用户名>
分支：feat/<任务编号小写>-<简短描述>（例如 feat/p2-design-01-design-tokens）
计划完成时间：<日期或工作时段>
计划范围：<一句话>
```

2. 由成员账号把 Issue assign 给自己；
3. 从最新 `dev` 切分支；
4. 尽早开 Draft PR，标题带任务编号；
5. 在 PR 正文写：范围、验收标准、验证命令、风险；
6. 完成或阻塞前，不再领取第二个任务。

### 8.3 状态流转

```text
status:blocked → status:ready → 领取并 assign → Draft PR → status:in-review → PR 合并 → Issue 关闭
```

- 依赖未关闭时保持 `status:blocked`；
- 领取后由 assignee 负责更新进展；
- PR 进入评审后加 `status:in-review`；
- 合并后关闭 Issue，并在总追踪 Issue 勾选。

### 8.4 阻塞与释放

- 超过一个工作时段没有进展，在 Issue 说明原因；
- 无法继续时，移除 assignee、改回 `status:ready`，并写明已完成部分；
- 不允许占着任务不动，也不允许静默转给别人。

### 8.5 禁止

- 不跨角色领取；
- 不修改别人负责的目录而不协调；
- 不直接推送 `main` / `dev`；
- 不合并自己的 PR；
- 不伪造 3D、AI、测试或 CI 结果；
- 不在阶段 2 实现 `/api/chat`、真实 AI、数据库或认证。

---

## 9. Definition of Ready / Done

### 9.1 Ready

Issue 必须包含：

- 目标；
- 范围；
- 不做什么；
- 依赖；
- 涉及目录；
- 验收标准；
- 验证命令；
- 负责人和分支名。

### 9.2 Done

- 功能或文档完成；
- 本地 `format:check`、`lint`、`typecheck`、`build` 通过；
- UI 改动有截图；
- 双语、目标屏幕尺寸、键盘焦点已检查；
- 3D 改动检查 WebGL 回退、减少动态、离开视口暂停；
- 无密钥、无调试信息残留；
- PR 至少 1 人评审，CI 通过；
- Issue 已更新或关闭。

---

## 10. 风险

1. **旧 `BJSH` 分支不能直接合并**：它是独立脚手架，和 `dev` 的 next-intl 架构冲突；只移植 3D、首页、字体和设计 token。
2. **依赖冲突**：3D 依赖由 @BJSH-1 提出，@x-1784 评审后引入；不要在功能 PR 里顺手升级依赖。
3. **移动端性能**：3D 粒子和 DPR 必须按实测调整，不能只按桌面效果验收。
4. **i18n 冲突**：所有首页文案 key 由 @x-1784 维护；@BJSH-1 只提需求，不重构 `messages` 结构。
5. **任务重复领取**：一个 Issue 只能有一个 assignee；先评论再 assign，未 assign 不算领取。
6. **计划过期**：本文件只写稳定计划；状态、进展和阻塞全部放 Issue。
7. **阶段 3 提前开工**：@Nanami1-1 只写契约草案，不实现 `/api/chat`。

---

## 11. 阶段 2 启动顺序

1. ✅ 合并本计划 PR；
2. ✅ 创建 `Phase 2 — 首页与视觉原型` 里程碑和标签；
3. ✅ 创建总追踪 Issue #22 和子 Issue #11–#21、#24；
4. 🚧 按依赖关系把 `status:ready` 开放给对应负责人；
5. 三个人把领取提示词发给自己的 AI；
6. AI 只领取一个任务，按 Issue 流程推进；
7. 阶段 2 结束时由 @x-1784 写 `docs/PHASE2_SUMMARY.md`，用户验收。

---

## 12. 变更记录

| 日期 | 变更 |
| --- | --- |
| 2026-10-20 | 创建阶段 2 计划草案：任务拆分、依赖、Issue 清单和 AI 领取协议 |
| 2026-10-20 | 计划合入 `dev@2be2a69`；创建里程碑、标签、总追踪 Issue #22 和子 Issue #11–#21 |
| 2026-10-20 | 新增 P2-INFRA-01 #24（阶段 2 启动与质量门禁），更新 Issue 清单 |
