# Kreeper QingZhou 定制维护

<!-- PROJECT-DOCS:START -->
- 开始项目任务前先读取 `agent.md`。
- 代码、配置、基础设施、验证、部署或发布事实发生有意义变化后，必须使用 `llm-wiki` 同步项目权威文档与 `.llm-wiki`；无文档影响时允许核对后 no-op。
<!-- PROJECT-DOCS:END -->

## 仓库与分支

- Fork：[hanyunsushi/qing-zhou](https://github.com/hanyunsushi/qing-zhou)，`origin/main` 是定制主线。
- 官方：[mllt992/qing-zhou](https://github.com/mllt992/qing-zhou)，`upstream/main` 只作为更新来源。
- 官方基线：`29740b9`，包含 `v0.2.80` 之后的开发提交，不宣称这是新的正式 release。
- 定制覆盖 Clash 输出、上游余额、套餐续订、订阅显示名和节点排序；本机原生节点属于 QingZhou 官方能力。
- Fork 的 GitHub `main` 是可维护源码；生产部署必须以实际运行态验收为准，不能由 Git HEAD 推断。

## 定制合同

| 功能 | 配置 | 主要源码与测试 |
| --- | --- | --- |
| 只输出模板策略组 | Clash 模板 `x-qingzhou-template-groups: true` | [clash.go](internal/subconv/clash.go)、[分组测试](internal/subconv/clash_template_groups_test.go) |
| 上游账户余额 | 管理后台 → 运营 → 上游管理 | [upstreams.go](internal/api/upstreams.go)、[officialusage](internal/officialusage/officialusage.go)、[页面](frontend/src/views/AdminUpstreams.vue) |
| 远端数据库备份 | 管理后台 → 系统设置 → 数据备份；R2/S3 兼容对象存储 | [backup manager](internal/backup/manager.go)、[API](internal/api/backup_remote.go)、[页面](frontend/src/views/AdminSettings.vue) |
| 套餐自动续订 | 用户订阅卡片默认开启，按续期组统一设置 | [autorenew.go](internal/store/autorenew.go)、[user.go](internal/api/user.go)、[页面](frontend/src/views/UserSub.vue) |
| Clash 订阅显示名 | 站点名不再追加 `.yaml`；Sing-box、Surge、Base64 保留各自扩展名 | [subinfo.go](internal/api/subinfo.go)、[测试](internal/api/subinfo_test.go) |
| Clash 节点排序 | 外部与自建节点统一按 `nodes.sort_order` 输出；订阅源刷新保留已有链接顺序 | [user.go](internal/api/user.go)、[nodes.go](internal/store/nodes.go)、[测试](internal/api/node_order_test.go)、[测试](internal/store/source_order_test.go) |

模板开关只控制 Clash 输出。不开启时保留官方分组逻辑；开启后 `all` 按用户授权节点展开，不注入原生选择/固定/故障转移/AI 组及 AI 规则。模板已有的 MATCH 保持最后一条；没有 MATCH 时使用模板首组作为兜底。空节点组回退 DIRECT，模板组名与节点重名时节点被去重。Sing-box 输出和服务端节点安全不受影响。

ACL4SSR 模板及订阅名称保存在运行时数据库，不在源码中硬编码。数据库、密码、SSH 私钥、订阅 token 和生产 `.env` 不得提交。

## 完整定制清单

相对官方基线 `29740b9`，Fork 当前包含以下定制。带“生产合同”的项目描述运行方式；带“运行时配置”的项目不属于源码硬编码，需从数据库或管理后台核对。

### 源码功能

1. **模板自主管理 Clash 分组**：识别 `x-qingzhou-template-groups: true` 后由模板拥有策略组；按用户授权展开 `all`，不再额外注入原生节点选择、固定、故障转移、负载均衡和 AI 组；保留模板已有规则与最终 `MATCH`，空组回退 `DIRECT`，并处理组名与节点重名。
2. **OCI 上游官方用量**：直接调用 OCI Usage API，支持出站传输、免费层 SKU、UTC 日边界和 `GB Months` 单位，按官方已用量计算配置额度的参考余额，并提供测试覆盖。
3. **Cloudflare 上游官方请求数**：直接调用 Account Analytics GraphQL，统计当前 UTC 日 Pages Functions 与 Workers 调用量，配置的每日上限仅用于展示参考余额；凭据在服务端加密保存。
4. **上游管理界面和 API**：侧边栏“运营”中新增“上游管理”，支持 OCI/Cloudflare 配置、脱敏状态读取、刷新、删除、错误隔离和管理员专属访问。
5. **远端数据库备份**：系统设置的数据备份分区支持 R2/S3 Endpoint、加密凭据、连接测试、默认每天 03:00 UTC 定时备份、按天/份数保留、手动触发、历史元数据、预签名下载和远端删除；备份基于 SQLite `VACUUM INTO`，不提供网页在线恢复。
6. **套餐自动续订**：用户套餐默认开启，可按续期组开关；队列任务先处理手动排队份，再为到期且无排队份的套餐按当前商品价格和购买时长续订；余额、商品、库存、时长或购买权限不足时不扣款并保留开关重试。
7. **订阅显示名清理**：Clash 响应的 `Content-Disposition` 使用站点名而不追加 `.yaml`，避免客户端显示 `站点名.yaml`；其他订阅格式仍保留 `.json`、`.conf`、`.txt`。
8. **订阅节点排序修复**：订阅聚合不再把自建节点统一追加到外部节点之后；所有可访问节点按管理后台保存的全局 `sort_order` 输出。节点来源刷新按 `share_link` 保留已有节点的排序，新节点追加到当前最大排序值之后。
9. **监控首页上游余额卡片**：管理员在“服务器监控”的“面板本机”右侧看到合并 OCI/Cloudflare 的上游余额卡片；数据直接调用上游刷新 API，公开监控页不加载供应商账户用量。卡片内子项支持拖动排序并每 15 分钟自动刷新。
10. **余额与节点拖动排序**：上游管理页和监控首页共用设置键 `admin_upstream_balance_order` 保存 OCI/Cloudflare 顺序；节点管理卡片改为原生拖放，完整节点 ID 顺序仍通过 `/api/admin/nodes/reorder` 写入全局 `nodes.sort_order`。

### 生产部署合同

1. **OCI 原生节点由 QingZhou 接管**：本机 `server_id=0` 的配置生成、重载和统计是 QingZhou 官方原生能力；生产面板运行于宿主机 systemd，直接生成并重载 `/etc/qingzhou-sing-box/config.json`，统计读取本机 `127.0.0.1:18082`；`qingzhou-sing-box.service` 独占 `8882`。
2. **旧 EdgeTunnel OCI 节点链路已退出**：旧 `sing-box.service` 已停用归档，`8881` 不再监听；EdgeTunnel 不再负责 OCI 节点导入、OCI 余额或旧节点输出。
3. **中心面板 Compose 仅保留为可选路径**：不得用官方 `latest` 或普通 Compose 更新覆盖当前本机原生生产模式；升级必须备份二进制、数据库、环境文件、sing-box unit 和配置，再替换面板二进制并重启 `qingzhou`。

### 运行时配置合同

1. **节点与分组**：自建 OCI 节点、Edge/CF 外部节点、节点分组、套餐与节点分组绑定均保存在数据库；外部机场订阅源通过节点来源同步，不应把整份订阅 URL 当作单节点分享链接。
2. **Clash 模板与订阅名称**：ACL4SSR/自定义模板和站点名称保存在运行时设置中，由管理员后台维护，不写入源码。
3. **节点排序数据**：节点后台的上移/下移写入 `nodes.sort_order`；排序是全局的，不按用户或单个分组独立保存。订阅源刷新不会因为重新生成节点 ID 而恢复默认顺序。
4. **上游凭据**：OCI API Key 和 Cloudflare Account Analytics Read Token 使用现有 `QZ_SECRET_KEY` 加密存储；不得复用 Wrangler OAuth、ACME 或 DNS Token，也不得写入 Git、Wiki、日志或公开响应。
5. **套餐与订阅数据**：套餐价格、套餐分组、自动续订状态、节点授权、用户流量和订阅 token 均属于生产数据，不应作为源码定制清单中的静态值提交。

## 上游账户余额

“上游管理”位于侧边栏“运营”的“管理概览”上方。管理员可以在面板内分别保存 OCI API Key 配置和 Cloudflare Account Analytics Token；两份 JSON 配置使用现有 `QZ_SECRET_KEY` 加密层存进 `settings`，读取接口只返回 `*_set` 标记，绝不返回私钥或 Token。删除操作会直接删除整份加密配置。

- OCI：直接请求 Usage API，按账户配置的总额减去官方返回的出站已用量计算余额；生产账户实际返回 `Outbound Data Transfer Zone 2` / `GB Months`，已纳入解析。查询至当日 UTC `00:00` 不代表该区间已经完整入账；面板每 15 分钟自动刷新，切回页面立即刷新。详见 `.llm-wiki/modules/official-usage.md`。
- Cloudflare：直接请求 Account Analytics GraphQL，累加当前 UTC 日的 Pages Functions 和 Workers 调用数。必须填写专用 `Account Analytics Read` Token，禁止复用 DNS/ACME Token；余额是面板配置的每日上限减去官方请求数。
- 这两项都不得经由 EdgeTunnel、Cloudflare Worker KV、服务器 `tx_bytes` 或节点统计转发。第三方接口错误只显示在上游页面，不得影响管理概览和订阅服务。

本机部署记录：生产面板已从 Docker 中心模式切换为宿主机 systemd 本机模式，运行 `/opt/qingzhou/qingzhou`，使用 `QZ_SINGBOX_CONFIG=/etc/qingzhou-sing-box/config.json`、`QZ_SINGBOX_UNIT=qingzhou-sing-box.service`、`QZ_SINGBOX_V2RAY=127.0.0.1:18082`。生产数据库从原 Docker 数据卷复制到 `/opt/qingzhou/qingzhou.db`，原入站和 TLS 配置已迁到 `server_id=0`，节点地址由 `node_host_override` 指向 OCI 公网地址。QingZhou 已成功生成并重载本机原生 sing-box 配置；本机节点路径使用官方控制器能力，不依赖额外的本机模式开关；当前发布状态见下方 2026-09-17 记录。

EdgeTunnel 已在 2026-09-15 的 Pages Production 发布 `1296b77` 中移除 OCI 节点导入、OCI 余额/上报和旧订阅节点输出。OCI 主机上的旧 `sing-box.service` 已备份到 `/root/edgetunnel-singbox-retired-20260915/` 后停用并归档，`8881` 不再监听。QingZhou 原生节点继续由 `qingzhou-sing-box.service` 独占运行，监听 `8882`；不得恢复旧服务或引用旧 `/etc/sing-box` 配置。

旧 Docker 面板容器已删除，但 `qingzhou_qingzhou-data` 数据卷、旧镜像和 `/opt/qingzhou/backups/local-switch-20260915-203413/` 回滚备份保留。Cloudflare 账号标识已确认，但尚未写入配置：必须先创建并填写独立的 `Account Analytics Read` 最小权限 Token，不能以 Wrangler OAuth 会话或 ACME/DNS Token 代替。

## 套餐自动续订

用户在“订阅管理 → 我的套餐”每条仍在使用或排队中的订阅线右侧可设置“自动续订”；默认开启。设置按 `queue_key` 续期组同步到该组所有未退役的套餐份，避免同一条线路的当前份与排队份状态不一致。接口为 `PUT /api/user/plans/{id}/auto-renew`，请求体为 `{"enabled":true|false}`；只能修改当前登录用户自己的真实订阅套餐，流量池和内部赠送额度不支持该设置。

每两分钟的队列任务先激活用户已经手动购买的排队份，再检查到期且已开启自动续订、没有排队份的线路。续订使用当前在售商品的价格与购买时长，创建成功订单和 `auto_renew` 积分流水，随后复用正常队列晋升与 sing-box 重建流程。积分不足、商品下架、时长选项移除、库存不足或用户组购买权限失效时不会扣费、不产生订单，开关保持开启并在后续周期重试；已有手动排队续费时绝不额外扣费。

## 合并官方更新

本地 OCI 解析已取得生产官方响应：本月返回 `Outbound Data Transfer Zone 2`，单位 `GB Months`，官方数量为非零值；此前因单位未识别导致已用量显示为 0。提交 `83267dd` 已完成 Go 测试、前端构建、ARM64 二进制替换和服务重启；生产二进制 SHA-256 为 `1b6955dc8d611d418d5cf8fbc8d6d53de8a0da7b1c49c183e194243fbac51516`，备份保存在 `/opt/qingzhou/backups/`，配置、数据库、节点和凭据未修改。随后 `834cd3e` 已部署套餐自动续订；`b186d9d` 已部署订阅显示名修复；`c1151c2` 已部署订阅节点排序修复。各项源码事实和历史版本保留在对应验证记录中。

### 2026-09-17 宿主面板发布

源码 `4b65fec` 已构建为 Linux ARM64 版本 `v0.2.80-kreeper-4b65fec` 并部署到 `/opt/qingzhou/qingzhou`。active 二进制 SHA-256 为 `9b4dfec76b8523db32ce98c4a8a1fb07c6b9afabdcb489c3de559248135f66ff`；发布前备份位于 `/opt/qingzhou/backups/node-order-4b65fec-20260917-133155/`，包含旧二进制、SQLite 数据库、环境文件、两个 systemd unit 和 `/etc/qingzhou-sing-box`。本轮未覆盖数据库、凭据、服务定义或 sing-box 配置。

发布后 `qingzhou.service`、`qingzhou-sing-box.service` 均为 active/enabled，本机和公网 `/api/health` 均返回 `v0.2.80-kreeper-4b65fec`；`127.0.0.1:8081`、`*:8882`、`127.0.0.1:18082` 正常监听，旧 `:8881` 未监听。生产数据库及发布前副本 `PRAGMA integrity_check` 均为 `ok`，其他 OCI 容器保持 healthy。

工作区必须干净；不要用 reset/force push 覆盖本地或定制历史。

```bash
git switch main
git status -sb
git fetch origin
git pull --ff-only origin main
git fetch upstream --tags --prune
git log --oneline HEAD..upstream/main
git merge --no-ff upstream/main
go test ./...
git diff --check
git push origin main
```

出现冲突时先解决模板渲染和远程控制的合同，再运行测试；不能通过选择全量 ours/theirs 抹掉另一侧逻辑。发布前还要构建 Vue 前端和面板，使用真实订阅做 Mihomo 配置加载、代理下载、流量计数和 Sing-box 回归验证。合并 `upstream/main` 会纳入未发布开发提交；若只跟正式版，则明确选择经过确认的 release tag 合并。

## 构建与部署

### OCI artifact 保留

- 当前 OCI 正式运行态是宿主 systemd 二进制，不是 Docker center-panel；Docker 镜像只作为容器化回滚材料。
- 每次应用项目保留现行 artifact 外加三枚可用回滚 artifact；Qingzhou 保留三枚最新定制 `qingzhou:kreeper-*` 或 `qingzhou:rollback-*` 镜像，不把它们误报为 active production；其他 `qingzhou:*` 临时 tag 与未被容器引用的官方 `ghcr.io/mllt992/qing-zhou:*` 应用镜像应清除。
- 统一清理入口 `/Users/hinaw/Documents/Codex/2026-09-17/oci/oci-retention-cleanup.sh` 默认 dry-run，复核后才 `--apply`；它会保护 active 镜像、三枚回滚镜像和正式数据，只清理未被容器引用的带标签镜像、临时 tag、dangling image 与 BuildKit cache；不得执行 volume prune、`docker compose down -v` 或覆盖更新后的 SQLite 数据。
- 清理前后必须核对 `qingzhou.service`、`qingzhou-sing-box.service`、`:8882`、active 二进制 hash、`qingzhou_qingzhou-data` 和 `/opt/qingzhou/backups/`。

Compose 的 `QZ_IMAGE` 必须指向从 fork 构建的镜像，不要使用官方 `latest` 覆盖定制。例如在已验证且干净的源码上构建 OCI ARM64 镜像：

```bash
revision=$(git rev-parse --short HEAD)
docker buildx build --platform linux/arm64 --load \
  --build-arg VERSION="v0.2.80-kreeper-${revision}" \
  -t "qingzhou:kreeper-${revision}" .
```

基线升级后调整版本前缀，不要沿用过期版本号。上面的镜像只进入执行构建的 Docker daemon；本机构建后需通过镜像仓库或 `docker save/load` 传入 OCI，不能直接把本机镜像名视作服务器已有镜像。GitHub fork 本身不会自动发布可用镜像或签名 release。

Docker Compose 仍保留为可选的“中心面板 + SSH 远程落地”部署模板；它不是当前 OCI 生产方式。当前 OCI 生产升级前应备份 `/opt/qingzhou/qingzhou`、`/opt/qingzhou/qingzhou.db`、`/opt/qingzhou/qingzhou.env`、两个 sing-box 服务定义和 `/etc/qingzhou-sing-box`。不要直接执行下面的 Compose 命令，否则会重新启用容器隔离并关闭本机接管：

```bash
docker compose --env-file /opt/qingzhou/.env \
  -f /opt/qingzhou/docker-compose.yml -p qingzhou \
  up -d --no-deps qingzhou
```

Compose 是可选的容器化部署模板；当前生产升级应替换宿主机 `/opt/qingzhou/qingzhou`，保持 `QZ_DB`、`QZ_SECRET_KEY`、`QZ_SINGBOX_CONFIG=/etc/qingzhou-sing-box/config.json` 和 `QZ_SINGBOX_UNIT=qingzhou-sing-box.service` 不变，然后执行 `systemctl restart qingzhou`。回滚只恢复面板二进制和对应服务配置，不要用整库恢复覆盖用户新数据。

面板内置更新器的默认来源仍是官方 `mllt992/qing-zhou`。不要把官方一键二进制更新当作定制版升级方式，否则会丢失定制；本 fork 使用“合并源码 → 测试 → 构建 → 部署”。生产运行状态应单独验证，不能由 Git HEAD 推断。

### 2026-09-17 远端备份功能发布

源码 `5cf18bb` 已构建为 Linux ARM64 版本 `v0.2.80-kreeper-5cf18bb` 并部署到 `/opt/qingzhou/qingzhou`。active 二进制 SHA-256 为 `73dd6afb9168c201be212b0a96ac7b087ae2b382395c38109125447cd5d95e83`；发布前备份位于 `/opt/qingzhou/backups/remote-backup-5cf18bb-20260917-094324/`，包含旧二进制、SQLite 数据库、环境文件、两个 systemd unit 和 `/etc/qingzhou-sing-box`。

发布后公网 `/api/health` 返回 `v0.2.80-kreeper-5cf18bb`，未登录访问 `/api/admin/backups/config` 返回 `401`；`qingzhou.service`、`qingzhou-sing-box.service` 均 active，`8081`、`8882`、`18082` 正常监听，最近服务错误为空。生产尚未填写专用 R2 凭据，因此没有执行真实远端上传；OCI 主机未安装 `sqlite3` CLI，本轮未执行 `PRAGMA integrity_check`。

### 2026-09-17 移除远程专用 sing-box 开关

源码 `e876013` 移除了 Fork 独有的 `QZ_SINGBOX_LOCAL` 开关、禁用本机配置/统计/版本探测的分支及其专用测试，恢复 QingZhou 官方本机控制器路径。本次不删除官方远程 SSH 服务器管理，也不影响上游余额、远端备份、套餐续订、订阅显示名和节点排序等独立定制。ARM64 二进制 `v0.2.80-kreeper-e876013` 已部署到 `/opt/qingzhou/qingzhou`。

发布前完整备份位于 `/opt/qingzhou/backups/remove-remote-only-e876013-20260917-230809/`。随后从生产环境文件删除无效的 `QZ_SINGBOX_LOCAL` 行，未修改数据库、`QZ_SECRET_KEY`、两个 systemd unit 或 `/etc/qingzhou-sing-box`。本机与公网 `/api/health` 均返回新版本；`qingzhou.service`、`qingzhou-sing-box.service` 均 active/enabled，`127.0.0.1:8081`、`*:8882`、`127.0.0.1:18082` 正常监听，最近服务错误为空。active 二进制 SHA-256 为 `6022692c35a91686a817f31a9aa68390633c778c0e0f8dff9c0763c52c29acc6`。

### 2026-09-18 清理 Docker 探针目录适配

Fork 移除了仅供 Docker 使用的 `/data/probe` 创建、写权限和 `QZ_PROBE_DIR=/data/probe` 覆盖，恢复官方镜像内置的 `/opt/qingzhou/probe` 路径。其余 Docker 镜像选择、回环端口、环境变量校验和 SSH 密钥挂载配置保持不变。OCI 正式运行态是宿主机 systemd，不使用 QingZhou 容器，因此本次没有替换二进制、重启服务或修改生产环境文件。
