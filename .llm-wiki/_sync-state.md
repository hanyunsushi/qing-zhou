---
title: Current Wiki Sync State
updated: 2026-09-27
---

# Working-tree audit

- 2026-09-27 chunk 优化：新增共享 tree-shakable ECharts 注册表，9 个图表页面只注册实际使用的图表和组件；构建首屏主包约 `300.72 KB`，ECharts 独立异步包约 `567.24 KB`（gzip `189.79 KB`），保留已知非阻塞的大 chunk warning。
- 2026-09-27 发布门禁与 Release：前端 95 项测试、类型检查、生产构建、`go test ./...`、`go test -race ./...`、`go vet ./...` 与 `git diff --check` 通过；提交 `4799d22`、标签 `v0.2.84-kreeper-20260927` 和 GitHub Actions `36257004993` 已验证，Release 资产已上传。

- Repository root: `/Users/hinaw/qing-zhou-fork`.
- Git metadata is unavailable: `.git` points to `/Users/hinaw/qing-zhou/.git/worktrees/qingzhou-kreeper-production`, and that path does not exist. No commit or diff baseline was inferred.
- Synchronized owners: `agent.md`, `apis/edge-usage.md`, `modules/official-usage.md`, `apis/admin-backups.md`, and `modules/cloudscape-visual-system.md`.
- Scrollbar fix: the global stable gutter belongs on `body`, the actual page scroller. Keeping it on both `html` and `body` created two native-width slots on short pages. The divider is anchored to `#app`'s content edge and stays visible at `min-height: 100vh`.
- Code changes covered Edge UTC-day accounting and canonical-ID validation, provider response bounds, remote-backup shutdown ordering, and shared frontend upstream formatting/order helpers.
- Verification: `go test ./...`, `go vet ./...`, `go test -race ./internal/store ./internal/api ./internal/backup ./internal/officialusage`, `pnpm typecheck`, `pnpm test` (92), `pnpm build`, and relative-link validation passed. The frontend build retains the existing large-chunk warning.
- Scrollbar verification: the platform scrollbar remains hidden while `PageScrollbar` owns the fixed 16px rail and 6px thumb; all page scroll state and settings/topbar scroll actions use `document.body`, and the thumb geometry is bound inline to avoid cross-platform/CSS-variable drift.
- `last_synced_commit` in `_schema.md` remains unchanged because no valid `HEAD` exists in this checkout.
- 2026-09-26 热力图头部响应式修正：`AdminMonitor.vue` 在窄屏下将标题与时间范围/图例拆为两行，控制区允许换行；桌面排列和热力图行为不变。契约测试 93 项通过，`vue-tsc -b` 通过，未部署生产。
- 2026-09-26 二级切换路由窄屏修正：`route-switch-2` 的 Naive UI 导航容器恢复横向滚动并固定为父容器宽度，覆盖登录、节点管理、sing-box 和管理概览；活动线与桌面排列不变。
- 2026-09-26 二级切换路由细节修正：滚动 wrapper 从 `overflow:visible` 例外中拆出；竖屏显示独立 4px 横向滚动条，活动线清除圆角、裁剪和变换以保持直角几何。
- 2026-09-26 帮助文档列表分割线修正：`.document-toolbar` 覆盖全局工具栏圆角为 0，保留直线底部分割线并与下方内容共享外层模块边界。
- 2026-09-26 二级页签对齐修正：移动端独立滚动条预留 7px 后，导航基线同步上移与 33px 页签底边对齐；活动线锁定完整宽度和盒模型，修复首项左端缺口。
- 2026-09-26 二级页签活动态侧边装饰修正：`route-switch-2` 和独立认证页导航显式清除活动项左侧伪元素、侧边框与阴影，只保留底部 Apple 蓝活动线；前端测试 94 项、`vue-tsc -b`、生产构建和 `git diff --check` 通过，未部署生产。
- 2026-09-26 二级页签基线端点对齐：中性基线左右端点改为与导航内容相同的 `8px` 内缩，首尾不再比活动蓝线轨道额外伸出；完成前端契约测试与格式检查，未部署生产。
