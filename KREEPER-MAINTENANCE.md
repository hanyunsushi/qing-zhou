# Kreeper QingZhou 定制维护

## 仓库与分支

- Fork：[hanyunsushi/qing-zhou](https://github.com/hanyunsushi/qing-zhou)，`origin/main` 是定制主线。
- 官方：[mllt992/qing-zhou](https://github.com/mllt992/qing-zhou)，`upstream/main` 只作为更新来源。
- 官方基线：`29740b9`，包含 `v0.2.80` 之后的开发提交，不宣称这是新的正式 release。
- 定制分为两项独立提交：模板自主管理 Clash 分组；远程节点模式与部署配置。
- Fork 的 GitHub `main` 是可维护源码，不表示其每次提交都已部署到生产。

## 定制合同

| 功能 | 配置 | 主要源码与测试 |
| --- | --- | --- |
| 只输出模板策略组 | Clash 模板 `x-qingzhou-template-groups: true` | [clash.go](internal/subconv/clash.go)、[分组测试](internal/subconv/clash_template_groups_test.go) |
| 面板不运行本机节点 | `QZ_SINGBOX_LOCAL=false` | [main.go](main.go)、[controller.go](internal/sbctl/controller.go)、[network_test.go](internal/sbctl/network_test.go)、[version.go](internal/sbctl/version.go) |
| 可写探针目录 | `QZ_PROBE_DIR=/data/probe` | [Dockerfile](Dockerfile)、[docker-compose.yml](docker-compose.yml) |
| 上游账户余额 | 管理后台 → 运营 → 上游管理 | [upstreams.go](internal/api/upstreams.go)、[officialusage](internal/officialusage/officialusage.go)、[页面](frontend/src/views/AdminUpstreams.vue) |

模板开关只控制 Clash 输出。不开启时保留官方分组逻辑；开启后 `all` 按用户授权节点展开，不注入原生选择/固定/故障转移/AI 组及 AI 规则。模板已有的 MATCH 保持最后一条；没有 MATCH 时使用模板首组作为兜底。空节点组回退 DIRECT，模板组名与节点重名时节点被去重。Sing-box 输出和服务端节点安全不受影响。

ACL4SSR 模板及订阅名称保存在运行时数据库，不在源码中硬编码。数据库、密码、SSH 私钥、订阅 token 和生产 `.env` 不得提交。

## 上游账户余额

“上游管理”位于侧边栏“运营”的“管理概览”上方。管理员可以在面板内分别保存 OCI API Key 配置和 Cloudflare Account Analytics Token；两份 JSON 配置使用现有 `QZ_SECRET_KEY` 加密层存进 `settings`，读取接口只返回 `*_set` 标记，绝不返回私钥或 Token。删除操作会直接删除整份加密配置。

- OCI：直接签名请求 `usageapi.{region}.oci.oraclecloud.com/20200107/usage`，查询当月起点到当前 UTC 日 `00:00` 的日级官方数据，并累加 data transfer/outbound/egress 的可识别字节单位；当天尚未结算的用量会在下一日数据中体现。余额是“管理员配置的月度上限 - OCI 官方用量”，并非声称 OCI API 返回统一余额。
- Cloudflare：直接请求 Account Analytics GraphQL，累加当前 UTC 日的 Pages Functions 和 Workers 调用数。必须填写专用 `Account Analytics Read` Token，禁止复用 DNS/ACME Token；余额是面板配置的每日上限减去官方请求数。
- 这两项都不得经由 EdgeTunnel、Cloudflare Worker KV、服务器 `tx_bytes` 或节点统计转发。第三方接口错误只显示在上游页面，不得影响管理概览和订阅服务。

本功能仅完成源码与本地测试，尚未构建/导入 OCI 生产镜像或部署。部署前按本文件的构建与部署流程操作，并在浏览器中以管理员身份分别测试“保存配置 → 查询余额 → 凭据不回显”。

## 合并官方更新

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

发布前备份当前镜像、Compose 和相关数据库设置；保留 `/opt/qingzhou/.env`、现有数据卷和 SSH 私钥挂载。服务器上的项目名固定为 `qingzhou`，只重建面板服务：

```bash
docker compose --env-file /opt/qingzhou/.env \
  -f /opt/qingzhou/docker-compose.yml -p qingzhou \
  up -d --no-deps qingzhou
```

执行前必须在服务器 Compose 或环境中明确设置已经装入的 `QZ_IMAGE`。默认 `qingzhou:kreeper` 只是本地标签约定，并非已发布镜像。部署后核对 image ID、程序版本、健康检查、订阅和节点连接，回滚则恢复旧镜像及相关模板设置后重建面板；不要用整库恢复覆盖用户新数据。

面板内置更新器的默认来源仍是官方 `mllt992/qing-zhou`。不要把官方一键二进制更新当作定制版升级方式，否则会丢失定制；本 fork 使用“合并源码 → 测试 → 构建 → 部署”。生产运行状态应单独验证，不能由 Git HEAD 推断。
