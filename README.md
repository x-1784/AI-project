# NEBULA AI

**AI Creative Universe** — 将 AI 对话、创意生成、知识处理和个人工作空间融合在一起的沉浸式 AI 创作平台。

> 项目状态：阶段 0 → 阶段 1 过渡期。团队分工与 AI 接手文档已就绪，应用代码尚未初始化。

---

## 团队入口

无论你是团队成员还是成员的 AI 助手，请先阅读：

| 文档 | 用途 |
| --- | --- |
| [项目总体说明](docs/PROJECT_BRIEF.md) | 产品目标、视觉方向、技术架构、功能范围、阶段验收 |
| [团队分工与协作](docs/TEAM_PLAYBOOK.md) | 三人分工、分支模型、PR、评审、CI、文件所有权 |
| [AI 接手说明](docs/AI_ONBOARDING.md) | 任何 AI 开始工作前的必读规则和启动提示词 |
| [角色分配](docs/roles/README.md) | 三位成员的角色、目录和对应角色文档 |
| [CLAUDE.md](CLAUDE.md) | 项目最高优先级开发规则 |

角色文档：

- [视觉与 3D](docs/roles/VISUAL_3D.md)
- [AI 与后端](docs/roles/AI_BACKEND.md)
- [工作台、国际化与质量](docs/roles/WORKSPACE_PLATFORM.md)

---

## 团队默认分工

| 角色 | GitHub | 负责领域 |
| --- | --- | --- |
| 视觉与 3D | `@BJSH-1` | 设计系统、首页、3D 能量核心、动效、响应式视觉 |
| AI 与后端 | `@Nanami1-1` | AI 服务、流式接口、数据库、认证、安全 |
| 工作台、国际化与质量 | `@x-1784` | 基础设施、i18n、对话工作台、共享 UI、测试、CI、部署 |

分工可协商互换，但每个领域必须有唯一负责人。调整后同步更新 `docs/roles/README.md`、`docs/TEAM_PLAYBOOK.md`、`CODEOWNERS` 和 `CLAUDE.md`。

---

## 分支模型

```text
main        ← 只接受来自 dev 的发布 PR
  ↑
dev         ← 集成分支，所有功能/修复 PR 的目标
  ↑
个人分支 / 功能分支
```

- 禁止直接推送 `main` 和 `dev`；
- 功能分支命名：`feat/...`、`fix/...`、`docs/...`、`chore/...`；
- 所有 PR 至少 1 人评审；
- 功能 PR 使用 Squash Merge；`dev → main` 发布使用 Merge Commit；
- 合并后删除源分支；
- 详细规则见 [TEAM_PLAYBOOK.md](docs/TEAM_PLAYBOOK.md)。

---

## 当前阶段

```text
阶段 0 规划与团队接手      ← 当前
阶段 1 基础设施
阶段 2 首页与 3D
阶段 3 AI 工作台 UI
阶段 4 真实 AI 服务
阶段 5 数据库与用户系统
阶段 6 测试、性能与部署
```

阶段 1 将包含：

- Next.js App Router + TypeScript + Tailwind 初始化；
- next-intl 中英文路由，默认 `zh-CN`；
- 设计 token、基础布局、错误边界；
- `.env.example`、README、CI、分支保护；
- 开发服务器、类型检查、lint、生产构建验证。

**在阶段 1 获得确认前，不要批量生成业务页面。**

---

## 安全约定

- 不提交 `.env.local`、API 密钥、数据库密码；
- 服务端密钥不得进入 `NEXT_PUBLIC_*`；
- AI 功能未配置时明确提示，不伪造模型输出；
- 未接入真实服务的 UI 必须标注“演示模式”；
- 重要改动通过 PR 评审，不直接推主分支。

---

## 本地开发

待阶段 1 初始化后补充：

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

> 目前仓库尚未初始化 Next.js，上述命令尚不可用。
