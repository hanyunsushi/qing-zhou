# Kreeper QingZhou 定制维护

## 仓库与分支

- Fork：[hanyunsushi/qing-zhou](https://github.com/hanyunsushi/qing-zhou)，`origin/main` 是定制主线。
- 官方：[mllt992/qing-zhou](https://github.com/mllt992/qing-zhou)，`upstream/main` 只作为更新来源。
- 官方基线：`29740b9`，包含 `v0.2.80` 之后的开发提交，不宣称这是新的正式 release。
- 定制分为两项独立提交：模板自主管理 Clash 分组；本机原生节点与部署配置。
- Fork 的 GitHub `main` 是可维护源码，不表示其每次提交都已部署到生产。

## 定制合同

| 功能 | 配置 | 主要源码与测试 |
| --- | --- | --- |
| 只输出模板策略组 | Clash 模板 `x-qingzhou-template-groups: true` | [clash.go](internal/subconv/clash.go)、[分组测试](internal/subconv/clash_template_groups_test.go) |
| 生产面板运行本机节点 | `QZ_SINGBOX_LOCAL=true`，宿主机 systemd 部署 | [main.go](main.go)、[controller.go](internal/sbctl/controller.go)、[network_test.go](internal/sbctl/network_test.go)、[version.go](internal/sbctl/version.go) |
| 可写探针目录 | `QZ_PROBE_DIR=/data/probe` | [Dockerfile](Dockerfile)、[docker-compose.yml](docker-compose.yml) |
| 上游账户余额 | 管理后台 → 运营 → 上游管理 | [upstreams.go](internal/api/upstreams.go)、[officialusage](internal/officialusage/officialusage.go)、[页面](frontend/src/views/AdminUpstreams.vue) |

模板开关只控制 Clash 输出。不开启时保留官方分组逻辑；开启后 `all` 按用户授权节点展开，不注入原生选择/固定/故障转移/AI 组及 AI 规则。模板已有的 MATCH 保持最后一条；没有 MATCH 时使用模板首组作为兜底。空节点组回退 DIRECT，模板组名与节点重名时节点被去重。Sing-box 输出和服务端节点安全不受影响。

ACL4SSR 模板及订阅名称保存在运行时数据库，不在源码中硬编码。数据库、密码、SSH 私钥、订阅 token 和生产 `.env` 不得提交。

## 上游账户余额

“上游管理”位于侧边栏“运营”的“管理概览”上方。管理员可以在面板内分别保存 OCI API Key 配置和 Cloudflare Account Analytics Token；两份 JSON 配置使用现有 `QZ_SECRET_KEY` 加密层存进 `settings`，读取接口只返回 `*_set` 标记，绝不返回私钥或 Token。删除操作会直接删除整份加密配置。

- OCI：直接请求 Usage API，按 Oracle 价目表中 `First 10 TB / Month` / `Over 10 TB / Month` 的出站条目和 `Gigabyte outbound data transfer per month` 官方单位计算参考余额；识别到超额层级时余额直接归零。查询至当日 UTC `00:00` 不代表该区间已经完整入账。账户真实返回和 Console 仍需在生产验收中核对，不能仅凭 HTTP 成功承诺余额准确。详见 `.llm-wiki/modules/official-usage.md`。
- Cloudflare：直接请求 Account Analytics GraphQL，累加当前 UTC 日的 Pages Functions 和 Workers 调用数。必须填写专用 `Account Analytics Read` Token，禁止复用 DNS/ACME Token；余额是面板配置的每日上限减去官方请求数。
- 这两项都不得经由 EdgeTunnel、Cloudflare Worker KV、服务器 `tx_bytes` 或节点统计转发。第三方接口错误只显示在上游页面，不得影响管理概览和订阅服务。

本功能已于 2026-09-15 构建并部署到 OCI：生产面板已从 Docker 中心模式切换为宿主机 systemd 本机模式，运行 `/opt/qingzhou/qingzhou`，使用 `QZ_SINGBOX_LOCAL=true`、`QZ_SINGBOX_CONFIG=/etc/qingzhou-sing-box/config.json`、`QZ_SINGBOX_UNIT=qingzhou-sing-box.service`、`QZ_SINGBOX_V2RAY=127.0.0.1:18082`。生产数据库从原 Docker 数据卷复制到 `/opt/qingzhou/qingzhou.db`，原入站和 TLS 配置已迁到 `server_id=0`，节点地址由 `node_host_override` 指向 OCI 公网地址。QingZhou 已成功生成并重载本机原生 sing-box 配置，面板和本机节点均健康，公网 `https://qz.kreeper.cc/api/health` 返回 `v0.2.80-kreeper-7e0f784`。

EdgeTunnel 已在 2026-09-15 的 Pages Production 发布 `122ac66` 中移除 OCI 节点导入、OCI 余额/上报和旧订阅节点输出。OCI 主机上的旧 `sing-box.service` 已备份到 `/root/edgetunnel-singbox-retired-20260915/` 后停用并归档，`8881` 不再监听。QingZhou 原生节点继续由 `qingzhou-sing-box.service` 独占运行，监听 `8882`；不得恢复旧服务或引用旧 `/etc/sing-box` 配置。

旧 Docker 面板容器已删除，但 `qingzhou_qingzhou-data` 数据卷、旧镜像和 `/opt/qingzhou/backups/local-switch-20260915-203413/` 回滚备份保留。Cloudflare 账号标识已确认，但尚未写入配置：必须先创建并填写独立的 `Account Analytics Read` 最小权限 Token，不能以 Wrangler OAuth 会话或 ACME/DNS Token 代替。

## 合并官方更新

本地 OCI 解析加固尚未发布：增加完整分页、未知数据失败关闭、官方长单位识别及参考余额警示。没有取得账户脱敏原始计量响应，不能认定线上 0 用量的唯一根因或声称精确余额已验收。本轮不改生产配置、数据库、节点或服务。

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

Compose 仅用于需要远程 SSH 管理的独立中心面板。当前生产升级应替换宿主机 `/opt/qingzhou/qingzhou`，保持 `QZ_DB`、`QZ_SECRET_KEY`、`QZ_SINGBOX_LOCAL=true`、`QZ_SINGBOX_CONFIG=/etc/qingzhou-sing-box/config.json` 和 `QZ_SINGBOX_UNIT=qingzhou-sing-box.service` 不变，然后执行 `systemctl restart qingzhou`。回滚只恢复面板二进制和对应服务配置，不要用整库恢复覆盖用户新数据。

面板内置更新器的默认来源仍是官方 `mllt992/qing-zhou`。不要把官方一键二进制更新当作定制版升级方式，否则会丢失定制；本 fork 使用“合并源码 → 测试 → 构建 → 部署”。生产运行状态应单独验证，不能由 Git HEAD 推断。
