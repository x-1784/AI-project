# 设计 Token 与视觉语言

> 任务：Issue [#11](https://github.com/x-1784/AI-project/issues/11) `[P2-DESIGN-01]`
> 负责人：`@BJSH-1`
> 代码基线：`dev@2be2a69`
> 状态：**待 @x-1784 评审**。全局 CSS 的合入由 @x-1784 执行。
> 说明：本文档只定义 token 与视觉语言，不含首页构图（那是 `P2-HOME-01`）。

---

## 1. 范围与边界

本任务交付：颜色、背景层级、文字层级、强调色、辉光、边框、圆角、间距、字体层级、动效原则的 token 方案，以及它们与现有 `globals.css` 变量的冲突裁定。

本任务**不做**：

- 不修改 `src/app/globals.css`（该文件由 @x-1784 兜底，token 合入由他执行）；
- 不修改 `messages/**`（文案 key 只提交清单，由 @x-1784 写入）；
- 不修改 `CLAUDE.md`（Issue #11 明确要求）；
- 不做首页构图、不写 3D 组件。

---

## 2. 设计前提

### 2.1 三条否决性原则

以下三条用来否决方案，不是口号。违反任一条即退回：

1. **深空不是"黑底加发光"。** 深空感来自层次与距离：近处有细节（文字、玻璃边缘），中景有主体（能量核心），远处有背景（星尘、极弱网格、地平线光带）。判定方法——截图转灰度后仍要能看出至少三个明度带。
2. **一个视觉焦点，其余全部退让。** 首页只允许能量核心"最亮最大"。标题靠字号与字重取胜，不靠发光；按钮靠边界和位移取胜，不靠辉光。
3. **光要有来源。** 核心是唯一光源，方向定在左上方。所有辉光、玻璃高光、粒子亮度衰减都必须与这个方向自洽。

### 2.2 已冻结的三条决策

已经用户批准，不再讨论：

1. **非对称双轴构图**：桌面端核心偏右上并被上边界裁切，文字轴在左侧 40% 内垂直居中；手机端核心居中独立占位、文字下锚。
2. **字体分工**：西文展示用 Space Grotesk，UI 用 Inter，中文走系统栈；**中文字距必须归零**。
3. **紫色只做外缘高光**：主体是电光蓝 `#4B8CFF`，星云紫只出现在最外层辉光与电离青过渡里。

---

## 3. Token 全表

命名前缀 `nx-`（nebula），避免与 shadcn/ui 的默认语义变量冲突。

### 3.1 背景阶梯

不用纯黑 `#000`：纯黑会让辉光发灰、玻璃层次失效。四层递进，每层只差 3–6 个明度点。

| Token | 值 | 用途 |
| --- | --- | --- |
| `--nx-void` | `#04050A` | 页面最底层 |
| `--nx-abyss` | `#070A12` | 首屏区背景 |
| `--nx-deep` | `#0B0F1A` | 常规区块背景 |
| `--nx-shelf` | `#111726` | 抬升区块 / 卡片底 |
| `--nx-glass` | `rgba(14, 19, 36, 0.72)` | 玻璃面板填充 |

### 3.2 文字层级

对比度按 WCAG 2.1 相对亮度公式实算，基准为 `--nx-void #04050A` 与抬升面板 `--nx-shelf #111726`。

| Token | 值 | vs void | vs shelf | 允许用途 |
| --- | --- | --- | --- | --- |
| `--nx-ink` | `#ECF0F8` | 17.83:1 | 15.66:1 | 标题、正文，任意字号 |
| `--nx-ink-2` | `#A5AFC2` | 9.22:1 | 8.10:1 | 正文、说明 |
| `--nx-ink-3` | `#7A859C` | 5.49:1 | 4.82:1 | 辅助文字、占位符 |
| `--nx-ink-4` | `#434C5E` | 2.36:1 | 2.07:1 | **仅装饰**，禁止承载文字 |

说明：

- 三级文字必须 ≥4.5:1。早期方案取 `#6A748A`，实测在 `#111726` 上只有 **3.81:1**，不达标，因此上调到 `#7A859C`（两处均 ≥4.5:1）。这条会在 code review 中作为检查项。
- `--nx-ink-4` 不满足任何对比度要求，只允许用于分隔线、装饰图形，**不允许写文字**。

### 3.3 强调色

克制是关键：**每屏只允许出现一个强调色区域**。

| Token | 值 | 用途 | 约束 |
| --- | --- | --- | --- |
| `--nx-electric` | `#4B8CFF` | 主强调：主按钮、焦点环、链接、核心基色 | 在 `--nx-shelf` 上 5.53:1 |
| `--nx-electric-deep` | `#2B5FD9` | 按下态、核心暗部 | 不单独做文字色 |
| `--nx-nebula` | `#8B5CF6` | 只用于核心外缘、轨道环、渐变末端 | **禁止进入 UI 层** |
| `--nx-ion` | `#6FE3FF` | 核心高光点、极少量数据高亮 | 不做大面积填充 |

紫色一旦进入 UI 层（按钮、文字、边框），页面会往"廉价赛博朋克"滑。这条是冻结决策。

### 3.4 描边

| Token | 值 | 用途 |
| --- | --- | --- |
| `--nx-line-hair` | `rgba(255,255,255,0.06)` | 分隔线、卡片内分隔 |
| `--nx-line-base` | `rgba(255,255,255,0.10)` | 默认边框 |
| `--nx-line-strong` | `rgba(255,255,255,0.18)` | 悬停边框、聚焦前态 |
| `--nx-line-accent` | `rgba(75,140,255,0.40)` | 选中态、焦点环 |

### 3.5 辉光与阴影

只用 `box-shadow` 的扩散能力，不叠加多层。

| Token | 值 |
| --- | --- |
| `--nx-glow-core` | `0 0 120px -30px rgba(75,140,255,0.50)` |
| `--nx-glow-nebula` | `0 0 90px -30px rgba(139,92,246,0.40)` |
| `--nx-shadow-lift` | `0 24px 60px -24px rgba(0,0,0,0.85)` |

### 3.6 圆角 / 间距 / 容器 / 节奏

- **圆角**：`4 / 8 / 12 / 18 / 28 / 999`。卡片统一 `18`，按钮 `999`（胶囊）或 `12`，不混用。
- **间距**：4 基数 `4 8 12 16 24 32 48 64 96 128 160`
- **容器**：`max-width 1280px`；移动端 gutter `20px`，桌面 `32px`
- **区块纵向节奏**：桌面 `128px`，平板 `96px`，手机 `72px`

### 3.7 字体层级

字号用 `clamp()` 做流体缩放，避免在五个断点上写五套数值。

| 层级 | 规格 | 字重 |
| --- | --- | --- |
| display | `clamp(52px, 8.2vw, 104px)` / 0.98 / -0.035em | 500 |
| h1 | `clamp(36px, 4.4vw, 56px)` / 1.06 / -0.02em | 500 |
| h2 | `clamp(28px, 3vw, 38px)` / 1.15 / -0.015em | 500 |
| h3 | `22px` / 1.30 / -0.01em | 500 |
| lead | `clamp(16px, 1.5vw, 19px)` / 1.70 / +0.005em | 400 |
| body | `16px` / 1.70 | 400 |
| ui | `14px` / 1.45 | 450–500 |
| caption | `12px` / 1.40 / +0.12em / uppercase | 500 |
| mono | `13.5px` / 1.60 | 400 |

**中英文混排的两条硬规则。** 不做这两条，中英切换时中文一定又挤又闷——这是中文项目最常见的翻车点：

```css
/* 1. 中文不吃负字距：负字距是给拉丁字母收紧用的，汉字会被挤在一起 */
:lang(zh-CN) .nx-display,
:lang(zh-CN) .nx-h1,
:lang(zh-CN) .nx-h2 {
  letter-spacing: 0;
}

/* 2. 中文标题行高比拉丁高 +0.04：汉字是满字面 */
:lang(zh-CN) .nx-display,
:lang(zh-CN) .nx-h1,
:lang(zh-CN) .nx-h2 {
  line-height: 1.02;
}
```

### 3.8 动效

| 场景 | 时长 | 缓动 |
| --- | --- | --- |
| 首屏文字入场（逐行错开 60ms） | 520ms | `cubic-bezier(.22,.61,.36,1)` |
| 3D 核心淡入替换静态层 | 320ms | `ease-out` |
| 按钮 hover（位移 + 描边） | 180ms | `ease-out` |
| 输入框聚焦（焦点环展开） | 220ms | `ease-out` |
| 区块滚动进入（阈值 0.15） | 600ms | 位移 24px + 透明度 |

**禁止清单**：无限循环闪烁、`scale` 超过 1.04 的悬停、超过 400ms 的按钮反馈、首屏强制等动画结束才允许交互、滚动劫持。

**`prefers-reduced-motion: reduce` 下**：所有位移与缩放归零，保留透明度过渡（≤120ms），3D 渲染静态一帧（仍是真 WebGL，不是缺图）。

> `globals.css` 已存在一条全局 reduced-motion 规则，本节与其兼容。合入时**去重，不要写第二份**。

---

## 4. 落点方案

`dev` 现有写法是 `:root` 存真值 + `@theme inline` 映射成 Tailwind 工具类，`nx-*` 沿用同一范式，不需要额外配置。

```css
:root {
  /* 背景 */
  --nx-void: #04050a;
  --nx-abyss: #070a12;
  --nx-deep: #0b0f1a;
  --nx-shelf: #111726;
  --nx-glass: rgba(14, 19, 36, 0.72);

  /* 文字 */
  --nx-ink: #ecf0f8;
  --nx-ink-2: #a5afc2;
  --nx-ink-3: #7a859c;
  --nx-ink-4: #434c5e;

  /* 强调 */
  --nx-electric: #4b8cff;
  --nx-electric-deep: #2b5fd9;
  --nx-nebula: #8b5cf6;
  --nx-ion: #6fe3ff;

  /* 描边 */
  --nx-line-hair: rgba(255, 255, 255, 0.06);
  --nx-line-base: rgba(255, 255, 255, 0.1);
  --nx-line-strong: rgba(255, 255, 255, 0.18);
  --nx-line-accent: rgba(75, 140, 255, 0.4);
}

@theme inline {
  /* 现有 7 个变量保持不变，这里只追加 */
  --color-nx-void: var(--nx-void);
  --color-nx-abyss: var(--nx-abyss);
  --color-nx-deep: var(--nx-deep);
  --color-nx-shelf: var(--nx-shelf);
  --color-nx-glass: var(--nx-glass);
  --color-nx-ink: var(--nx-ink);
  --color-nx-ink-2: var(--nx-ink-2);
  --color-nx-ink-3: var(--nx-ink-3);
  --color-nx-ink-4: var(--nx-ink-4);
  --color-nx-electric: var(--nx-electric);
  --color-nx-electric-deep: var(--nx-electric-deep);
  --color-nx-nebula: var(--nx-nebula);
  --color-nx-ion: var(--nx-ion);
  --color-nx-line-hair: var(--nx-line-hair);
  --color-nx-line-base: var(--nx-line-base);
  --color-nx-line-strong: var(--nx-line-strong);
  --color-nx-line-accent: var(--nx-line-accent);
}

@theme {
  --font-display:
    "Space Grotesk", "Inter", "PingFang SC", "Microsoft YaHei", system-ui,
    sans-serif;
}

@layer components {
  .nx-display {
    font-size: clamp(52px, 8.2vw, 104px);
    line-height: 0.98;
    letter-spacing: -0.035em;
    font-weight: 500;
  }
  .nx-h1 {
    font-size: clamp(36px, 4.4vw, 56px);
    line-height: 1.06;
    letter-spacing: -0.02em;
    font-weight: 500;
  }
  .nx-h2 {
    font-size: clamp(28px, 3vw, 38px);
    line-height: 1.15;
    letter-spacing: -0.015em;
    font-weight: 500;
  }
  .nx-lead {
    font-size: clamp(16px, 1.5vw, 19px);
    line-height: 1.7;
    letter-spacing: 0.005em;
  }
}
```

挂上之后可直接使用 `bg-nx-void`、`text-nx-ink-2`、`border-nx-line-base`、`font-display`、`nx-display` 等，**组件里不再需要一次性色值**。

---

## 5. 与现有 `globals.css` 的冲突裁定

评审对象：`dev@2be2a69` 的 `src/app/globals.css`、`src/app/[locale]/layout.tsx`、`src/components/layout/site-header.tsx`、`site-footer.tsx`。

### 5.1 容器宽度 1152 → 1280

`dev` 的 header / footer / 首页 section 均用 `max-w-6xl`（1152px），本方案栅格按 1280px 计算。1440 屏下两侧各留 144px，视觉偏局促。

- **结论**：统一到 1280（`max-w-[80rem]`），改 3 处；
- **归属**：@x-1784。若认为成本不值，退让方案是把栅格整体缩到 1152（不推荐，12 列会挤）。

### 5.2 导航高度 64 → 保持 64

`dev` 用 `h-16`（64px），早期草图写 56px。

- **结论**：**让步到 64**，不改 `dev`。64px 更符合触控目标（44px 内容 + 上下各 10px），且改它会连带影响 sticky header、首屏起点与核心裁切量，收益远小于成本。

### 5.3 主强调色：单一来源

`dev` 的 `--accent: #6ea0ff` 与本方案的 `--nx-electric: #4b8cff` 是两套蓝，并存会导致焦点环、链接、按钮各走一套。

```css
--nx-electric: #4b8cff;
--accent: var(--nx-electric);
```

- **结论**：`--accent` 改为别名，`dev` 已写的 `text-accent`、`border-accent/60` 自动跟随，**不需要改组件**；
- **影响**：现有蓝色会略饱和，需要截图对比确认可接受。

### 5.4 `--accent-strong` 是紫色 → 必须换掉

`dev` 的 `--accent-strong: #a78bfa` 是浅紫，并被首页占位区块用作圆点底色。**紫色进入 UI 层直接违反"紫只做外缘"的冻结决策。**

- **结论**：`--accent-strong` 改为 `var(--nx-electric-deep)`（`#2B5FD9`）；紫色只保留在 `--nx-nebula`，且仅 3D 可用；
- 这是 6 条冲突里**唯一的原则级问题**，不是审美偏好。

### 5.5 `body` 双光源 → 收敛为单一左上光源

`dev` 的 `body` 背景是两个 radial 光团：`15% -10%` 与 `90% 10%`。而原则三要求"核心是唯一光源，方向左上"。

- **结论**：保留第一团（左上，与核心同向），**删除第二团**；
- 右侧环境亮度交给 3D 自身的 billboard 光晕承担（`P2-3D-01` 范围内），不在 CSS 背景里再造一个光源。

### 5.6 玻璃填充：采用 0.72

早期方案 `rgba(14,19,32,0.55)` 在深空底色上几乎看不见，层次会塌成一层（违反原则一）。

- **结论**：`--nx-glass: rgba(14, 19, 36, 0.72)`，与 `dev` 的 `--surface` 对齐，不再维护两个值。

---

## 6. 需要 @x-1784 处理的外部依赖

| # | 事项 | 内容 | 卡住的后续任务 |
| --- | --- | --- | --- |
| 1 | 容器宽 | 3 处 `max-w-6xl` → `max-w-[80rem]` | `P2-HOME-01`、`P2-LAYOUT-01` |
| 2 | 强调色别名 | `--accent` / `--accent-strong` 两行改动 | `P2-UI-01` |
| 3 | 字体文件 | `public/fonts/space-grotesk-variable.woff2`（21.8 KB）、`inter-variable.woff2`（47.1 KB）已存在于素材分支，需批准入库；在 `[locale]/layout.tsx` 用 `next/font/local` 挂载 | 品牌字标、`P2-HOME-02` |
| 4 | i18n key | 写入 `messages/zh-CN.json` 与 `en.json`（清单见 6.1） | `P2-I18N-01`、`P2-HOME-02` |

### 6.1 需要新增的 `Home` 命名空间 key

现有 `Home` 只有 `badge` / `title` / `subtitle` / `status` 四个，其中 `status`（"基础框架已就绪……"）是阶段 1 占位文案，**首页实现后应删除**。

```text
Home.hero.eyebrow              小标签
Home.hero.titleLine1           标题第一行
Home.hero.titleLine2           标题第二行
Home.hero.lead                 副文案
Home.hero.composerPlaceholder  输入框占位
Home.hero.composerHint         快捷键提示
Home.hero.send                 发送按钮无障碍标签
Home.hero.quickLabel           快捷入口分组标签
Home.hero.quick.write          快捷入口 · 写作
Home.hero.quick.summarize      快捷入口 · 总结
Home.hero.quick.code           快捷入口 · 代码
Home.hero.quick.image          快捷入口 · 绘图
Home.core.ariaLabel            3D 核心无障碍标签
Home.core.fallbackLabel        静态回退图标签
```

---

## 7. 验收自检

对照 Issue #11 的五条验收标准：

| 验收标准 | 对应内容 | 状态 |
| --- | --- | --- |
| token 命名语义化 | `nx-` 前缀 + 语义名（`void/abyss/deep/shelf/ink/electric/nebula/ion`），不使用编号式命名 | 满足 |
| 深色背景对比度足够 | 全部实算，见 3.2；`ink-4` 明确限制为装饰 | 满足 |
| 中英文标题层级可用 | 3.7 的 `clamp` 阶梯 + 中文归零字距、行高 +0.04 两条硬规则 | 满足 |
| 减少动态效果有说明 | 3.8 禁止清单 + reduced-motion 归零规则，并注明与现有规则去重 | 满足 |
| 没有一次性色值 | 第 4 节 `@theme inline` 映射，组件只允许用工具类 | 满足 |
| @x-1784 确认可落地 | 第 6 节 4 项待确认 | **待确认** |

---

## 8. 相关但未决：3D 技术基线与现有实现的冲突

本任务不处理 3D 实现，但发现一个会在 `P2-3D-01` 开工时立刻撞车的问题，先记录，需 @x-1784 裁定：

- `CLAUDE.md` §4.1 技术基线写明 3D 为 **"Three.js + @react-three/fiber + @react-three/drei"**；
- `CLAUDE.md` §7.1 复述"基于 R3F 与自定义 shader"；
- `docs/PHASE2_PLAN.md` 与 Issue #13 同样写"R3F/Drei + Three.js 场景"；
- 但素材分支 `BJSH@a831284` 的 `energy-core-canvas.tsx`（443 行）是**刻意裸用 three、不引入 R3F** 的实现。

两条路必须选一条：

- **方案 A（建议）**：修订 `CLAUDE.md` §4.1 / §7.1 与 Issue #13 的措辞，允许裸 three。理由是省掉 `@react-three/fiber`、`@react-three/drei` 与 `scheduler` 三个依赖，现有实现已在真实工程中跑通 `lint` / `typecheck` / `build`，且 GPU 资源释放是显式手写的、比自动释放更可控。
- **方案 B**：按 R3F 重写。生态更成熟、`useFrame` 更简洁，代价是 shader 与场景代码整体改造，并新增三个依赖需重新评审。

按 `CLAUDE.md` §4 的规定，替换基线技术前必须说明理由、兼容性与影响并取得确认，因此这属于**需要用户拍板**的事项，不是任务卡措辞问题。

> 2026-10-20 已拍板：采用**方案 A（裸用 three）**。`CLAUDE.md`、`docs/PHASE2_PLAN.md` 与角色文档的措辞已同步修订。

---

## 9. 变更记录

| 日期 | 变更 |
| --- | --- |
| 2026-10-20 | 创建：token 全表、对比度实算、冲突裁定、落点方案与 i18n key 清单 |
