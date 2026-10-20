# NEBULA AI

**AI Creative Universe** — 将 AI 对话、创意生成、知识处理和个人工作空间融合在一起的沉浸式 AI 创作平台。

> 项目状态：阶段 1（基础设施）已正式验收通过，`dev@801c4a1`，CI run `39425381720` 成功；阶段 2 规划可以开始。详见 [阶段 1 总结](docs/PHASE1_SUMMARY.md)。

---

## 团队入口

无论你是团队成员还是成员的 AI 助手，请先阅读：

| 文档 | 用途 |
| --- | --- |
| [项目总体说明](docs/PROJECT_BRIEF.md) | 产品目标、视觉方向、技术架构、功能范围、阶段验收 |
| [阶段 1 总结](docs/PHASE1_SUMMARY.md) | 阶段交付、验证记录、验收结论与阶段 2 入口 |
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
- 功能分支命名：`feat/...`、`fix/...`、`docs/...`、`chore/...`、`refactor/...`；
- 所有 PR 至少 1 人评审；
- 功能 PR 使用 Squash Merge；`dev → main` 发布使用 Merge Commit；
- 合并后删除源分支；
- 详细规则见 [TEAM_PLAYBOOK.md](docs/TEAM_PLAYBOOK.md)。

---

## 当前阶段

```text
阶段 0 规划与团队接手      ← 已完成
阶段 1 基础设施            ← 正式验收通过
阶段 2 首页与 3D            ← 规划中
阶段 3 AI 工作台 UI
阶段 4 真实 AI 服务
阶段 5 数据库与用户系统
阶段 6 测试、性能与部署
```

阶段 1 已建立：

- Next.js 16 App Router + TypeScript + Tailwind CSS 4；
- next-intl 中英文路由，默认 `zh-CN`，根路径跳转 `/zh-CN`；
- 深空主题设计 token、导航、页脚、语言切换；
- 双语错误状态、加载状态、404 与 catch-all；
- `src/lib/ai/` 服务端契约层（PR #6），不含真实 AI 调用；
- `/api/health` 健康检查（PR #7）：200、`Cache-Control: no-store`、动态 timestamp；
- `.env.example`、README、GitHub Actions CI；
- `src/app/api/health/**` 归 @x-1784，@Nanami1-1 提供响应契约；
- `dev@a5b2f46` 的 CI run `39423560729` 与 `dev@801c4a1` 的 run `39425381720` 全流程通过；本地 format/lint/typecheck/build 与 i18n 冒烟通过；
- 阶段 1 收尾文档已通过 PR #8 合并，Issue #3 已关闭，用户已确认正式验收。

阶段 2 开始前，首页视觉和 3D 场景仍由 @BJSH-1 负责，其他成员不要提前生成完整首页。

---

## 安全约定

- 不提交 `.env.local`、API 密钥、数据库密码；
- 服务端密钥不得进入 `NEXT_PUBLIC_*`；
- AI 功能未配置时明确提示，不伪造模型输出；
- 未接入真实服务的 UI 必须标注“演示模式”；
- 重要改动通过 PR 评审，不直接推主分支。

---

## 本地开发

环境要求：Node.js `>=20.9`（本项目使用 `24.x`）、pnpm `11.x`。

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm format:check
pnpm lint
pnpm typecheck      # 自动执行 next typegen
pnpm build
pnpm start          # 生产模式预览
```

环境变量：

```bash
cp .env.example .env.local
```

阶段 1 不依赖任何密钥；`AI_*` 变量在阶段 4 接入真实服务时填写，`NEXT_PUBLIC_SITE_URL` 用于 SEO 元数据的绝对地址，生产环境必须设置为正式域名。

国际化路由：

```text
/           → /zh-CN（默认中文）
/zh-CN/...  → 中文
/en/...     → English
```

用户显式切换语言后写入 `NEXT_LOCALE` Cookie；根路径会恢复该选择，但不会跟随浏览器 `Accept-Language`。

> 阶段 1 尚未引入 Vitest/Playwright；测试与 E2E 将在后续阶段按 `CLAUDE.md` 的质量门禁补充，CI 目前执行 format check、lint、typecheck 和 build。
