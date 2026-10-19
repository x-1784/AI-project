# NEBULA AI 团队分工与协作说明书

> 版本：2026-10-20
> 适用对象：三名项目成员，以及每位成员使用的 AI 助手  
> 配套文档：`docs/PROJECT_BRIEF.md`、`docs/AI_ONBOARDING.md`、`CLAUDE.md`

---

## 1. 团队分工

三个人不可能同时改所有东西。我们按**纵向产品线**分工，每个人对自己的领域负最终责任，同时交叉评审，避免形成互不相通的孤岛。

默认建议如下，三人可以根据兴趣和实际能力协商互换；**一旦确定，每个领域必须有唯一负责人**，并在本文件中更新。

| 分工 | 默认负责人 | 负责领域 | 主要目录/文件 | 备份评审 |
| --- | --- | --- | --- | --- |
| 视觉与 3D 体验 | `@BJSH-1` | 设计语言、首页、3D 能量核心、动效、响应式视觉、WebGL 降级 | `src/app/[locale]/page.tsx`、`src/components/marketing/**`、`src/components/three/**` | `@x-1784` |
| AI 与后端 | `@Nanami1-1` | AI 服务层、流式接口、校验、限流、数据库、认证、存储、安全 | `src/app/api/**`（`src/app/api/health/**` 除外）、`src/lib/ai/**`、`src/lib/db/**`、`src/lib/auth/**`、`src/lib/security/**`、`prisma/**`、`drizzle/**` | `@x-1784` |
| 工作台、国际化与质量 | `@x-1784` | 项目基础设施、i18n、基础布局、对话工作台、共享 UI、测试、CI、部署、文档与集成 | `src/app/[locale]/layout.tsx`、`src/app/[locale]/chat/**`、`src/app/api/health/**`、`src/components/{ui,layout,chat,common}/**`、`src/features/chat/**`、`messages/**`、`tests/**`、`.github/**`、`docs/**`、根配置 | `@BJSH-1` / `@Nanami1-1` |

### 1.1 角色职责

#### 视觉与 3D 体验（@BJSH-1）

- 建立并维护视觉设计 token：颜色、字体、间距、圆角、边框、辉光、层级；
- 负责首页整体视觉与信息编排；
- 负责实时 3D 能量核心、shader、粒子、光带、视差与交互反馈；
- 负责入场动画、滚动层次、悬停反馈和移动端视觉降级；
- 负责 WebGL 不可用、低性能设备和减少动态效果的回退；
- 对 3D 性能、首屏体感和视觉一致性负责。

不负责：AI 接口、数据库、认证、i18n 路由实现、CI 配置。

#### AI 与后端（@Nanami1-1）

- 负责服务端 AI 调用封装、模型配置和流式响应；
- 负责 `/api/chat` 等接口的请求校验、超时、取消、错误码和限流；
- 负责阶段 5 的数据库、迁移、认证、文件元数据与用户数据隔离；
- 负责服务端安全：密钥、日志、权限、输入校验、上游错误处理；
- 为前端提供稳定的 API 契约和错误码，而不是让前端猜测后端行为。

不负责：视觉设计、前端页面排版、i18n 文案和 3D shader。

#### 工作台、国际化与质量（@x-1784）

- 负责项目基础设施、Next.js 初始化、目录、TypeScript、ESLint、CI；
- 负责 next-intl 路由、语言资源、语言切换、SEO 元数据；
- 负责导航、页脚、基础布局、错误边界、空状态和共享 UI；
- 负责 AI 对话工作台的界面、状态、Markdown、代码复制、停止/重试；
- 负责测试基础设施、双语/响应式/可访问性回归和部署文档；
- 负责集成：合并 PR、维护 `dev`、发布 `main`、维护 `CLAUDE.md` 和文档。

不负责：未与其他负责人协商就修改 3D shader 或 AI/数据库内部实现。

### 1.2 共同责任

- 每个人都要为自己功能写测试；
- 每个人都要评审别人的 PR，不能只等别人评审自己；
- 每个人都要维护中英文文案，不得把硬编码文案留给 @x-1784 清理；
- 每个人都要遵守密钥和权限规则；
- 每个人都要在不清楚时先问，而不是猜。

---

## 2. 分支模型

保留你们现有的 `main → dev → 个人分支` 结构，但增加明确的合并规则：

```text
main        ← 只接受来自 dev 的发布 PR（release）
  ↑
dev         ← 集成分支，所有功能/修复 PR 的目标
  ↑
个人分支 / 功能分支   ← 每人从最新 dev 切出
```

### 2.1 分支职责

| 分支 | 用途 | 规则 |
| --- | --- | --- |
| `main` | 可部署的稳定版本 | 禁止直接 push；只接受 `dev → main` 的发布 PR；至少 1 人 approve |
| `dev` | 日常集成 | 禁止直接 push；所有功能/修复通过 PR 合入；至少 1 人 approve；CI 可用时通过 |
| 个人分支 | 个人工作区和实验 | 例如 `xzz`；从最新 `dev` 切出，定期同步 `dev` |
| 功能分支 | 单个任务的短生命周期分支 | `feat/...`、`fix/...`、`docs/...`、`chore/...`；完成后立即开 PR |

建议：**日常任务优先使用短生命周期功能分支**。个人分支适合保存个人实验，不建议长期积累大量未合并改动，否则会频繁冲突。

### 2.2 分支命名

```text
feat/<area>-<short-description>
fix/<area>-<short-description>
docs/<short-description>
chore/<short-description>
refactor/<area>-<short-description>
```

例如：

- `feat/home-energy-core`
- `feat/chat-streaming`
- `fix/i18n-cookie`
- `docs/fix-ownership-and-status`

### 2.3 同步规则

- 每天开工前同步 `dev`；
- 功能分支完成前，把最新 `dev` rebase 到自己的分支；
- 不对 `main`、`dev` 或别人的分支执行强制推送；
- 自己独占的功能分支如确需强制推送，使用 `--force-with-lease`，并提前告知评审人；
- 冲突在自己的分支解决，不要要求别人替你解决。

---

## 3. 日常开发流程

### 3.1 开始一个任务

1. 在 GitHub Issue 或 Projects 中找到/创建任务；
2. 明确目标、范围、验收标准；
3. 从最新 `dev` 切出功能分支；
4. 只修改任务范围内的内容；
5. 本地运行检查；
6. 提交 PR 到 `dev`。

### 3.2 命令示例

```bash
git switch dev
git pull --rebase origin dev
git switch -c feat/home-energy-core

# 开发与验证
pnpm lint
pnpm typecheck
pnpm test
pnpm build

git fetch origin
git rebase origin/dev
git push -u origin HEAD
gh pr create --base dev --fill
```

如果使用个人分支：

```bash
git switch <your-branch>
git fetch origin
git rebase origin/dev
```

### 3.3 提交信息

使用 Conventional Commits：

```text
feat(hero): add realtime energy core canvas
fix(chat): abort upstream stream on stop
docs(team): add AI onboarding guide
chore(ci): add lint and typecheck workflow
```

要求：

- 一个提交做一件清晰的事；
- 不提交 `.env.local`、密钥、构建产物、编辑器的本地配置；
- 不提交与任务无关的格式化改动；
- 不手工编辑 `pnpm-lock.yaml`；发生冲突时重新 `pnpm install` 并提交生成结果。

---

## 4. Pull Request 规则

### 4.1 PR 基本要求

- PR 目标分支是 `dev`，不是 `main`；
- 一个 PR 只做一件事；
- 标题清晰，描述中包含背景、改动、验证方式和风险；
- UI 改动必须附截图或录屏；
- 关联 Issue；
- 保持 PR 尽量小；如果一个 PR 同时涉及视觉、API、数据库，应拆分。

### 4.2 合并前检查清单

- [ ] 功能符合验收标准；
- [ ] `pnpm lint` 通过；
- [ ] `pnpm typecheck` 通过；
- [ ] 相关测试通过；
- [ ] `pnpm build` 通过；
- [ ] 中文界面检查；
- [ ] 英文界面检查；
- [ ] 目标屏幕尺寸检查（至少手机 + 桌面）；
- [ ] 错误、加载、空状态已处理；
- [ ] 无密钥、无敏感信息、无调试日志残留；
- [ ] UI 改动附截图；
- [ ] 至少 1 人 approve；
- [ ] 所有 review conversation 已解决。

### 4.3 合并方式

- 功能/修复/文档 PR → `dev`：**Squash Merge**；
- `dev` → `main` 发布：**Merge Commit**，保留集成分支历史；
- 合并后删除源分支（GitHub 自动删除建议开启）；
- 不允许自己 approve 自己的 PR；
- 管理员绕过保护仅用于紧急情况，事后必须在 Issue/PR 中说明原因。

---

## 5. 代码评审

### 5.1 评审人看什么

1. **正确性**：是否实现了目标，边界条件是否处理；
2. **范围**：是否改了不该改的文件；
3. **类型与结构**：是否有 `any`、巨型组件、重复逻辑；
4. **国际化**：是否有硬编码文案，双语是否完整；
5. **安全**：是否有密钥、越权、未校验输入、XSS 风险；
6. **性能**：是否有不必要重渲染、过大依赖、3D 资源泄漏；
7. **可访问性**：键盘、焦点、对比度、减少动态效果；
8. **测试**：是否覆盖关键逻辑和失败路径；
9. **真实性**：是否存在把模拟数据说成真实 AI 的情况。

### 5.2 评审响应

- 收到 review 后尽快回应，不要长时间挂起；
- 对事不对人，先讨论方案再改代码；
- 作者负责解决所有评论，评审人确认后再合并；
- 有分歧时，回到 `PROJECT_BRIEF.md` 的目标和验收标准讨论；仍无法决定时由项目协调人拍板并记录。

---

## 6. CI 与质量门禁

阶段 1 已添加 `.github/workflows/ci.yml`，当前包含：

- `pnpm install --frozen-lockfile`；
- `pnpm format:check`；
- `pnpm lint`；
- `pnpm typecheck`；
- `pnpm build`；
- `pnpm test` 在 Vitest 接入后加入。

要求：

- 所有 PR 必须通过 CI 才能合并；
- CI 中不使用真实 AI 密钥；
- AI 相关测试使用 mock 或明确的集成测试开关；
- 构建阶段即使没有 AI 密钥也必须能完成；
- 不在日志中输出密钥、用户内容或内部堆栈。
- 当前 Actions 运行仍处于排队状态、尚未成功完成；在 CI 恢复并成功运行前，成员必须在本地运行同等检查，并在 PR 中写明实际结果，**不得声称 CI 已通过**。

---

## 7. Issue、Projects 与标签

建议使用 GitHub Projects 看板：

```text
Backlog → Ready → In Progress → In Review → Done
```

每个 Issue 至少包含：

- 背景/目标；
- 范围；
- 验收标准；
- 负责人；
- 所属阶段（Milestone）。

建议标签：

- `phase:1` … `phase:6`
- `area:visual`、`area:3d`、`area:ai`、`area:backend`、`area:frontend`、`area:i18n`、`area:infra`
- `type:feature`、`type:bug`、`type:docs`、`type:chore`
- `priority:p0`、`priority:p1`、`priority:p2`
- `status:blocked`

---

## 8. 文件所有权与冲突避免

### 8.1 所有权矩阵

> 以下使用 GitHub 名字。角色代号只保留在文档结构中，沟通和 PR 中优先用名字。

| 路径/领域 | 负责人 | 说明 |
| --- | --- | --- |
| `src/components/three/**` | `@BJSH-1` | 3D 场景、shader、粒子、回退 |
| `src/components/marketing/**` | `@BJSH-1` | 首页区块 |
| `src/app/[locale]/page.tsx` | `@BJSH-1` | 首页组合；@x-1784 负责布局和 i18n 接口 |
| `src/app/api/**`（`health/**` 除外） | `@Nanami1-1` | API Route Handlers |
| `src/app/api/health/**` | `@x-1784` | 部署探针；@Nanami1-1 提供响应契约 |
| `src/lib/ai/**` | `@Nanami1-1` | AI 服务封装 |
| `src/lib/db/**` | `@Nanami1-1` | 数据库与迁移 |
| `src/lib/auth/**` | `@Nanami1-1` | 认证与权限 |
| `src/lib/security/**` | `@Nanami1-1` | 校验、限流、日志 |
| `prisma/**`、`drizzle/**` | `@Nanami1-1` | 数据库 schema 与迁移（阶段 5） |
| `src/app/[locale]/layout.tsx` | `@x-1784` | 根布局、导航、页脚 |
| `src/app/[locale]/chat/**` | `@x-1784` | 对话工作台页面 |
| `src/components/{ui,layout,chat,common}/**` | `@x-1784` | 共享 UI 与对话组件 |
| `src/features/chat/**` | `@x-1784` | 对话状态与业务逻辑 |
| `messages/**` | `@x-1784` | i18n 资源；所有人可提 PR 加 key，@x-1784 审核结构 |
| `tests/**` | `@x-1784` | 测试基础设施；功能测试由功能负责人编写 |
| `.github/**` | `@x-1784` | CI、模板、CODEOWNERS |
| `.env.example` | `@x-1784` | 仅变量名与占位；AI/数据库变量名由 @Nanami1-1 提出 |
| `CLAUDE.md`、`README.md`、`docs/**` | `@x-1784` | 项目规则与文档；变更需 PR 和至少 1 人评审 |
| `package.json`、`pnpm-lock.yaml` | `@x-1784` | 依赖变更需说明理由；@BJSH-1 / @Nanami1-1 可提出，@x-1784 执行或评审 |
| `next.config.*`、`tsconfig.json`、ESLint/Prettier 配置 | `@x-1784` | 全局配置 |

### 8.2 共享文件规则

- 修改别人负责的目录前，先在 Issue/PR 中说明原因并 @ 负责人；
- 修改 `package.json`、`CLAUDE.md`、`messages` 结构、全局配置，必须由 @x-1784 评审；
- 不因为格式化或重命名制造大面积无关 diff；
- 发现别人代码的问题，优先开 Issue 或提出建议，不要直接大改；
- 跨领域功能由负责人共同设计接口，再各自实现；
- “Require review from Code Owners”当前保持关闭；等 `CLAUDE.md`、`docs/`、`.github/` 至少有两个共同 owner 后再启用。

---

## 9. 依赖、环境变量与密钥

### 9.1 依赖

- 不一次性安装大量未评估的依赖；
- 新增运行依赖必须说明：用途、替代方案、体积/安全影响；
- 优先使用已有技术栈的能力；
- 锁文件必须提交；
- 依赖升级单独开 PR，不与功能混在一起。

### 9.2 环境变量

- `.env.local` 不提交；
- `.env.example` 只包含变量名和占位示例；
- 每个人使用自己的本地配置；
- AI 密钥不进入聊天、Issue、PR、日志或 CI 输出；
- 生产密钥只配置在部署平台；
- 前端代码不得读取服务端密钥。

---

## 10. AI 协作规则

每个成员可能使用不同的 AI 工具。无论使用哪种工具，都必须遵守：

1. **先读文档再动手**：`PROJECT_BRIEF.md` → `TEAM_PLAYBOOK.md` → `AI_ONBOARDING.md` → 自己的角色文档 → `CLAUDE.md`。
2. **先汇报理解，再开始编码**：AI 应说明自己的角色、分支、当前阶段、负责范围和第一个任务。
3. **不跨域修改**：修改别人负责的目录前先协调。
4. **不直接推送 `main`/`dev`**：所有改动走 PR。
5. **不伪造 AI 能力**：未接入真实模型时，必须标注演示模式。
6. **不伪造验证结果**：没运行的命令就说没运行。
7. **不擅自加依赖、改架构、改数据库**：先提方案。
8. **不泄露密钥**：不读取、不打印、不提交 `.env.local`。
9. **不执行破坏性操作**：删除、重置、强推、清库必须先获得明确授权。
10. **不把 AI 生成内容当作团队决定**：重要决策由人确认，并记录在 Issue/PR/文档中。

---

## 11. 沟通与阻塞处理

- 任务进度用 Issue/Projects 更新，不依赖口头同步；
- PR 描述写清楚“做了什么、怎么验证、还有什么风险”；
- 阻塞超过一个工作时段，在 Issue 中说明：卡在哪里、已经尝试什么、需要谁决定；
- 需要跨角色决策时，@ 对应负责人和项目协调人；
- 每周至少一次简短同步：本周完成、下周计划、风险；
- 重要决策必须落到文档或 Issue，不留在聊天记录里。

---

## 12. 发布流程

1. 功能 PR 合入 `dev`；
2. `dev` 通过完整检查；
3. 从 `dev` 创建 `release/<version>` 或直接开 `dev → main` PR；
4. 发布 PR 至少 1 人 approve；
5. 合并到 `main` 后触发部署（阶段 6 配置）；
6. 打 tag（如 `v0.1.0`）并记录发布说明；
7. 如发现问题，从 `main` 开 `hotfix/...`，修复后同时合回 `dev`。

---

## 13. 新人/AI 接手检查清单

- [ ] 已阅读四份核心文档（本文件、项目总说明、AI 接手说明、角色文档）；
- [ ] 已确认自己的 GitHub 账号、角色和分支；
- [ ] 已同步 `dev`；
- [ ] 已确认当前阶段和允许的工作范围；
- [ ] 已确认不会直接推送 `main`/`dev`；
- [ ] 已确认本地 `.env.local` 不提交；
- [ ] 已向团队汇报“我理解的角色、范围和第一个任务”；
- [ ] 等待负责人确认后再开始大范围编码。

---

## 14. 角色调整

如果三人希望互换角色：

1. 在 Issue 中提出；
2. 三人确认；
3. 更新本文件和 `CODEOWNERS`；
4. 交接未完成的 Issue 和分支；
5. 不同时更换所有领域负责人，避免项目失去上下文。

默认分工只是起点，不是终身绑定。**清晰的所有权和稳定的接口，比“谁更厉害”更重要。**
