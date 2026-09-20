---
title: QingZhou Subscription Routing
---

# Clash 回国节点路由

QingZhou 的 Clash/Mihomo renderer 支持一个模板级 opt-in，用于在统一套餐、统一订阅中为中国流量提供独立的手动选择组。它不改变用户的本地配置，也不要求新增套餐。

## 启用

在管理员的「系统设置 → Clash 模板（YAML）」中加入：

```yaml
x-qingzhou-cn-return-node: 🏠🇨🇳中国-境外回国
```

其中值必须与 QingZhou 节点管理中的实际节点名完全一致。节点仍需加入用户能够访问的原有节点组。

## 生成结果

渲染器会生成固定名称 `🇨🇳 中国节点` 的 `select` 组，并把它放在普通节点选择组之后；成员顺序固定为 `DIRECT`、配置的节点，因此新订阅默认国内直连。用户手动选择回国节点后才会改变中国规则的出口。私有键会从客户端输出中移除。它还加入两个远程 provider：

- `https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/direct.txt`：中国域名列表。
- `https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/cncidr.txt`：中国 IP 段列表。

规则顺序为私有网段/广告规则、CN 域名/IP provider、`GEOSITE,CN`/`GEOIP,CN` 兜底、其余管理员规则和最终 MATCH。这样历史模板中的 `CN,DIRECT` 不会先于回国规则命中。

用户在 Clash 中选择 `🇨🇳 中国节点 → 🏠🇨🇳中国-境外回国` 后，中国网站走该节点；其他规则仍使用原来的策略组。选择 `DIRECT` 只改变中国规则，其他策略组不受影响。

## 边界

该功能只影响 Clash/Mihomo 输出；sing-box 模板、节点安全策略、套餐授权和节点排序不变。生产启用后仍需确认节点名称、节点可达性和两个 GitHub provider 在目标客户端可下载。当前生产节点已写入 QingZhou，Tunnel ingress 和 connector 已正常，但 `cn-return.kreeper.cc` 尚未有公开 DNS 记录，因此公网握手验收尚未完成。
