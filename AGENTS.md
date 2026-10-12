# QingZhou 项目规则

<!-- PROJECT-DOCS:START -->
- 开始项目任务前先读取 `agent.md`。
- 代码、配置、基础设施、验证、部署或发布事实发生有意义变化后，必须使用 `llm-wiki` 同步项目权威文档与 `.llm-wiki/`；无文档影响时允许核对后 no-op。
<!-- PROJECT-DOCS:END -->

- QingZhou 前端设计系统统一为 `kreeper第一设计系统`（`kreeper-first-design-system` 完整 skill），以当前 Vue/Naive UI 实现、AWS 图表与 Apple 语义色为合同，并沿用 Cloudflare 侧栏几何合同（包括二级菜单竖线与菜单项之间的独立留白轨道）；不得为本项目调用或套用 Kreeper & Co/Anthropic 设计系统、其视觉 token 或 skill。完整规范、代码、字体与来源按 skill 渐进式披露；不得再引用已退役的独立 Anthropic/Cloudscape skill。若任务涉及视觉改动，先读取 `agent.md` 与 `.llm-wiki/modules/kreeper-first-design-system.md`。

- 新增/修改前端视觉样式必须读取 skill 的 `references/semantics.md`，在模板/样式责任边界添加青舟同款分类注释；无法归类的新类型必须主动提醒用户拟定并确认，不得静默创类或强塞已有类别。 使用此系统生成的项目，后续拟改实现违背规范时必须主动提醒用户是否同步修改对应规范；用户已明确授权的规范决定无需重复询问。

- 生产运行态以宿主 `/opt/qingzhou/qingzhou`、`qingzhou.service` 和 `qingzhou-sing-box.service` 为准；Docker 镜像只作为容器化回滚材料。
- 发布、回滚和清理前必须读取 `agent.md`、`KREEPER-MAINTENANCE.md` 与相关 `.llm-wiki/` 页面；不得用 Git HEAD 或未运行镜像推断生产状态。
- OCI 清理只能使用共享脚本的 dry-run → 复核 → `--apply` 流程；不得执行 volume prune、`docker compose down -v` 或覆盖更新后的 SQLite 数据。
