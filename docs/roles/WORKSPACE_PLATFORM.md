# 工作台、国际化与质量（@x-1784）

> 负责人：`@x-1784`（默认建议，可协商调整）  
> 工作分支：从最新 `dev` 切出的 `feat/workspace-*`、`feat/i18n-*`、`chore/*`、`docs/*`，或你的个人分支  
> 配套阅读：`docs/PROJECT_BRIEF.md`、`docs/TEAM_PLAYBOOK.md`、`docs/AI_ONBOARDING.md`、`CLAUDE.md`

---

## 1. 你的使命

你是项目的“集成者”和“质量守门人”。

你负责让三个人和三套 AI 的成果能够稳定地拼在一起：项目基础设施、国际化、共享 UI、AI 工作台、测试、CI、部署和文档。你也要确保主分支始终可运行、可构建、可交付。

这个角色不是“帮别人收尾”，而是对项目的整体可用性负责。

---

## 2. 你负责的范围

### 2.1 主要目录与文件

- 项目根配置：`next.config.*`、`tsconfig.json`、ESLint、Prettier、Tailwind、`package.json`、`pnpm-lock.yaml`；
- `src/app/[locale]/layout.tsx`、`not-found.tsx`、`globals.css`；
- `src/app/[locale]/chat/**`、`settings/**`（阶段 5）；
- `src/app/api/health/**`（@Nanami1-1 提供响应契约）；
- `.env.example`（结构由你维护，AI/数据库变量名由 @Nanami1-1 提出）；
- `src/components/ui/**`、`layout/**`、`chat/**`、`common/**`；
- `src/features/chat/**`；
- `messages/zh-CN.json`、`messages/en.json`；
- `src/lib/i18n/**`、`src/lib/utils/**`、`src/config/**`、`src/types/**`；
- `tests/**`；
- `.github/**`（CI、PR/Issue 模板、CODEOWNERS）；
- `README.md`、`CLAUDE.md`、`docs/**`；
- 部署配置和部署文档；
- Git 分支保护、合并策略和发布流程。

### 2.2 你负责

- 阶段 1 的项目初始化与基础设施；
- next-intl 路由、语言资源、语言切换、Cookie 持久化、SEO 元数据；
- 基础布局、导航、页脚、错误边界、加载/空状态；
- `/api/health` 的最小实现（@Nanami1-1 提供响应契约）；
- AI 对话工作台 UI、消息渲染、复制、停止/重试、空状态；
- 共享 UI 组件和无障碍规范；
- 测试基础设施、双语/响应式/可访问性回归；
- CI、分支保护、PR 流程和发布；
- 维护 `CLAUDE.md` 和团队文档；
- 集成 @BJSH-1 和 @Nanami1-1 的成果，解决接口和合并冲突。

### 2.3 你不负责

- 3D shader、粒子、首页视觉编排（@BJSH-1 负责）；
- AI provider、流式后端、数据库、认证内部实现（@Nanami1-1 负责）；
- 未经协商修改 @BJSH-1 / @Nanami1-1 的专有目录。

---

## 3. 分阶段任务

### 阶段 1：基础设施（已完成技术验收）

- [x] 确认团队分工和文档合并；
- [x] 用 pnpm 初始化 Next.js App Router + TypeScript + Tailwind + ESLint；
- [x] 锁定兼容版本，避免 React 与 R3F 版本冲突；
- [x] 建立目录结构和路径别名；
- [x] 建立设计 token、全局背景和字体基线；
- [x] 建立 `messages/zh-CN.json` 与 `messages/en.json`；
- [x] 配置 next-intl：
  - [x] `zh-CN` 为默认；
  - [x] `/` 跳转 `/zh-CN`；
  - [x] 关闭 Accept-Language 自动检测；
  - [x] 用户显式切换后写入 Cookie；
  - [x] 非法 locale 最终返回 404（`/fr` 会先 307 到 `/zh-CN/fr`，记录为阶段 2 小修）；
- [x] 建立导航、页脚、语言切换；
- [x] 建立错误边界、加载状态、404；
- [x] 建立 `/api/health` 的最小实现（@Nanami1-1 提供响应契约）；
- [x] 编写 `.env.example`、README、启动说明；
- [x] 添加 `.gitignore`、`.gitattributes`；
- [x] 添加 CI 工作流；
- [x] 配置 `main`/`dev` 分支保护；
- [x] 运行 `pnpm format:check`、`pnpm lint`、`pnpm typecheck`、`pnpm build`；
- [x] 实际验证中英文和根路径跳转。

> 阶段 1 技术验收记录见 `docs/PHASE1_SUMMARY.md`；语言切换按钮的实际点击与多尺寸视觉检查在阶段 2 首页实现时补做。

### 阶段 3：AI 工作台 UI

- [ ] 对话页面布局（消息区、输入区、历史区）；
- [ ] 用户/AI 消息区分；
- [ ] Markdown 渲染；
- [ ] 代码块与复制按钮；
- [ ] 复制回答；
- [ ] 停止生成；
- [ ] 重新生成/继续对话；
- [ ] 新建对话；
- [ ] 对话列表和历史记录（真实持久化前必须明确标注本地/演示）；
- [ ] 加载、失败、重试、空状态；
- [ ] 首次使用引导；
- [ ] 流式渲染性能控制；
- [ ] 中英文与移动端检查；
- [ ] 演示模式明显标注“非真实 AI”。

### 阶段 5：用户与数据界面集成

- [ ] 登录/注册/退出界面；
- [ ] 设置页：语言偏好、账号信息；
- [ ] 历史记录与作品列表；
- [ ] 文件管理界面；
- [ ] 错误与未授权状态；
- [ ] 与 @Nanami1-1 的认证/数据库接口联调；
- [ ] 权限与数据隔离的前端状态处理（最终权限仍由服务端校验）。

### 阶段 6：测试、性能与部署

- [ ] 单元测试、组件测试、E2E；
- [ ] 中英文回归；
- [ ] 响应式回归；
- [ ] 可访问性检查；
- [ ] 3D 降级验证；
- [ ] 生产构建；
- [ ] 部署配置；
- [ ] 环境变量说明；
- [ ] 常见故障排查文档；
- [ ] 发布流程演练。

---

## 4. 国际化实现要点

### 4.1 路由

```text
/            → /zh-CN
/zh-CN/...   → 中文
/en/...      → 英文
```

- 使用 `next-intl`；
- `defaultLocale = 'zh-CN'`；
- `localeDetection: false`；
- 用户显式切换语言后写入 `NEXT_LOCALE` Cookie；
- 非法 locale 返回 404；
- 注意 Next.js 当前版本的 `middleware` / `proxy` 约定，以官方文档为准；
- 验证根路径、语言切换、刷新恢复、直接访问深链接。

### 4.2 文案

- 所有用户可见文案放在 `messages/`；
- key 结构保持一致；
- 中英文都要自然、专业，不机械翻译；
- 新增 key 时同时补齐两种语言；
- 服务端错误返回错误码，前端映射到当前语言；
- 页面 metadata、`hreflang`、Open Graph、aria-label 都要双语。

### 4.3 状态保留

- 语言切换保留路径和查询参数；
- 输入草稿通过 `sessionStorage` 或提升状态保留；
- 切换后更新 `<html lang>`；
- 不整页刷新。

---

## 5. 工作台实现要点

- 流式渲染时避免每个 token 都触发昂贵 Markdown 解析，可使用节流/`useDeferredValue`；
- Markdown 默认不启用原始 HTML；如启用必须清洗；
- 代码高亮方案在阶段 3 评估，优先按需加载；
- 停止生成必须真正取消请求；
- 错误按错误码映射，不直接展示上游原文；
- 历史记录在数据库接入前只能是本地临时状态，并明确标注；
- 移动端输入区不能遮挡消息；
- 键盘发送、Shift+Enter 换行、焦点管理要可用；
- 空状态提供明确的第一步操作。

---

## 6. 质量门禁

每个阶段结束前：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

同时检查：

- 中文/英文；
- 360px / 390px / 768px / 1024px / 1440px；
- 键盘操作和焦点；
- 错误、加载、空状态；
- `prefers-reduced-motion`；
- 无密钥和调试信息残留；
- 无控制台错误。

如果某项检查无法执行，必须在汇报中说明原因，不得声称已通过。

---

## 7. 集成与发布职责

- 所有功能 PR 先合入 `dev`；
- 合并前确认 CI、评审和测试；
- `dev` 稳定后开 `dev → main` 发布 PR；
- 合并后打 tag 并记录发布说明；
- 紧急 hotfix 从 `main` 切出，修复后同时合回 `dev`；
- 维护 `CLAUDE.md`：技术基线、阶段状态、分工变化必须同步更新；
- 不在未评审的情况下修改共享规则。

---

## 8. 接手后的第一批任务

1. 阅读共享文档和本文件；
2. 确认当前分支和远程状态（最新 `dev` 为 `a5b2f46`）；
3. 阶段 1 本地复验已完成：`pnpm format:check`、`pnpm lint`、`pnpm typecheck`、`pnpm build` 和 i18n 冒烟通过；记录见 `docs/PHASE1_SUMMARY.md`；
4. Issue #3 文档修正已通过 PR #5 合并；等待 @Nanami1-1 确认关闭；
5. `/api/health` 已通过 PR #7 合并；CI run `39423560729` 通过；
6. 阶段 1 正式验收时把 `quality` 设为 `dev` 的必需状态检查；
7. 用户确认阶段 1 后，再推进阶段 2。

---

## 9. 不要做

- ❌ 在阶段 1 就生成完整首页或所有业务页面；
- ❌ 把 @BJSH-1 / @Nanami1-1 的代码直接大改后合入；
- ❌ 在组件里硬编码中英文；
- ❌ 用演示数据冒充真实 AI 或真实数据库；
- ❌ 跳过 PR 直接推送 `main`/`dev`；
- ❌ 在 CI 中放真实 AI 密钥；
- ❌ 为了赶进度省略类型检查、测试或构建；
- ❌ 在 CI 未运行或未通过时声称 CI 已通过；
- ❌ 把“能运行”当成“已完成”。
