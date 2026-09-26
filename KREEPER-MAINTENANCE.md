# Kreeper QingZhou 定制维护

## 2026-09-27 fork 前端 chunk 优化、Release 与生产部署（已发布）

- 前端新增共享 tree-shakable ECharts 注册表，图表页面只注册实际使用的图表与组件；生产构建首屏主包约 `300.72 KB`，ECharts 独立异步包约 `567.24 KB`（gzip `189.79 KB`）。500 KB 提示属于异步图表包 warning，不阻塞构建。
- 发布门禁已通过：前端 95 项测试、类型检查和构建，Go 全量测试、race、vet 与 `git diff --check` 均通过。提交 `4799d22` 已推送到 fork，并发布为 `v0.2.84-kreeper-20260927`。
- GitHub Actions `36257004993` 成功上传 `qingzhou-linux-{amd64,arm64}`、`probe-linux-{amd64,arm64}`、`sing-box-linux-{amd64,arm64}` 和 `SHA256SUMS.txt`；Release URL 为 `https://github.com/hanyunsushi/qing-zhou/releases/tag/v0.2.84-kreeper-20260927`。fork 未配置 Release signing key，资产未签名。
- OCI 宿主已部署 ARM64 面板 `v0.2.84-kreeper-20260927`，active 二进制 SHA-256 为 `09fd55be04ea93e70a71de68a4800b91e04b5a15335797ed0fd11c6da47b516d`。回滚材料位于 `/opt/qingzhou/backups/fork-v0.2.84-kreeper-20260927-20260927-015145/`，旧二进制 SHA-256 为 `8a0570b43f176a8ab9addb9b11936b3e67f565e0fd3eeb770416a9b6f2ffab58`，SQLite 热备份完整性为 `ok`；env、服务定义、sing-box 配置和运行数据库未被覆盖。
- 部署后 `qingzhou.service`、`qingzhou-sing-box.service`、`cloudflared.service` 均 active；本机和公网 `https://proxy.kreeper.cc/api/health` 返回新版本，主页、`/api/config` 与 hashed 前端资源均为 `200`，`qingzhou.service` error 日志为空。

## 2026-09-26 前端资源内嵌修复发布（已部署）

- 根因是发布二进制构建前未执行 `frontend/npx vite build`，`frontend/dist` 只有占位文件，`go:embed` 因此没有可用 SPA 资源；运行时会返回“前端资源缺失”。按项目构建合同先生成 Vite 产物，再重新编译 Go 二进制。
- 稳定源码基线为 `293613b`，生产版本 `v0.2.80-kreeper-oidcfix-embedded-20260926`，Linux ARM64 二进制 SHA-256 为 `8a0570b43f176a8ab9addb9b11936b3e67f565e0fd3eeb770416a9b6f2ffab58`。本次只补齐内嵌前端资源，不改变 OAuth、数据库或节点逻辑。
- 发布前回滚材料位于 `/opt/qingzhou/backups/embedded-frontend-20260926-105638/`，包含旧二进制、SQLite 数据库、环境文件、systemd 服务定义、Cloudflare Tunnel 配置和 `/etc/qingzhou-sing-box`。仅重启 `qingzhou.service`，未重启 sing-box、Cloudflare Tunnel 或覆盖用户数据。
- 发布后本机与公网主页、`/api/health`、实际 hashed JS/CSS 资源均返回 `200`；公网 OAuth 启动仍返回 `200`、Auth URL 和 PKCE S256。`qingzhou.service`、`qingzhou-sing-box.service`、`cloudflared.service` active，三者重启次数均为 `0`。

## 2026-09-26 Authentik OIDC Issuer 尾斜杠修复（已部署）

- 根因是 OAuth 配置校验用 `TrimRight("/")` 改写 OIDC Issuer；Authentik discovery 返回的 issuer 包含末尾 `/`，`go-oidc` 要求两者逐字一致，因此 `/api/auth/oauth2/start` 在发现阶段稳定返回 502。修复仅保留用户填写的 Issuer 路径语义，并增加末尾 `/` 回归测试；HTTPS、同源端点、PKCE S256 和 SSRF 防护不变。
- 生产配置已保留为标准 Issuer `https://oidc.kreeper.cc/application/o/kreeproxy/`。修复源码提交 `293613b`；生产版本 `v0.2.80-kreeper-oidcfix-20260926`，ARM64 二进制 SHA-256 为 `5b56faed2eee3af3937fcaf2c433bc7ceeb0d1846a80aaba8eb77a2b6c5d3990`。
- 发布前回滚材料位于 `/opt/qingzhou/backups/oauth-issuer-fix-20260926-101438/`，包含旧二进制、SQLite 数据库、环境文件、systemd 服务定义、Cloudflare Tunnel 配置和 `/etc/qingzhou-sing-box`；另有配置修复前数据库备份 `/opt/qingzhou/backups/oauth-issuer-before-20260926-095327.db`。仅重启 `qingzhou.service`，未重启 sing-box、Cloudflare Tunnel 或覆盖用户数据。
- 发布后本机与公网 `/api/health` 均返回 `v0.2.80-kreeper-oidcfix-20260926`；本机和公网 `POST /api/auth/oauth2/start` 均返回 `200`、生成 Authentik authorization URL 和独立 `__Host-qz_oauth_*` 状态 Cookie。`qingzhou.service`、`qingzhou-sing-box.service`、`cloudflared.service` 均 active，`127.0.0.1:8081`、`*:8882`、`127.0.0.1:18082`、`127.0.0.1:19000` 正常监听，发布后 qingzhou 错误日志为空。

## 2026-09-23 订阅页顶部操作按钮统一（本地未部署）

- 顶部“订单记录”与“去商城”分别复用控制台顶部普通按钮和强调按钮的几何、文字、描边及悬浮/聚焦/按下状态。
- 按钮状态由 `global.css` 的共享语义类单点维护；左侧“控制台”入口、按钮内容和路由不变。

## 2026-09-23 订阅范围下拉选中颜色（本地未部署）

- 订阅管理页“原生配置代理范围”选择框的选中项及选中 hover/focus 背景使用按钮强调蓝，选中文字与勾选使用白色；局部覆盖，不影响其他下拉菜单和订阅链接行为。

## 2026-09-23 趋势切换留白与账户头像点击态（本地未部署）

- 控制台流量趋势标题和范围切换间保持 `16px` 间距。
- 账户下拉触发器鼠标点击不再铺圆形背景，头像图标底固定 `8px` 方角；键盘 focus-visible 焦点环保留。

## 2026-09-23 控制台趋势切换圆角（本地未部署）

- “7天 / 30天”路由切换组件外轨为 `16px`、选中面为 `12px`；外轨显式覆盖全局 `[class*="-switch"]` 的 `18px !important` 圆角兜底。不改变尺寸、颜色或查询行为。

## 2026-09-23 控制台按钮悬浮状态（本地未部署）

- “订阅管理”及引导区三个普通按钮常态文字更浅，悬浮/聚焦后提升至中性深色；引导按钮的 ring 使用透明 spacer，保持与“订阅管理”相同的可见 2px 描边，不再被白色内层遮细。
- 全局 Naive UI 主按钮悬浮统一为浅亮蓝 `#298fff`（`--accent-button-hover`）；“去商城”背景和描边同步使用该值。深色 `--accent-hover` 保留给链接等非按钮交互。
- 移除引导区原先蓝色 hover 背景与投影；文本、SVG、布局和点击行为不变。
- 组件规则见 `frontend/src/views/UserDashboard.vue`，状态契约与回归断言见 Cloudscape Visual System。

## 2026-09-23 二级切换路由与填写框边界（本地未部署）

- 登录、节点管理、sing-box 配置和管理概览统一复用 `n-tabs.route-switch-2`，活动线由页签自身绘制并保持导航滚动层可见。
- 登录填写框保留全局外置聚焦高亮；表单项内容轨道允许可见溢出并预留左右空间，避免弹窗容器裁切阴影。

## 2026-09-23 顶栏悬浮下拉菜单圆角（本地未部署）

- “控制台”“管理”和账户三个顶栏按钮及菜单项悬浮面为 14px，菜单外框为 18px；菜单项伪元素四边各内缩 3px，另计 1px 菜单边框，构成 4px 同心内缩。按钮 4px focus ring 外缘与 18px 菜单框对应。规则详见 Cloudscape Visual System，且属于 QingZhou 适配而非 AWS 官方 token。

## 2026-09-23 侧边栏层级线对齐（本地未部署）

- 子菜单层级线改为独立伪元素并对齐子项 SVG 中心线 `20px`，不再贴在子菜单轨道最左侧；不改变菜单层级、宽度或路由。

## 2026-09-23 登录弹窗视觉边界（本地未部署）

- 登录/抽屉全视口遮罩固定为直角，避免全局圆角兜底作用于 `.n-modal-mask` 或 `.n-drawer-mask`。
- 登录卡片不裁切外置 focus ring；登录品牌名与顶栏品牌名使用统一显示字体角色。

## 2026-09-22 Apple 浅色系统蓝按钮强调色（本地未部署）

- 全局按钮主强调色切换为 Apple 浅色模式系统蓝 `#007AFF`，同步 CSS `--accent` 和 Naive UI `primaryColor`；悬停/按下状态保留原有深色层级。未部署。

## 2026-09-22 填写框与搜索框聚焦动画（本地未部署）

- 输入框、数字输入框、选择框、侧栏筛选和顶部搜索框保留原有中性悬浮样式，仅给聚焦态边框、背景和 focus ring 增加刷新按钮同样的 `0.18s` 过渡。未部署。

## 2026-09-22 侧边栏菜单归类层级（本地未部署）

- 一级归类使用静态菜单分组，不显示 SVG、箭头或层级竖线；账户设置与管理后台归入信息分组。
- 管理后台的运营、节点服务、内容系统作为三级归类并保留图标与展开箭头；Naive UI 菜单箭头按实际 `.n-submenu > .n-menu-item > .n-menu-item-content` DOM 层级切换方向，侧栏宽度约束为 100% 轨道，避免展开导致内容横向伸缩。

## 2026-09-22 侧边栏嵌套宽度与状态色（本地未部署）

- `.n-submenu-children` 保持父轨道 `100%` 宽度，以固定 `16px` 左内轨和层级线表达层级，使用 `overflow-x: clip` 限制横向溢出并允许纵向内容完整显示，避免管理后台展开/收起时筛选框、悬浮面和选中面改变宽度。
- 二级/三级菜单选中 SVG 使用 `var(--accent)`，一级静态分组标题恢复不透明的 Cloudflare 中性色。未部署。

## 2026-09-22 侧栏父轨道硬约束（本地未部署）

- 侧栏及 Naive UI 菜单树固定为 `300px` 父轨道并禁止横向溢出，展开三级子树不会改变筛选框、选中背景和侧栏外框宽度；图标色跟随实际按钮主色 `#007aff`。未部署。

## 2026-09-22 控制台操作按钮几何（本地未部署）

- “订阅管理”按普通按钮处理，采用 Sub2 账号管理页刷新按钮的紧凑 `32px/8px` 几何与透明描边；“去商城”按强调按钮处理，保留现有蓝色，仅统一尺寸和圆角。文本、SVG、路由和业务行为不变。

## 2026-09-22 控制台操作按钮状态（本地未部署）

- 两个控制台按钮按 Sub2 的 ring 状态链统一：常态 1px ring，悬浮/聚焦通过独立的 spacer、边框宽度和边框颜色变量扩为 2px ring；普通按钮文字提升为正文色且背景保持透明，强调按钮背景和 ring 同步从 `var(--accent)` 过渡到 `var(--accent-hover)`，禁用态不套用悬浮状态。不改变尺寸、文本、SVG、路由或业务行为。

## 2026-09-22 侧栏收起宽度与高亮面（本地未部署）

- 菜单树增加 inline-size containment 和固定图标/内容/箭头网格，收起管理后台不会再由隐藏子树的 intrinsic width 撑宽侧栏。
- 高亮面使用贴合轨道的 `::before`，固定 Cloudflare 的 `8px` 圆角；选中/子级激活 SVG 强制使用 `var(--accent)`。未部署。

## 2026-09-22 侧栏滚动轨道稳定宽度（本地未部署）

- `.sidebar-menu` 预留 `scrollbar-gutter: stable`，避免管理后台展开/收起时滚动条出现或消失而令筛选框、悬浮面、选中面和图标列横向伸缩；菜单行仍保持 Cloudflare `8px` 圆角与 32px 行高。

## 2026-09-22 Teleport 侧栏高亮覆盖（本地未部署）

- 移动 Drawer Teleport 到 `body` 后继续复用桌面菜单树；菜单几何由组件 scoped 规则单点维护，`global.css` 仅承担通用圆角/宽度兜底，避免重复状态规则互相覆盖。

## 2026-09-22 侧栏组件重复规则清理（本地未部署）

- 删除 `DashboardLayout.vue` 中重复的 `:global(.sidebar-menu .n-*)` 菜单规则，仅保留 Drawer 外壳所需的跨 Teleport 规则；桌面与移动菜单视觉契约不变。
- 删除搜索建议中重复的“账户设置”条目，避免同一路由出现两次。

## 2026-09-22 路由切换与控制台按钮悬浮（本地未部署）

- 用户控制台、订单管理和管理概览时间范围统一使用 Sub2 路由切换几何：`16px` 外框、`12px` 选项与跟随面、4px 内轨、`0.24s` 跟随过渡，离开后回到当前项。
- “订阅管理”普通按钮与“去商城”强调按钮新增 Sub2 式描边扩展 hover/focus ring 和按下位移；普通按钮保持透明中性面，强调按钮保持当前蓝色。文字、SVG、路由不变。

## 2026-09-22 侧栏全局圆角覆盖（本地未部署）

- 根因是全局 `[class*="-item"]` 圆角兜底匹配 `.n-menu-item-content` 并以 `!important` 覆盖组件级 CF 几何规则。
- `global.css` 末尾新增侧栏专用例外，锁定 CF 的 `8px` 高亮圆角、父/子轨道 `100%`、子菜单纵向可见、16px 图标列 + 8px 文字间距和按钮蓝选中 SVG；路由与菜单数据不变。

## 2026-09-22 管理概览切换路由修正（本地未部署）

- 管理概览的“切换路由2”不再依赖 Naive UI `n-tabs-bar` 在滚动层内绘制活动线，改由活动页签自身绘制下划线，避免切换到“趋势”时左侧指示线被 `.n-tabs-nav-scroll-wrapper` 或 `.v-x-scroll` 裁切。
- 用户分析页签链路补齐 `n-tabs-pane-wrapper`、Naive UI 卡片/Spin 容器的 `min-width: 0` 和 `max-width: 100%`，宽表只在 `.tbl-wrap` 内横向滚动，不再把整个管理概览页面撑宽。
- 顶部时间范围“路由切换组件”统一使用 Sub2 几何：外框 `16px`、选项与跟随面 `12px`、4px 内轨；本轮只改前端样式和维护测试，未部署、未改变颜色、路由、数据请求或业务逻辑。
- 验证入口：`npm test`、`npm run typecheck`、`npm run build`、`git diff --check`。

## 2026-09-22 移动端侧边栏统一（本地未部署）

- 桌面侧边栏和移动端 Drawer 统一复用 `sidebar-surface`，共享 Cloudflare 风格的变量、白灰背景、文字色、`300px` 宽度、品牌区高度、菜单行、层级线、圆角和原生滚动规则。
- 移动端 Drawer 不再使用独立的圆角/阴影面板；抽屉内部与桌面侧边栏一致由 `.sidebar-menu` 承担纵向滚动，避免移动端滚动条和背景与桌面版分离。
- 本轮仅修改侧边栏 DOM 外壳与样式测试，未改变路由、菜单数据或移动端抽屉交互；未部署。

## 2026-09-22 侧边栏菜单几何修正（本地未部署）

- 修正 Naive UI `.n-submenu .n-menu-item-content` 的高优先级 `height: var(--n-item-height)` 覆盖：菜单项和父项统一为 `32px`，使用 `border-box` 与 `6px 12px` 内边距，避免悬浮背景跨入相邻菜单项。
- 二级菜单不再因父项按 `32px` 排版、子项被撑成 `42px` 而由 `.n-submenu-children` 裁掉底部；“积分明细”等子菜单的悬浮表面保持完整。路由、菜单数据、移动 Drawer 结构不变。
- 本项目权威视觉明确为 AWS Cloudscape/Cloudflare 侧栏适配；不使用 Kreeper & Co/Anthropic 设计系统。

## 2026-09-22 二级菜单层级线间距修正（本地未部署）

- 二级菜单 `.n-submenu-children` 的左内轨从 `8px` 调整为 `16px`，让层级竖线与悬浮/选中菜单面之间保持约 `8px` 独立留白；不改变一级菜单宽度、路由、菜单数据或选中逻辑。

## 2026-09-22 控制台趋势切换与品牌字体修正（本地未部署）

- 用户控制台“流量趋势”的 `7天/30天` 按“路由切换组件”处理，使用独立选中指示面、悬浮跟随、离开回选和键盘焦点；不改变趋势 API、范围值或数据加载行为。
- 侧边栏 `Kreeproxy` 品牌字样改用 `var(--ff-heading)` 显示字体，固定为 `16px/20px` 并恢复零字距；控制台页面标题和趋势卡片标题分别收敛到 `24px/30px`、`16px/20px`，全局页面标题与 Naive UI 卡片标题也显式使用零字距，符合项目的 Cloudscape 字体刻度；不改变站点品牌数据或 Logo 资源。

## 2026-09-22 侧边栏状态表面修正（本地未部署）

- 侧边栏菜单项在共享 `.sidebar-menu` 边界强制使用 Cloudflare Docs 式 `8px` 圆角，隔离全局 `18px !important` 圆角兜底对 `*-item` 的覆盖；该规则同时覆盖桌面 rail 和 Teleport 到 `body` 的移动 Drawer。
- 悬浮使用中性浅灰 `--sidebar-hover`，当前选中项使用更清晰的中性 `--sidebar-selected`，文字与图标仍按原有层级增强；不添加蓝色装饰边框，不改变路由、菜单数据或点击行为。
- 已为桌面深层菜单和移动全局菜单状态添加回归断言；未部署。

## 2026-09-21 Cloudscape 视觉系统适配

- 源码默认品牌已与生产设置一致：站点名 `Kreeproxy`，描述为“仅限个人在中国大陆以外地区依法依规使用”，公共 Logo 使用 `frontend/public/kreeproxy-brand.png`；该文件与生产 `brand_icon_data_uri` 解码后的 PNG SHA-256 一致。运行时数据库中的管理员设置仍优先于源码默认值，旧默认值 `轻舟`、旧 SVG 和空描述会在公开配置读取时归一化为生产品牌。
- 侧边栏商城入口及 `/shop` 页面标题统一为“订阅套餐”，保留原路由 `/shop`、购买逻辑和订单路径不变。
- 所有 Naive UI 输入框、输入数字框、选择框以及顶部/侧栏搜索框统一标注为“填写框”；常态/悬停边框使用 Sub2 的 `#d1cfc5`，聚焦使用 `#2c84db` 和 `0 0 0 3px rgba(44,132,219,.18)`，聚焦边框和光环使用 `0.18s` 过渡；已覆盖 Naive UI 悬浮层的整条 `border` 和默认 focus `box-shadow`，避免悬浮效果与聚焦效果叠加；不改变控件尺寸和业务行为，路由切换组件仍保留跟随悬浮动画。
- QingZhou 前端保留现有 Vue 3、Naive UI 组件树、路由、侧栏层级、页面顺序和业务交互；视觉层按 AWS Cloudscape 规范做 Vue 等价适配，不直接安装或混用 Cloudscape React 组件。
- 全局 token 位于 `frontend/src/styles/global.css`，Naive UI 语义主题位于 `frontend/src/App.vue`，ECharts 图表使用独立的 Cloudscape 数据可视化色板；排版遵循 AWS/Cloudscape 的 14px/20px 正文、28/36、24/30、20/24、16/20 标题层级、无负字距和清晰字重层级。英文正文使用可商用的 `Inter 18pt Light`，中文正文使用 `Resource Han Rounded CN`，标题继续使用 `Fraunces` + `Source Han Serif SC`，字体资源位于 `frontend/public/fonts/` 并附带 Inter 的 `OFL-1.1` 许可；数字继续使用 AWS 风格的等宽 `Amazon Ember Mono` 回退栈与 `tabular-nums`。
- QingZhou 圆角以用户指定摘要卡的 18px 半径作为外层基准；嵌套曲线按 `内层半径 = 外层半径 - 总内缩` 对齐，阴影外缘约为 `控件半径 + spread`。顶栏采用按钮/菜单项 14px、菜单外框 18px，菜单项四边各内缩 3px 并计入1px外框。小尺寸 Logo 可单独使用 8px；侧边栏按 Cloudflare 独立使用 32px 行高、8px 圆角和 2px 行间距，状态点保持圆形。此为 QingZhou 适配规则，不代表 AWS 官方圆角 token。全局 token位于 `frontend/src/styles/global.css`，键盘 `:focus-visible` 保留可访问焦点环。
- 已移除本轮范围内的玻璃背景、装饰性渐变、悬浮抬升、发光状态和旧蓝绿色硬编码；页面级卡片、筛选器、登录框、监控、上游管理、套餐、用户、节点、订单、积分和帮助界面均复用统一 token。布局、组件类型、组件位置和业务逻辑不变。
- 本轮交付包含 `frontend/tests/cloudscape-visual-system.test.mjs`，验证 token、Naive UI 映射和代表性图表色板。验证命令为 `npm test`、`npm run typecheck`、`npm run build` 和 `git diff --check`。
- 监控首页六张卡片标注为展示卡片，悬浮效果为默认无阴影，悬停/聚焦只增加 `0 8px 28px rgba(0, 0, 0, 0.08)`，不改变背景、边框、位置或透明度；对应类型注释位于 `frontend/src/views/Monitor.vue`。
- 监控首页六个摘要 SVG 使用中性图标色与底色；可用性热力图时间范围是“路由切换组件”，使用独立跟随指示面，图例不属于切换器。详见 [Cloudscape Visual System](.llm-wiki/modules/cloudscape-visual-system.md)。
- 用户控制台四张核心指标卡片复用同一展示卡片和悬浮效果；统一由 `frontend/src/components/StatCard.vue` 控制，悬停/聚焦只增加同样的阴影，不改变卡片背景、边框和位置。
- 订阅管理页四张状态摘要卡片复用同一展示卡片和悬浮效果；对应类型备注位于 `frontend/src/views/UserSub.vue` 的 `.sub-stat` 样式区域。
- 订单记录页四张消费摘要卡片复用同一展示卡片和悬浮效果；对应类型备注位于 `frontend/src/views/UserOrders.vue` 的 `.kpi-card` 样式区域。
- 积分明细页四张积分摘要卡片复用同一展示卡片和悬浮效果；对应类型备注位于 `frontend/src/views/UserPoints.vue` 的 `.kpi-card` 样式区域。
- 管理概览四张运营 KPI 卡片复用同一展示卡片和悬浮效果；对应类型备注位于 `frontend/src/views/AdminOverview.vue` 的 `.kpi` 样式区域。
- 用户管理六张统计卡片和用户卡片均复用同一展示卡片和悬浮效果；对应类型备注位于 `frontend/src/views/AdminUsers.vue` 的 `.ss-item` 与 `.user-card` 样式区域，统计卡片保留筛选选中态。
- 用户组页三张资源摘要卡片复用同一展示卡片和悬浮效果；对应类型备注位于 `frontend/src/views/AdminUserGroups.vue` 的 `.group-summary-card` 样式区域。
- 套餐管理页四张资源摘要卡片复用同一展示卡片和悬浮效果；对应类型备注位于 `frontend/src/views/AdminPackages.vue` 的 `.package-summary-card` 样式区域。
- 其他页面顶部资源摘要统一由全局 `resource-metric` 展示卡片合同控制；用量报表、监控管理、监控详情、帮助状态、订单管理、sing-box 配置总览和在线更新版本概览的独立摘要卡也复用同一悬浮效果；服务器流量分析抽屉中的四张摘要卡同样遵循该合同。管理订单的两组状态/分组筛选标注为“路由切换组件”，使用跟随悬浮指示器并保留筛选逻辑。
- 侧边栏本地按 Cloudflare Docs 公开侧栏源码复刻：使用其浅灰/白色配色、原生滚动条、侧栏筛选、`300px` 轨道、右边框、`32px` 菜单行、`8px` 圆角、弱化文字、中性悬停/选中背景、可折叠分组、子菜单左侧层级线和旋转箭头；筛选框与菜单项共用同一水平轨道，不重复叠加左右边距；路由与移动抽屉行为不变，对应代码区域标注为“侧边栏”。
- 修正侧边栏展开重叠：普通菜单项保持 `32px`，可展开的 `.n-submenu` 使用自然高度，子分组不会覆盖后续项目；全站页面底色、卡片和边框同步 Cloudflare Docs 的 `99%` 灰白、白色和 `92%` 灰阶。
- 管理概览顶部时间范围切换标注为“路由切换组件”，使用 Sub2 几何：外框 `16px`、选项与跟随指示面 `12px`、4px 内轨；悬浮/键盘焦点时选中面跟随指针平滑移动，离开后回到当前选项。管理概览内容页签标注为“切换路由2”，下划线保持在导航层上方，不被滚动容器裁切；页签 pane、筛选区和表格包装层固定 `min-width:0`，切到用户分析时不会被表格最小内容宽度撑开。颜色继续使用现有语义色，不改变数据范围、路由或刷新逻辑。
- 组件类型备注是统一维护合同：凡新增或修改组件、交互状态或独立样式类型，必须在对应模板或样式代码位置添加简洁中文类型备注，例如“展示卡片”“悬浮效果”“路由切换组件”“填写框”“侧边栏”；若引入新的组件类型但用户没有给出备注名称，开始修改前必须提醒用户确认，不能静默省略。

## 2026-09-21 Edge 日次数展示与套餐强制推送（已部署）

- 用户控制台“流量用量”卡片新增当前 UTC 日 Edge 次数额度展示，复用 `/api/user/dashboard` 的 `edge_requests` 汇总，不改变 OCI/原生流量统计。
- 套餐管理页在创建套餐左侧新增“强制推送”。管理员二次确认后，`POST /api/admin/packages/force-sync` 将所有仍持有且套餐仍存在的非退休计划桶同步到当前套餐定义；多时长按原桶时长匹配，已删除时长回退第一档；流量和 Edge 当日已用清零，购买记录、积分、有效期、队列状态和历史报表保留。该操作不会自动推进或重排队列，提交后清理受影响用户的订阅缓存并异步安排节点配置刷新；流量包已合并到通用流量池，不属于可回写的套餐桶。
- 功能源码提交 `8fded8f`、队列回归测试提交 `70d1023` 和源码基线 `c0b46be` 已推送 Fork；部署记录由提交 `2767cef` 同步。已构建并部署 `v0.2.80-kreeper-c0b46be` 到 OCI 宿主 `/opt/qingzhou/qingzhou`，active SHA-256 为 `71a013cb483e5bcea6cdcf8d2a5d4e5bd8b432e349ceaa2ccbe380ac3068e893`。回滚材料位于 `/opt/qingzhou/backups/edge-quota-force-sync-c0b46be-20260921-025700/`，数据库快照完整性为 `ok`；仅重启 `qingzhou.service`，三个服务、三个监听端口、本机/公网健康接口和公网新前端资源均验收通过。

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
- `EdgeUUIDForUser` 使用绕开 UUID v4 版本/变体位的 60-bit 用户 ID payload，并附加 HMAC-SHA256 前 8 字节；HMAC 输入为 `edge:` 加 8 字节大端用户 ID。EdgeTunnel Worker 按同一半字节布局校验，避免用户 ID 穿过版本 nibble 后被解码成错误个人而无法入账。
- `/api/internal/edge/usage` 按 `batch_id` 幂等接收 15 分钟批次，按批次 `usage_day`（UTC 日期）扣减每日次数，返回当日超额用户；套餐与时长选项的 `edge_request_limit=0` 表示不限。套餐原有 `duration_days/expiry_at` 仍统一控制流量和套餐有效期，每日 Edge 超限不会推进排队套餐。
- 全量 Go、前端测试、类型检查和构建均通过；生产环境已配置 `QZ_EDGE_SECRET`、`QZ_EDGE_USAGE_TOKEN` 和 `QZ_EDGE_USAGE_URL`，运行版本为 `v0.2.80-kreeper-68f7055`。
- EdgeTunnel Pages Production 已配置 `EDGE_QZ_SECRET`、`EDGE_QZ_USAGE_TOKEN` 和 `EDGE_QZ_USAGE_URL=https://proxy.kreeper.cc/api/internal/edge/usage`。真实签名空批次请求返回 `400`，认证链路与接口可达性已核验，未产生用量记录。
- 2026-09-24 排查发现旧 Worker/Go UUID 解码在版本 nibble 处使用完整字节乘法，导致用户 ID 大于 255 时回传 `external_id` 错位，个人次数不增加；已改为 nibble 乘法并补充跨语言大 ID 回归测试。Worker 源码和 QingZhou 源码均已修改，尚未重新发布生产。
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
