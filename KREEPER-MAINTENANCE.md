# Kreeper QingZhou 定制维护

## 2026-09-21 Edge 日次数展示与套餐强制推送（已实现，未发布）

- 用户控制台“流量用量”卡片新增当前 UTC 日 Edge 次数额度展示，复用 `/api/user/dashboard` 的 `edge_requests` 汇总，不改变 OCI/原生流量统计。
- 套餐管理页在创建套餐左侧新增“强制推送”。管理员二次确认后，`POST /api/admin/packages/force-sync` 将所有仍持有且套餐仍存在的非退休计划桶同步到当前套餐定义；多时长按原桶时长匹配，已删除时长回退第一档；流量和 Edge 当日已用清零，购买记录、积分、有效期、队列状态和历史报表保留。该操作不会自动推进或重排队列，提交后清理受影响用户的订阅缓存并异步安排节点配置刷新；流量包已合并到通用流量池，不属于可回写的套餐桶。
- 功能源码提交 `8fded8f`、队列回归测试提交 `70d1023` 已推送 Fork；本轮尚未发布生产；Go 全量测试、前端测试、类型检查和构建已通过。

## 2026-09-21 Clash 回国节点组隔离（已部署）

- Clash/Mihomo 输出继续保留真实节点 `🏠🇨🇳中国-境外回国`，但从普通 `🚀 节点选择`、固定节点、故障转移、负载均衡和模板 `all` 展开结果中排除；该节点只出现在 `🇨🇳 中国节点` 组中，成员顺序仍为 `DIRECT`、回国节点。这样普通境外节点组的选择不会意外接管境外流量。
- 变更位于 `internal/subconv/clash.go`，覆盖模板组和内置组；sing-box、Surge、节点授权和节点本身不变。源码提交 `496708a` 已构建并发布为 `v0.2.80-kreeper-496708a`，active 二进制 SHA-256 为 `3ec9f930d1dd0837fea2a818a508e745c552a9f6d18a33d413f7b9c68c291b2a`，回滚材料位于 `/opt/qingzhou/backups/cn-return-isolate-496708a-20260921-015739/`。`go test ./...` 通过；公网健康、三个服务、三个端口和真实 Clash 订阅验收均通过。

## 2026-09-20 Clash 回国节点策略组支持（已部署，DNS 待补）

- QingZhou Fork 新增模板私有键 `x-qingzhou-cn-return-node`。管理员在「系统设置 → Clash 模板（YAML）」中填入实际节点名 `🏠🇨🇳中国-境外回国` 后，所有格式为 Clash/Mihomo 的同一订阅会自动增加 `🇨🇳 中国节点` 手动选择组；不新增套餐、不新增订阅，节点继续沿用原有授权。
- 渲染器使用 Loyalsoldier `clash-rules` 的 `direct.txt` 和 `cncidr.txt` 作为中国域名/IP规则集，并在现有私有网段/广告规则之后、其他管理员规则之前插入规则；同时保留 `GEOSITE,CN` 与 `GEOIP,CN` 兜底。这样用户只需在 `🇨🇳 中国节点` 组内选择 `🏠🇨🇳中国-境外回国`，其他策略组不变。
- 私有键会从输出中删除，不会泄露到客户端配置；未填写时渲染行为保持不变。源码提交 `e6e1343` 已构建为 ARM64 `v0.2.80-kreeper-e6e1343` 并部署到 `/opt/qingzhou/qingzhou`，active SHA-256 为 `0a5fc2eb9f4e13373d66a887ccc3aafeae4608b9be0383159a61b167ce28d34d`。生产节点 ID 为 `971`，数据库备份位于 `/opt/qingzhou/backups/cn-return-db-20260920-092649/`，二进制回滚包位于 `/opt/qingzhou/backups/cn-return-e6e1343-20260920-093153/`。
- 本机 Mac sing-box 使用受限回环 `127.0.0.1:18080` 的 VLESS+WebSocket 入站；专用 Tunnel `mac-cn-return`（ID `31fb9cb1-d82c-41c2-95d3-01b26cb55a83`）已配置 `cn-return.kreeper.cc` ingress，连接器由 macOS LaunchAgent `com.cloudflare.mac-cn-return` 持久化并保持 healthy。Cloudflare 权威 DNS 当前仍对 `cn-return.kreeper.cc` 返回 NXDOMAIN，DNS 写权限不足是公网连通验收的唯一阻塞；补 DNS 后需重新验证 TLS、WebSocket、Clash 节点握手和中国出口 IP。
- 后续修正已将 `🇨🇳 中国节点` 放在普通节点选择组之后，并固定成员顺序为 `DIRECT`、`🏠🇨🇳中国-境外回国`；因此新渲染订阅默认国内直连，用户仍可手动切换该组到回国节点。源码 `82a741e` 已构建并发布为 `v0.2.80-kreeper-82a741e`，active 二进制 SHA-256 为 `905021ee4a4756b1fccfbbbf14f4cb3542e71ec2caeb61a91e90ef212b7af544`，回滚材料位于 `/opt/qingzhou/backups/cn-return-direct-82a741e-20260920-122438/`；公网健康接口已返回新版本，三个服务均 active。

## 2026-09-20 OCI 默认额度修正为二进制 10 TB

- OCI 面板默认月度上限已从历史的 `10_000_000_000_000` 字节修正为 `10_995_116_277_760` 字节，即 `10 × 1024^4`；界面继续显示 `10 TB`，不改用 `TiB` 标签。
- 已保存的历史十进制默认值会在读取、查询和再次保存时自动迁移到新的二进制默认值；手工填写的其他额度不被覆盖。
- Oracle 公开资料确认免费层级为每月 10 TB 出站传输，但未在公开页面确认该层级对应的精确字节定义；因此二进制字节值是本面板统一计量约定，不冒充 Oracle 账单内部换算规则。

## 2026-09-20 全站字节显示统一为二进制换算

- 前两轮 OCI 卡片的十进制显示已按最新要求撤回。全站继续使用同一套 `fmtBytes`：按 `1024` 换算，但保留现有常用标签 `KB/MB/GB/TB/PB`；当前默认 `10_995_116_277_760` 字节显示为 `10 TB`。
- OCI 上游管理卡、首页“服务器监控”上游余额卡、套餐流量及其他服务器/用户流量展示均使用这套二进制换算；底层 API、数据库和 OCI 官方用量字节值不变。
- 源码提交 `47cd5a3` 已构建为 Linux ARM64 版本 `v0.2.80-kreeper-47cd5a3` 并部署到 `/opt/qingzhou/qingzhou`；active 二进制 SHA-256 为 `1156979d0e6367a6213eb097023761a7a80aa5d48337100a38d51d465a15e339`。
- 发布前回滚材料位于 `/opt/qingzhou/backups/binary-upstream-47cd5a3-20260920-100745/`，包含旧二进制、SQLite 一致性快照、环境文件、两个 systemd unit 和 `/etc/qingzhou-sing-box`；快照 `PRAGMA integrity_check` 为 `ok`。只重启了 `qingzhou.service`，未重启 sing-box，未覆盖数据库、凭据、节点配置或服务定义。
- 发布后本机与 `https://proxy.kreeper.cc/api/health` 均返回 `v0.2.80-kreeper-47cd5a3`，`qingzhou.service`、`qingzhou-sing-box.service` 和 `cloudflared.service` 均为 active；`127.0.0.1:8081`、`*:8882`、`127.0.0.1:18082` 正常监听。

## 2026-09-20 EdgeTunnel 请求次数对接（已部署）

- QingZhou 对匹配 `edge.kreeper.cc` 的外部节点按用户改写 Edge 凭据，并在 VLESS、Trojan、Hysteria2、AnyTLS、TUIC、SS 和 VMess 链接中写入 `edge_user`；VMess 的协议 `id` 同步改写。
- `EdgeUUIDForUser` 使用用户 ID 的前 48 位、RFC 4122 版本/变体位和 HMAC-SHA256 前 8 字节；HMAC 输入为 `edge:` 加 8 字节大端用户 ID。EdgeTunnel Worker 已用同一算法校验，避免因 UUID 保留位或文本/二进制编码差异导致用户无法入账。
- `/api/internal/edge/usage` 按 `batch_id` 幂等接收 15 分钟批次，按批次 `usage_day`（UTC 日期）扣减每日次数，返回当日超额用户；套餐与时长选项的 `edge_request_limit=0` 表示不限。套餐原有 `duration_days/expiry_at` 仍统一控制流量和套餐有效期，每日 Edge 超限不会推进排队套餐。
- 全量 Go、前端测试、类型检查和构建均通过；生产环境已配置 `QZ_EDGE_SECRET`、`QZ_EDGE_USAGE_TOKEN` 和 `QZ_EDGE_USAGE_URL`，运行版本为 `v0.2.80-kreeper-68f7055`。
- EdgeTunnel Pages Production 已配置 `EDGE_QZ_SECRET`、`EDGE_QZ_USAGE_TOKEN` 和 `EDGE_QZ_USAGE_URL=https://proxy.kreeper.cc/api/internal/edge/usage`。真实签名空批次请求返回 `400`，认证链路与接口可达性已核验，未产生用量记录。
- 源码 `19b76b2` 已构建为 Linux ARM64 `v0.2.80-kreeper-19b76b2` 并部署到 `/opt/qingzhou/qingzhou`；active 二进制 SHA-256 为 `73564ab342afeab3d251dbf6d2e3ad4458b95c5b7470bc628bc5636c7312ed0b`。发布备份位于 `/opt/qingzhou/backups/edge-daily-19b76b2-20260920-072024/`，包含旧二进制、数据库文件、环境文件、systemd 配置和 sing-box 配置。
- 发布后本机与公网 `/api/health` 均返回 `v0.2.80-kreeper-19b76b2`；三个相关服务均 active，`8081`、`8882`、`18082` 正常监听，未产生启动错误。
- 随后提交 `b5c4d95` 修正跨 UTC 日后的套餐状态判断，部署为 `v0.2.80-kreeper-b5c4d95`；active 二进制 SHA-256 为 `1308641fe1454701c273bdb290f088ccf1490a5277627ef8c04bf3be4e06976a`，备份位于 `/opt/qingzhou/backups/edge-daily-b5c4d95-20260920-073326/`。本机与公网健康检查、三个服务、三个监听端口和错误日志均正常。

## 2026-09-18 首页上游余额卡十进制显示修复

- 发现上一轮只修改了“上游管理”页面，首页“服务器监控”中的上游余额卡仍调用旧的二进制 `fmtBytes`；本轮源码提交 `98b6c6b` 已将首页 OCI 余额、总额和官方已用改为十进制 `fmtDecimalBytes`，服务器内存、磁盘、网速和用户流量显示保持原格式。
- 源码已构建为 Linux ARM64 版本 `v0.2.80-kreeper-98b6c6b` 并部署到 `/opt/qingzhou/qingzhou`；active 二进制 SHA-256 为 `dbb7c8aad6e02d0dbfe0f0df9e9923e884041ab6e8270f6235a8c982af1c6d03`。
- 发布前回滚材料位于 `/opt/qingzhou/backups/monitor-decimal-98b6c6b-20260918-153352/`，包含旧二进制、SQLite 一致性快照、环境文件、两个 systemd unit 和 `/etc/qingzhou-sing-box`；快照 `PRAGMA integrity_check` 为 `ok`。
- 发布后本机与 `https://proxy.kreeper.cc/api/health` 均返回 `v0.2.80-kreeper-98b6c6b`，三个相关服务均为 active；公网首页引用的 `Monitor-B_zNuhQ8.js` 与本地构建 SHA-256 均为 `9235ed29c60af964f3a8ab47c7b8773f7118e6e2437a9603b2fa0b031d231a55`。

## 2026-09-18 OCI 免费额度十进制显示发布

- 源码提交 `adce9e9` 已构建为 Linux ARM64 版本 `v0.2.80-kreeper-adce9e9` 并部署到 OCI 宿主 `/opt/qingzhou/qingzhou`；active 二进制 SHA-256 为 `cdfac1f71275d768c52ccff415e81221ad668971032c035b3307cdea9dd18563`。
- OCI 免费额度统一按十进制字节显示：`10_000_000_000_000` bytes = `10 TB`；上游余额卡片、账号总额、官方已用和月度上限提示均使用十进制格式。用户套餐流量的原 `fmtBytes` 二进制格式未改变，Cloudflare 请求数也未改变。
- 发布前回滚材料位于 `/opt/qingzhou/backups/oci-quota-decimal-adce9e9-20260918-150019/`，包含旧二进制、SQLite 一致性快照、环境文件、两个 systemd unit 和 `/etc/qingzhou-sing-box`；快照 `PRAGMA integrity_check` 为 `ok`。
- 发布后 `qingzhou.service`、`qingzhou-sing-box.service` 和 `cloudflared.service` 均为 active；本机与 `https://proxy.kreeper.cc/api/health` 均返回 `v0.2.80-kreeper-adce9e9`，`127.0.0.1:8081`、`*:8882`、`127.0.0.1:18082` 正常监听。此次未重启 sing-box、未覆盖数据库、凭据或节点配置。

<!-- PROJECT-DOCS:START -->
- 开始项目任务前先读取 `agent.md`。
- 代码、配置、基础设施、验证、部署或发布事实发生有意义变化后，必须使用 `llm-wiki` 同步项目权威文档与 `.llm-wiki`；无文档影响时允许核对后 no-op。
<!-- PROJECT-DOCS:END -->

## 2026-09-18 公开域名迁移

- QingZhou 新公开基址为 `https://proxy.kreeper.cc`，运行时值保存在 SQLite `settings.public_base`；该域名由 OCI Cloudflare Tunnel 直接转发到面板，旧 `qz.kreeper.cc` 已删除。
- EdgeTunnel 正式域名为 `https://edge.kreeper.cc`；迁移期间的 `proxy.kreeper.cc/sub*` 兼容 Worker 已删除，Edge 与 QingZhou 使用各自的原生订阅入口。
- 域名切换前数据库备份为 `/opt/qingzhou/backups/public-base-proxy-20260918-020951.db`；最终验证以 `proxy.kreeper.cc` 直连健康接口和真实订阅为准，旧域名已不再作为兼容入口。

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
| 站点品牌图标 | 管理后台 → 系统设置 → 基本设置；站点名称右侧“修改图标” | [设置 API](internal/api/admin.go)、[公共配置](internal/api/auth.go)、[页面](frontend/src/views/AdminSettings.vue)、[品牌组件](frontend/src/components/BrandMark.vue) |
| 套餐自动续订 | 用户订阅卡片默认开启，按续期组统一设置 | [autorenew.go](internal/store/autorenew.go)、[user.go](internal/api/user.go)、[页面](frontend/src/views/UserSub.vue) |
| Clash 订阅显示名 | 站点名不再追加 `.yaml`；Sing-box、Surge、Base64 保留各自扩展名 | [subinfo.go](internal/api/subinfo.go)、[测试](internal/api/subinfo_test.go) |
| Clash 节点排序 | 外部与自建节点统一按 `nodes.sort_order` 输出；订阅源刷新保留已有链接顺序 | [user.go](internal/api/user.go)、[nodes.go](internal/store/nodes.go)、[测试](internal/api/node_order_test.go)、[测试](internal/store/source_order_test.go) |
| Edge 请求次数回传 | 按用户改写 Edge 外部节点凭据；15 分钟批量回传、幂等入账和套餐次数上限 | [edge.go](internal/api/edge.go)、[edge_usage.go](internal/api/edge_usage.go)、[测试](internal/api/edge_test.go) |

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
11. **Edge 请求次数回传**：匹配 `edge.kreeper.cc` 的外部节点按用户生成带 HMAC 的 `edge_user` UUID；EdgeTunnel 对 WebSocket、gRPC 和 XHTTP 请求按一次计数，15 分钟批量回传 QingZhou，套餐的 `edge_request_limit` 控制每个 UTC 日的用户次数，`0` 表示不限。每日超限不会消耗流量有效期或推进排队套餐。此功能不改变 OCI 字节统计，也不在每个代理请求中调用 QingZhou。

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

## 站点品牌图标

在“系统设置 → 基本设置”中，`修改图标`与站点名称并列。管理员可上传不超过 `512 KiB` 的 PNG、JPEG 或 WebP；图标保存为公开的 `brand_icon_data_uri`，不是密钥，不能上传私密内容。后端会在提交整份设置前校验规范 Base64、大小和真实图片签名，拒绝 SVG、伪造 MIME 或损坏内容，并避免非法图标造成其他设置部分写入。

客户端从公开 `/api/config` 读取该图标并统一应用到头部/侧边栏/登录页 Logo、浏览器标签页 favicon、`shortcut icon` 与 `apple-touch-icon`。恢复默认图标会清空该设置并回退内置 `/qingzhou-mark.svg`；不修改节点、订阅或任何凭据。

- OCI：直接请求 Usage API，按账户配置的总额减去官方返回的出站已用量计算余额；生产账户实际返回 `Outbound Data Transfer Zone 2` / `GB Months`，已纳入解析。查询至当日 UTC `00:00` 不代表该区间已经完整入账；面板每 15 分钟自动刷新，切回页面立即刷新。详见 `.llm-wiki/modules/official-usage.md`。
- Cloudflare：直接请求 Account Analytics GraphQL，累加当前 UTC 日的 Pages Functions 和 Workers 调用数。必须填写专用 `Account Analytics Read` Token，禁止复用 DNS/ACME Token；余额是面板配置的每日上限减去官方请求数。
- 这两项都不得经由 EdgeTunnel、Cloudflare Worker KV、服务器 `tx_bytes` 或节点统计转发。第三方接口错误只显示在上游页面，不得影响管理概览和订阅服务。

本机部署记录：生产面板已从 Docker 中心模式切换为宿主机 systemd 本机模式，运行 `/opt/qingzhou/qingzhou`，使用 `QZ_SINGBOX_CONFIG=/etc/qingzhou-sing-box/config.json`、`QZ_SINGBOX_UNIT=qingzhou-sing-box.service`、`QZ_SINGBOX_V2RAY=127.0.0.1:18082`。生产数据库从原 Docker 数据卷复制到 `/opt/qingzhou/qingzhou.db`，原入站和 TLS 配置已迁到 `server_id=0`，节点地址由 `node_host_override` 指向 OCI 公网地址。QingZhou 已成功生成并重载本机原生 sing-box 配置；本机节点路径使用官方控制器能力，不依赖额外的本机模式开关；当前发布状态见下方 2026-09-17 记录。

EdgeTunnel 已在 2026-09-15 的 Pages Production 发布 `1296b77` 中移除 OCI 节点导入、OCI 余额/上报和旧订阅节点输出。OCI 主机上的旧 `sing-box.service` 已备份到 `/root/edgetunnel-singbox-retired-20260915/` 后停用并归档，`8881` 不再监听。QingZhou 原生节点继续由 `qingzhou-sing-box.service` 独占运行，监听 `8882`；不得恢复旧服务或引用旧 `/etc/sing-box` 配置。

旧 Docker 面板容器、全部 QingZhou Docker 镜像和 `qingzhou_qingzhou-data` 数据卷均已按受引用保护的专用流程清除；`/opt/qingzhou/backups/local-switch-20260915-203413/` 及其他宿主机回滚备份保留。Cloudflare 账号标识已确认，但尚未写入配置：必须先创建并填写独立的 `Account Analytics Read` 最小权限 Token，不能以 Wrangler OAuth 会话或 ACME/DNS Token 代替。

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

2026-09-17 已清理三枚退役 Docker 镜像及无引用数据卷。常规模式仅保留现有 QingZhou 回滚镜像中的最新至多三枚，允许镜像数量为零和退役数据卷不存在，不会重建这些资源；宿主机回滚备份仍保留。

- 当前 OCI 正式运行态是宿主 systemd 二进制，不是 Docker center-panel；Docker 镜像不是 active production。
- 统一清理入口 `/Users/hinaw/Documents/Codex/2026-09-17/oci/oci-retention-cleanup.sh` 默认仍按 dry-run → `--apply` 清理常规镜像并保留三枚 QingZhou 回滚镜像。若确认容器化 QingZhou 回滚不再需要，使用 `--purge-qingzhou`（同样先 dry-run）单独检查两个服务、本机健康端点及所有容器引用，再删除全部 `qingzhou:*`、`ghcr.io/mllt992/qing-zhou:*` 镜像和无引用的 `qingzhou_qingzhou-data`；该模式不会执行 `builder prune` 或处理 Sub2API、网站资源。
- `--purge-qingzhou` 不删除 `/opt/qingzhou/qingzhou`、`/opt/qingzhou/qingzhou.db`、`/opt/qingzhou/backups/`、环境文件、服务定义或 `/etc/qingzhou-sing-box`。不得执行 volume prune、`docker compose down -v` 或覆盖更新后的 SQLite 数据；清理前后须核对两个 QingZhou 服务与健康端点，宿主机回滚备份仍保留。

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

### 2026-09-17 完整灾备恢复包发布

源码 `e75381d` 已构建为 Linux ARM64 版本 `v0.2.80-kreeper-e75381d` 并部署到 `/opt/qingzhou/qingzhou`；active 二进制 SHA-256 为 `d7cbee2e6acdc03a8a9f2b36862919ef2beead38a2bf0a1540aac9aad41d3fb1`。发布前一致性回滚快照与服务材料位于 `/opt/qingzhou/backups/disaster-recovery-e75381d-20260917-171516/`；其中数据库由 SQLite 备份 API 生成，不是运行中 WAL 文件的直接复制。

生产环境通过 `QZ_BACKUP_MANIFEST=/etc/qingzhou/recovery.json` 启用服务器控制的灾备 allowlist：数据库快照、面板环境文件、QingZhou/sing-box/Cloudflare Tunnel 的 systemd 定义、sing-box 配置、当前 Tunnel 配置与凭据，以及可选 SSH 密钥目录。归档拒绝网页指定任意路径、符号链接、特殊文件、在线数据库路径和超限内容；源码与二进制仍由 Git 和匹配版本构建恢复。远端恢复包不额外加密，可能包含密钥，只能进入私有 HTTPS R2/S3 桶；访问凭据和 MFA 恢复方式必须独立于服务器保管。

已将历史错误的 R2 Endpoint（包含 Bucket 路径）规范为账户 Endpoint，保留现有加密 Access Key/Secret；保存凭据的 `HeadBucket` 测试成功。一次真实灾备上传完成，记录为 `tar.gz`，大小 `335948` 字节并存有 SHA-256；随后从远端下载，核对整包 SHA-256、归档清单和每个文件哈希，并对解出的 SQLite 快照执行 `PRAGMA integrity_check`，均通过。部署后 `qingzhou.service`、`qingzhou-sing-box.service`、`cloudflared.service` 均 active；本机和公网健康接口均返回 `v0.2.80-kreeper-e75381d`，`127.0.0.1:8081`、`*:8882`、`127.0.0.1:18082` 正常监听，退役 `:8881` 未恢复。

### 2026-09-17 移除远程专用 sing-box 开关

源码 `e876013` 移除了 Fork 独有的 `QZ_SINGBOX_LOCAL` 开关、禁用本机配置/统计/版本探测的分支及其专用测试，恢复 QingZhou 官方本机控制器路径。本次不删除官方远程 SSH 服务器管理，也不影响上游余额、远端备份、套餐续订、订阅显示名和节点排序等独立定制。ARM64 二进制 `v0.2.80-kreeper-e876013` 已部署到 `/opt/qingzhou/qingzhou`。

发布前完整备份位于 `/opt/qingzhou/backups/remove-remote-only-e876013-20260917-230809/`。随后从生产环境文件删除无效的 `QZ_SINGBOX_LOCAL` 行，未修改数据库、`QZ_SECRET_KEY`、两个 systemd unit 或 `/etc/qingzhou-sing-box`。本机与公网 `/api/health` 均返回新版本；`qingzhou.service`、`qingzhou-sing-box.service` 均 active/enabled，`127.0.0.1:8081`、`*:8882`、`127.0.0.1:18082` 正常监听，最近服务错误为空。active 二进制 SHA-256 为 `6022692c35a91686a817f31a9aa68390633c778c0e0f8dff9c0763c52c29acc6`。

### 2026-09-17 清理 Docker 探针目录适配

源码 `42771d1` 移除了仅供 Docker 使用的 `/data/probe` 创建、写权限和 `QZ_PROBE_DIR=/data/probe` 覆盖，恢复官方镜像内置的 `/opt/qingzhou/probe` 路径。其余 Docker 镜像选择、回环端口、环境变量校验和 SSH 密钥挂载配置保持不变。OCI 正式运行态是宿主机 systemd，不使用 QingZhou 容器，因此本次没有替换二进制、重启服务或修改生产环境文件。
