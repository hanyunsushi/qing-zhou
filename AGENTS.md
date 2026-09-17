# QingZhou 项目规则

<!-- PROJECT-DOCS:START -->
- 开始项目任务前先读取 `agent.md`。
- 代码、配置、基础设施、验证、部署或发布事实发生有意义变化后，必须使用 `llm-wiki` 同步项目权威文档与 `.llm-wiki/`；无文档影响时允许核对后 no-op。
<!-- PROJECT-DOCS:END -->

- 生产运行态以宿主 `/opt/qingzhou/qingzhou`、`qingzhou.service` 和 `qingzhou-sing-box.service` 为准；Docker 镜像只作为容器化回滚材料。
- 发布、回滚和清理前必须读取 `agent.md`、`KREEPER-MAINTENANCE.md` 与相关 `.llm-wiki/` 页面；不得用 Git HEAD 或未运行镜像推断生产状态。
- OCI 清理只能使用共享脚本的 dry-run → 复核 → `--apply` 流程；不得执行 volume prune、`docker compose down -v` 或覆盖更新后的 SQLite 数据。
