# NEBULA AI 角色分配

默认分工如下。三人可以协商互换，但每个领域必须有唯一负责人。调整后请同步更新：

- 本文件；
- `docs/TEAM_PLAYBOOK.md`；
- `.github/CODEOWNERS`；
- 根目录 `CLAUDE.md` 的团队协作章节。

| 角色 | 默认负责人 | 负责领域 | 角色文档 | 主要分支 |
| --- | --- | --- | --- | --- |
| A. 视觉与 3D 体验 | `@BJSH-1` | 设计语言、首页、3D 能量核心、动效、响应式视觉、WebGL 降级 | [VISUAL_3D.md](./VISUAL_3D.md) | `feat/visual-*`、`feat/3d-*` 或个人分支 |
| B. AI 与后端 | `@Nanami1-1` | AI 服务、流式接口、校验、限流、数据库、认证、存储、安全 | [AI_BACKEND.md](./AI_BACKEND.md) | `feat/ai-*`、`feat/api-*`、`feat/db-*` 或个人分支 |
| C. 工作台、国际化与质量 | `@x-1784` | 基础设施、i18n、基础布局、对话工作台、共享 UI、测试、CI、部署、文档与集成 | [WORKSPACE_PLATFORM.md](./WORKSPACE_PLATFORM.md) | `feat/workspace-*`、`feat/i18n-*`、`docs/*`、`chore/*` 或个人分支 |

## 每位成员应发送给自己 AI 的材料

1. `docs/PROJECT_BRIEF.md`
2. `docs/TEAM_PLAYBOOK.md`
3. `docs/AI_ONBOARDING.md`
4. 自己的角色文档
5. 根目录 `CLAUDE.md`

然后把 `docs/AI_ONBOARDING.md` 中的“启动提示词”发给 AI。

## 分工原则

- 一个领域只有一个最终负责人；
- 跨领域改动先协调，再动手；
- 每个 PR 至少由另一名成员评审；
- 负责人休假/阻塞时，由备份评审人临时接管，但要在 Issue 中记录；
- 不因为分工而拒绝阅读别人的代码；交叉理解能减少集成问题。

## 当前状态

- 应用代码尚未初始化；
- 团队文档通过 `docs/team-onboarding` 分支和 PR 进入 `dev`；
- 三人确认分工后，再进入阶段 1。
