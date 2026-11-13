---
title: 直连 WSS 节点增量同步状态
updated: 2026-11-12
head_commit: cc75e8c
---

# Doc Impact Map

- 直连 TLS/WS 入站、Certbot 文件证书与独立续期钩子，以及外部前端的地址映射和有效 Tunnel 路由由 [WSS 模块](modules/wss-endpoint.md) 维护。
- 生产监听/入口、运行产物、保护摘要、恢复点、保留集合和未验范围由 [项目权威](../agent.md) 维护。
- [架构概览](architecture/overview.md) 与 [索引](./_index.md) 提供入口，不复制发布流水。
- 初始未提交的 subscription-delivery.md 和 KREEPER-MAINTENANCE.md 修改保持，未纳入本轮提交。

# 验证

本轮复用既有原生程序和管理 API，没有修改应用源码、二进制或前端。通过既有 Certbot 完成证书签发和 staging 续期演练；独立客户端验收、用户凭据/设置/环境摘要、现存入站和 Tunnel 保护检查的结果由权威指定任务报告维护。未刷新或切换现用 Clash，不把独立客户端测试当作客户端配置上线。

# 文档检查

本轮检查 Wiki 索引覆盖、相对文件链接、源文件引用、权威软链接和双向入口；结果另存任务目录 documentation-validation.json。文档不保存节点 UUID、认证 token、WS 私有路径或 Cloudflare 账户凭据。

## 透明磨砂发布同步

Doc Impact Map：磨砂材质/范围归对应设计模块；发布身份、恢复与未验范围归agent.md；六应用共享脱敏回执在Console Wiki。核对源提交、暂存和dirty边界，仅同步本批发布；无关源码/文档保持。CodeGraph MCP不可用。六仓118份Markdown/1668处本地链接、JSON、authority软链及diff检查通过；OpenStock官方docs:sync/docs:check通过（25页/173内部链接）。证据归Console `output/frosted-release-20261113/docs-lint.json`。
