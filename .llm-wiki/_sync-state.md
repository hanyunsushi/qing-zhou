---
title: Current Wiki Sync State
updated: 2026-09-29
---

# Working-tree audit

- 2026-09-29 商城信息牌本地修正：`UserShop.vue` 的订阅计划标签与同续期组排队提示归入“区分-信息牌”，统一使用 `var(--info)` / `var(--info-soft)` Apple 蓝信息面；前端 101 项测试、类型检查和构建通过，生产未变更。

- 2026-09-29 Apple 浅色状态面已发布部署：提交 `537e5be`、Release
  `v0.2.86-kreeper-20260929-apple-soft`、Actions `36545227310`，ARM64
  SHA-256 `c9f8248dda85e86f60e838dc2ee1f1e411d02098b1200bf0d80ab2f535b26942`。
  生产备份为
  `/opt/qingzhou/backups/fork-v0.2.86-kreeper-20260929-apple-soft-20260929-165909/`；
  本机/公网健康、三项服务、`8081`/`8882`/`18082`、公网首页和 hashed
  JS/CSS 均验收通过，`qingzhou.service` 错误日志为空。仅重启
  `qingzhou.service`，数据库、env、systemd、sing-box 和 Tunnel 配置未改动；
  宿主无 `sqlite3` CLI，未执行 `PRAGMA integrity_check`。

- 2026-09-29 Apple 浅色状态面开发验证已由上方发布部署记录覆盖：普通状态牌使用半透明 Apple 状态面，图表状态编码保留实色填充；源码门禁通过后已发布并部署到生产。

- 2026-09-28 release/deployment sync: commit `84b9f0e`, tag
  `v0.2.85-kreeper-20260928-apple-status`, Actions `36406243452`, ARM64
  SHA-256 `b3347cb2fac549a1cf79e5b405617cd720619461a24c6e13a9bcd3fc4b6cce60`.
  Production `/opt/qingzhou/qingzhou` and public/local health checks report the
  release version; backup is
  `/opt/qingzhou/backups/fork-v0.2.85-kreeper-20260928-apple-status-20260928-095718/`.
  The three services and ports `8081`, `8882`, `18082` passed. The host has no
  `sqlite3` CLI, so database integrity was not independently checked in this
  deployment; a database copy is retained in the backup.

- 2026-09-28 Apple 状态编码可视化统一（已由上方发布部署记录覆盖）：热力图图例/格子、资源仪表、配额环、百分比资源条和状态提示统一复用 Apple-derived 状态色；`CHART_STATUS_COLORS` 与 `--chart-*` 作为兼容入口不再保存另一套 AWS 状态色。普通分类图表色板保持独立。首页/管理监控相关代码以“区分-状态牌”注释标出状态边界；OCI/Cloudflare 子卡悬浮只保留中性阴影，不改页面底色或位置。

- 2026-09-28 Apple 状态色、监控卡视觉和字体修正已发布部署：普通 UI 与状态编码可视化统一复用 Apple-derived status palette。版本、Release、Actions、资产哈希、生产备份和验收事实见本条上方；仅重启 `qingzhou.service`，未改生产数据库或配置。

- 2026-09-28 首页监控卡与字体修正包含在上述部署：OCI/Cloudflare 子卡使用页面背景、价格/官方状态牌使用 Apple 蓝白字，数字字体仅显式应用于数字节点。

- 2026-09-28 管理后台层级与节点卡片表面已部署：Release `v0.2.84-kreeper-20260928`、提交 `69786f0`、Actions `36344618817`；生产 ARM64 二进制 SHA-256 为 `ce4b7cde25a1d17d81a6dc0b0667767a5804a25488c61ecc0f312a08f022dc9c`。通过 `ubuntu@140.245.43.76` 直连部署，备份 `/opt/qingzhou/backups/fork-v0.2.84-kreeper-20260928-20260928-102819/`；本机/公网健康、三项服务、三个监听端口和公网资源均验收通过。

- 2026-09-27 chunk 优化：新增共享 tree-shakable ECharts 注册表，9 个图表页面只注册实际使用的图表和组件；构建首屏主包约 `300.72 KB`，ECharts 独立异步包约 `567.24 KB`（gzip `189.79 KB`），保留已知非阻塞的大 chunk warning。
- 2026-09-27 发布门禁与 Release：前端 95 项测试、类型检查、生产构建、`go test ./...`、`go test -race ./...`、`go vet ./...` 与 `git diff --check` 通过；提交 `4799d22`、标签 `v0.2.84-kreeper-20260927` 和 GitHub Actions `36257004993` 已验证，Release 资产已上传。
- 2026-09-27 生产部署：OCI 宿主已运行 `v0.2.84-kreeper-20260927` 的 ARM64 面板，二进制 SHA-256 为 `09fd55be04ea93e70a71de68a4800b91e04b5a15335797ed0fd11c6da47b516d`；回滚目录、SQLite 热备份、服务状态、本机/公网健康接口与前端资源已核验，生产数据库和配置未覆盖。
- 2026-09-27 Edge 订阅识别修复已部署：发现 Edge 节点实际以 Cloudflare IP 拨号、仅在 VLESS `host/sni` 中携带 `edge.kreeper.cc`，旧逻辑因此未生成 `edge_user`，用户次数保持 0。`internal/api/edge.go` 现增加 URL 主机与传输 Host/SNI/peer 匹配，并补齐 VLESS/VMess 回归测试；生产版本为 `v0.2.84-kreeper-edgefix-20260927`，ARM64 SHA-256 为 `f8564b6953b864b7978b96020b272d179642ba1e68e686bac953ebc93109c9f5`。真实订阅 11/11 Edge 节点已带 `edge_user`。
- 2026-09-27 Edge 超时二次修复已部署：发现 Clash/sing-box 会丢弃顶层未知 `edge_user` 查询参数，前一版真实客户端请求仍未携带凭据，导致 CF 节点超时；源码 `c0882eb` 将 `edge_user` 注入实际 WebSocket/HTTP transport path，并补齐 Clash/sing-box 渲染回归测试。生产版本为 `v0.2.84-kreeper-edgefix2-20260927`，ARM64 SHA-256 为 `28f899cb494c97aea1cb0fb80e32069a7363874921c7f20c7e745741c1a32cdc`；真实 Clash/sing-box 输出均已核验 `/?edge_user=...`。

- Repository root: `/Users/hinaw/qing-zhou-fork`; current synchronized commit is `84b9f0e` on `main`.
- Synchronized owners: `agent.md`, `apis/edge-usage.md`, `modules/official-usage.md`, `apis/admin-backups.md`, and `modules/cloudscape-visual-system.md`.
- Scrollbar fix: the global stable gutter belongs on `body`, the actual page scroller. Keeping it on both `html` and `body` created two native-width slots on short pages. The divider is anchored to `#app`'s content edge and stays visible at `min-height: 100vh`.
- Code changes covered Edge UTC-day accounting and canonical-ID validation, provider response bounds, remote-backup shutdown ordering, and shared frontend upstream formatting/order helpers.
- Verification: `go test ./...`, `go vet ./...`, `go test -race ./internal/store ./internal/api ./internal/backup ./internal/officialusage`, `pnpm typecheck`, `pnpm test` (92), `pnpm build`, and relative-link validation passed. The frontend build retains the existing large-chunk warning.
- Scrollbar verification: the platform scrollbar remains hidden while `PageScrollbar` owns the fixed 16px rail and 6px thumb; all page scroll state and settings/topbar scroll actions use `document.body`, and the thumb geometry is bound inline to avoid cross-platform/CSS-variable drift.
- `_schema.md` is synchronized to commit `84b9f0e`.
- 2026-09-26 热力图头部响应式修正：`AdminMonitor.vue` 在窄屏下将标题与时间范围/图例拆为两行，控制区允许换行；桌面排列和热力图行为不变。契约测试 93 项通过，`vue-tsc -b` 通过，未部署生产。
- 2026-09-26 二级切换路由窄屏修正：`route-switch-2` 的 Naive UI 导航容器恢复横向滚动并固定为父容器宽度，覆盖登录、节点管理、sing-box 和管理概览；活动线与桌面排列不变。
- 2026-09-26 二级切换路由细节修正：滚动 wrapper 从 `overflow:visible` 例外中拆出；竖屏显示独立 4px 横向滚动条，活动线清除圆角、裁剪和变换以保持直角几何。
- 2026-09-26 帮助文档列表分割线修正：`.document-toolbar` 覆盖全局工具栏圆角为 0，保留直线底部分割线并与下方内容共享外层模块边界。
- 2026-09-26 二级页签对齐修正：移动端独立滚动条预留 7px 后，导航基线同步上移与 33px 页签底边对齐；活动线锁定完整宽度和盒模型，修复首项左端缺口。
- 2026-09-26 二级页签活动态侧边装饰修正：`route-switch-2` 和独立认证页导航显式清除活动项左侧伪元素、侧边框与阴影，只保留底部 Apple 蓝活动线；前端测试 94 项、`vue-tsc -b`、生产构建和 `git diff --check` 通过，未部署生产。
- 2026-09-26 二级页签基线端点对齐：中性基线左右端点改为与导航内容相同的 `8px` 内缩，首尾不再比活动蓝线轨道额外伸出；完成前端契约测试与格式检查，未部署生产。
