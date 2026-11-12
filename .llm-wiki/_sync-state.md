---
title: WSS 节点增量同步状态
updated: 2026-11-12
head_commit: c521ec5
---

# Doc Impact Map

- 地址映射验证、按用户订阅、核心配置剥离、旧表单保存兼容及有效 Tunnel 路由由 [WSS 模块](modules/wss-endpoint.md) 维护。
- 生产监听/入口、运行产物、保护摘要、恢复点、保留集合和未验范围由 [项目权威](../agent.md) 维护。
- [架构概览](architecture/overview.md) 与 [索引](./_index.md) 提供入口，不复制发布流水。
- 初始未提交的 subscription-delivery.md 和 KREEPER-MAINTENANCE.md 修改保持，未纳入本轮提交。

# 验证

源码七个文件的变更已推送；Go 测试和受影响包 vet 通过，前端 238 项测试、类型与构建通过。生产复用并验证 207 项原资源，用户凭据/设置/环境摘要保持，三个服务 active，SQLite 完整性检查通过。公网代理与大请求的测量结果由权威指定任务报告维护；未刷新或切换现用 Clash，不把独立客户端测试当作客户端配置上线。

# 文档检查

本轮检查 Wiki 索引覆盖、相对文件链接、源文件引用、权威软链接和双向入口；结果另存任务目录 documentation-validation.json。文档不保存节点 UUID、认证 token、WS 私有路径或 Cloudflare 账户凭据。
