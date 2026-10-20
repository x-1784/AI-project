# 阶段 2 收尾与验收总结

> 版本：2026-10-21
> 阶段：阶段 2（首页与视觉原型）
> 代码基线：`dev@abea92c`
> 验收分支：`feat/p2-qa-01-phase2-qa`
> 结论：**阶段 2 验收通过**（待本 PR 合并与 #21 收尾）

---

## 1. 阶段目标与范围

阶段 2 把首页、实时 3D 能量核心、中英文文案和响应式体验做成可运行、可评审的产品界面。

本阶段范围：

- 首页五个区块：首屏、能力展示、工作台预览、品牌宣言、收尾 CTA；
- 真实 WebGL 3D 能量核心（裸用 `three`，不引入 R3F / Drei）；
- 自托管品牌字体与 `nx-*` 版式阶梯；
- 中英文完整文案、SEO metadata 与语言切换；
- WebGL 回退、`prefers-reduced-motion`、离屏暂停、窄屏降级。

不在本阶段范围：`/api/chat`、真实 AI 调用、数据库、认证、E2E 测试框架。

---

## 2. 交付清单

### 2.1 @x-1784（基础设施、i18n、布局、共享 UI、质量与文档）

| PR | 内容 |
| --- | --- |
| #26 | `dev` 必需 `quality` 检查与门禁文档 |
| #27 | 共享 UI 基础组件与 `nx-*` 设计 token |
| #30 | 1280 容器、单光源、skip link |
| #32 | 首页 i18n key、`x-default` 与 og locale alternate |
| #35 | 自托管 Inter / Space Grotesk 与 `nx-display` / `nx-h1` / `nx-h2` / `nx-lead` |
| #36 | 3D 技术基线统一为「裸用 three」 |
| #38 | 修复 `#composer` 锚点遮挡、Hero `aria-labelledby`、英文 H1 空格 |
| 本 PR | 阶段 2 验收记录与截图 |

### 2.2 @BJSH-1（视觉与 3D）

| PR | 内容 |
| --- | --- |
| #25 | 设计 token 与视觉语言 |
| #29 | 首页信息架构与首屏构图（`HOME_IA.md`） |
| #33 / #34 | `three` 依赖与实时 3D 能量核心 |
| #37 | 首页五个区块实现与响应式 |
| #39 | 删除重复的 `nx-*` 版式类 |
| #40 | 离开视口暂停、reduced motion 静态帧、窄屏 `compact` 档、HiDPI 修复 |

### 2.3 @Nanami1-1（AI 与评审）

| PR | 内容 |
| --- | --- |
| #28 | 冻结 `/api/chat` 接口契约（仅文档） |
| #31 | 阶段 2 评审检查清单（Draft，待收尾） |

---

## 3. 验证记录

### 3.1 验证环境

| 项 | 值 |
| --- | --- |
| 系统 | Windows 11 Home China 10.0.26200 |
| Node | v24.18.0 |
| pnpm | 11.22.0 |
| 浏览器 | Chrome 155.0.8059.80 headless + CDP |
| 构建 | `pnpm build && pnpm start`（生产构建） |
| 代码基线 | `dev@abea92c` |

### 3.2 质量门禁

| 命令 | 结果 |
| --- | --- |
| `pnpm format:check` | All matched files use Prettier code style! |
| `pnpm lint` | exit 0 |
| `pnpm typecheck` | `next typegen && tsc --noEmit`，exit 0 |
| `pnpm build` | 通过；`/zh-CN`、`/en` 静态预渲染，`/api/health` 动态 |

### 3.3 双语与响应式

`document.documentElement.scrollWidth` 与视口对比，中英各 8 档：

| 视口 | 中文 scrollWidth | 英文 scrollWidth | 页面级横向滚动 |
| --- | --- | --- | --- |
| 360 | 360 | 360 | 无 |
| 390 | 390 | 390 | 无 |
| 640 | 640 | 640 | 无 |
| 700 | 700 | 700 | 无 |
| 767 | 767 | 767 | 无 |
| 768 | 753 | 753 | 无（15px 滚动条） |
| 1024 | 1009 | 1009 | 无（15px 滚动条） |
| 1440 | 1425 | 1425 | 无（15px 滚动条） |

- 1024 档有 5 个元素（工作台预览的倾斜面板）超出视口右边界，被 section 的 `overflow-hidden` 裁切，符合 `HOME_IA` §5 的「预览溢出」意图，`document` 不产生横向滚动；
- 标题字体为 Space Grotesk；中文 `letter-spacing: normal`，英文 `-0.02em`；
- 360 / 390 中文标题两行，英文三行，均无截断。

截图见 `docs/design/phase2-qa/`。

### 3.4 可访问性

| 检查 | 结果 |
| --- | --- |
| 标题层级 | `h1` ×1、`h2` ×4、`h3` ×1 |
| 区块标注 | 5 个 `<section>` 均有 `aria-labelledby`，目标文本非空 |
| Skip link | 首个 Tab 为「跳到主要内容」，指向 `#main-content` |
| 键盘顺序 | skip link → 品牌 → 首页 → 语言切换 → 输入框 → 发送 → 4 个快捷入口 → 收尾 CTA |
| 焦点可见 | 每个 Tab 停靠点 `:focus-visible` 均为 true，焦点环可见 |
| 锚点 | 收尾 CTA → `#composer`，`composerTop = 65`，与 64px + 1px 边框的 header 对齐 |
| 3D | canvas `aria-hidden="true"`、`pointer-events: none`；回退 SVG 带 `能量核心静态预览` 标签 |
| 动态 | `prefers-reduced-motion: reduce` 下停止自动动画 |

### 3.5 3D、性能与回退

| 检查 | 结果 |
| --- | --- |
| Canvas 数量 | 所有档位均为 1（SSR 首屏为 SVG 轮廓，动态加载后替换） |
| 满档 | rAF 241/s |
| reduced motion 实时切换（不刷新） | **0** |
| 取消 reduced motion | 240/s |
| 滚出首屏 | **0** |
| 滚回首屏 | 244/s |
| 跨 767px 断点 | 场景重建，`compact` / `full` 切换生效 |
| DPR 2 × 390 | canvas 显示 242×287 = 容器，backing store 比 1.249 |
| DPR 2 × 1440 | canvas 显示 713×1080 = 容器，backing store 比 1.5 |
| `--disable-webgl --disable-webgl2` | canvas 0，SVG 回退可见 |
| 控制台错误 | 0 |

`compact` 档为 800 粒子 / DPR 1.25，数值取自 `HOME_IA` §7.2；真机帧率未在阶段 2 实测（见 §5）。

### 3.6 语言切换与 SEO

语言切换（`/zh-CN?qa=lang&x=1` → 点击切换）：

- 路径变为 `/en?qa=lang&x=1`，查询参数保留；
- `NEXT_LOCALE=en` 写入 cookie；
- `<html lang>` 与 H1 同步切换，无整页刷新。

SEO：

| 项 | 中文 | 英文 |
| --- | --- | --- |
| `title` | NEBULA AI — AI 创意宇宙 | NEBULA AI — AI Creative Universe |
| `description` | 非空 | 非空 |
| `hreflang` | `zh-CN` / `en` / `x-default` → `/zh-CN` | 同左 |
| `og:locale` | `zh_CN` | `en_US` |
| `og:locale:alternate` | `en_US` | `zh_CN` |

### 3.7 安全与残留检查

| 检查 | 结果 |
| --- | --- |
| `console.log` / `debugger` | `src/**` 无命中 |
| 密钥 / 私钥模式 | 无命中 |
| 受版本控制的环境文件 | 仅 `.env.example` |
| `/api/chat`、数据库、认证 | 未实现（阶段 2 范围外） |

---

## 4. 验收结论

对照 #22 的验收标准：

- [x] 首页视觉完整，有明确品牌识别度；
- [x] 3D 能量核心为真实 WebGL 实时渲染，不是静态图片；
- [x] 3D 不阻塞输入、滚动和导航（`pointer-events: none`，离屏暂停）；
- [x] 中英文完整，无硬编码文案，无溢出；
- [x] 360 / 390 / 768 / 1024 / 1440 可用（另测 640 / 700 / 767）；
- [x] WebGL 回退、低性能模式、`prefers-reduced-motion` 可用；
- [x] 键盘焦点可见，主要控件有可访问标签；
- [x] `pnpm format:check`、`pnpm lint`、`pnpm typecheck`、`pnpm build` 通过；
- [x] 所有 PR 至少 1 人评审，CI 通过。

---

## 5. 遗留问题与风险

| 问题 | 影响 | 负责人 | 后续动作 |
| --- | --- | --- | --- |
| `compact` 档真机帧率未测 | 中 | @BJSH-1 | 阶段 3 起始在 Android / iPhone 实测，必要时调 `particles` 或 `detail` |
| 无 E2E 自动化，QA 为手动脚本 | 低 | @x-1784 | 阶段 3 评估引入 Playwright；当前保留本文档作为回归清单 |
| #21 / PR #31 仍为 Draft | 中 | @Nanami1-1 | 阶段 2 关闭前推上来，完成安全 / 性能清单 |
| `probeWebGL()` 结果在页面生命周期内缓存 | 低 | @BJSH-1 | 目前可接受；若遇到 context 恢复场景再改为可重试 |
| `/api/chat` 未实现 | 设计内 | @Nanami1-1 | 阶段 3 实现，契约已在 #28 冻结 |
| 1024 档预览面板溢出右边界 | 设计内 | — | 无，section 已裁切且无页面滚动 |
| `nx-h2` 中文行高 1.19 高于 `nx-h1` / `nx-display` | 设计内 | — | 无，小标题密排需要更多呼吸，已实测无挤压 |

---

## 6. 阶段 3 入口条件

- #19（本 Issue）关闭；
- #21 完成并合并 PR #31；
- 阶段 3 聊天契约保持 #28 的冻结版本；
- 无阻塞级缺陷。

---

## 7. 变更记录

| 日期 | 变更 | 作者 |
| --- | --- | --- |
| 2026-10-21 | 初稿：阶段 2 验收记录与截图 | @x-1784 |
