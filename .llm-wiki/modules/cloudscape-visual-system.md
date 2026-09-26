---
title: Cloudscape Visual System
updated: 2026-09-27
---

# Cloudscape Visual System

## ECharts bundle contract

- 所有图表页面统一从 `frontend/src/utils/echarts.ts` 导入 ECharts；该文件集中注册实际使用的折线、柱状、饼图、热力图、网格、图例、标题、提示框、视觉映射和 Canvas renderer，禁止重新引入完整 `import * as echarts from 'echarts'`。
- 该注册表保持 ECharts tree-shaking，同时把图表代码拆为独立异步 chunk；当前构建首屏主包约 `300.72 KB`，ECharts chunk 约 `567.24 KB`（gzip `189.79 KB`）。500 KB warning 仅提示异步图表包体积，不改变运行时功能或首屏加载合同。

## 独立认证页

- 认证入口使用 `frontend/src/views/AuthPage.vue` 的全屏独立页面，不再使用旧 `LoginDialog.vue` 弹窗。`/login`、`/register`、`/forgot-password` 共用左右分栏认证结构：左侧为 QingZhou 服务说明，右侧为品牌、页面标题和表单。
- Sub2 的认证页只提供布局参考；运行时颜色、字体、品牌和条款使用 QingZhou 的 Cloudscape 适配，不引入 Anthropic/Sub2 视觉 token。左侧文案使用站点配置描述，右侧继续显示注册开关、注册码、邮箱验证、SMTP 未配置提示和 OAuth2 入口。
- 登录、注册和找回密码统一使用 Naive UI `n-form`、`n-form-item` 和统一反馈槽位；校验错误不会推动后续控件。认证成功使用 HttpOnly cookie 会话并按安全的站内 `redirect` 返回原页面。
- 旧 `/?login=1` 只作为兼容入口重定向至 `/login`；API `401`、OAuth 回调失败和受保护路由未登录均统一进入独立认证路由，避免保留两套弹窗/页面认证状态。
- 同一认证组件在三条路由间复用时，会在路由模式切换清空账号、密码、邮箱和邀请码并恢复校验状态；注册配置默认 fail-closed，只有 `/api/config` 明确开放后才显示注册入口。
- 注册链接不因关闭状态消失：关闭时显示状态页，开放或邀请码模式显示真实注册表单；邀请码字段由公开配置的 `register_mode=code` 控制。每个认证字段的反馈槽固定 `28px` 高并使用上下 `6px` 内距，错误出现前后控件位置保持稳定且上下间距对称。
- OAuth2 登录入口只在公开配置返回 `oauth2_enabled=true` 时显示；没有 issuer、client ID 和 secret 时不渲染不可用按钮，管理员在 OAuth2 / OIDC 设置分区完成配置后再启用。
- 三条认证路由共享稳定的 `auth` 外壳 key；登录/注册/找回密码之间切换时不重建全屏页面，也不触发 Shift5 全屏动画，只更新表单模式。认证页与业务页之间的切换仍按完整页面生命周期过渡处理。

## Route indicator ownership

- 全局 `frontend/src/main.ts` 的路由指示器事件分发只匹配 `.n-radio-group.route-switch`，负责共享 Naive UI 单选组的跟随面定位。
- 具有自定义容器和局部活动面合同的切换控件由页面自己维护：包括管理概览、用户控制台、监控、管理监控、帮助文档、系统设置和管理订单。全局鼠标/焦点/resize/MutationObserver 不再写入这些容器的 CSS 指示器变量，避免局部逻辑与全局逻辑同时控制同一高亮。
- 这是控制权去重，不改变现有颜色、尺寸、过渡、路由或业务状态；新增代码契约测试覆盖全局选择器范围。

## Help document panel divider

- `/admin/help` 的文档列表工具栏是一级文档模块内部的 header，不使用全局 `*-toolbar` 的独立圆角；`.document-toolbar` 固定 `border-radius:0`，仅保留底部 `1px var(--border)` 直线，和下方空状态/文档列表共享同一模块边界。
- 外层 `.document-panel` 继续拥有模块圆角和表面，工具栏背景、搜索填写框、发布状态路由切换和空状态内容不变。

## Responsive monitor heatmap header

- 管理监控 `/admin/monitor` 的可用性热力图使用独立 `.heatmap-card` 头部合同：桌面端标题保留在左侧，时间范围路由切换和状态图例保留在右侧。
- 视口宽度不超过 `768px` 时，Naive UI `n-card` 头部改为单列网格；标题主区独占一行，控制区位于下一行并允许内部换行。主区和 extra 均锁定 `width:100%; min-width:0`，避免中文标题被压缩成逐字换行，也避免按钮和图例重叠。
- 该响应式规则只调整头部排列，不改变热力图数据、ECharts 配置、范围切换行为、颜色、桌面端排列或卡片内容高度合同。

## Topbar material

- 公共 `AppHeader` 与登录后 `DashboardLayout` 顶栏采用 Apple 官网 `globalnav` scrim 的可见玻璃材质作为常态：`rgba(250, 250, 252, .8)` 与 `saturate(180%) blur(20px)`；不支持 `backdrop-filter` 时回退到 `.92` 不透明度，底部分界线使用 `rgba(0, 0, 0, .12)`。两个顶栏通过 `useTopbarScrollState` 监听窗口滚动，共享 `is-scrolled` 状态。
- 管理/账户悬浮菜单打开时保留顶栏材质，不再清成透明；菜单面板仍是独立背景和边框，按钮尺寸、菜单定位、互斥状态和菜单动画保持原有合同。顶栏触发器静止态跟随玻璃 token，悬浮/焦点仍使用既有 `var(--card-hover)`。
- 两个顶栏的 stacking context 固定高于页面自绘滚动条（顶栏 `z-index:130`、滚动条 `z-index:120`），确保右对齐悬浮菜单覆盖到滚动条区域时仍保持不透明；滚动条轨道与滑块的几何和交互不变。
- Naive UI `n-tooltip` 从普通白色 `n-popover` 合同中单独排除：提示面恢复 `var(--text)` 深色底、白色文字、独立阴影，并固定 `z-index:2000` 覆盖页面滚动条，避免禁用按钮等提示内容出现白底白字或被滚动条遮挡。
- 公共 `AppHeader` 与嵌套在 `.app-main` 内的 `DashboardLayout` 顶栏均使用 `width:100%; max-width:100%`，分别跟随自己的 containing block；不能使用 `100vw`，否则滚动锁定或侧栏布局时会把右侧按钮推出内容边界。滚动状态同时监听 `window` 与实际 `body` 滚动源。
- 页面由 `body` 承担纵向滚动；平台滚动条绘制被隐藏，页面只使用显式 `16px` 右侧内距作为唯一宽度预留，避免 `scrollbar-gutter` 与自绘轨道在不同浏览器重复占宽。`PageScrollbar` 固定绘制 `16px` 轨道和 `8px` DOM 滑块，滑块通过左右自动外边距适配轨道实际内侧宽度，边框、DPR 或响应式尺寸变化时仍保持精确居中。常态 `#c7c7c7`、悬浮 `#a8a8a8`，不创建第二个滚动区域。短页面不生成 thumb，但稳定槽位和内容边界竖线仍保留；侧栏内部滚动条不复用页面滑块样式。

## Switch controls

- sing-box 配置页右上角“显示 IP”属于“切换开关”：文字位于开关左侧，使用 `n-switch` 表达 IP 打码状态；保留原有 `localStorage` 持久化和地址/预览渲染逻辑，不使用按钮 warning/default 高亮。

## Sing-box machine groups

- sing-box TLS/入站机器分组列表在一级模块内使用左右各 `12px` 的独立留白轨道，并以 `width:auto` 覆盖组件默认 `width:100%`，避免外边距叠加造成右侧贴边/溢出；折叠项继续使用页面背景 `var(--bg)` 且无边框，展开行为和窄屏宽度不变。

## Server status badges

- 服务器管理版本卡的“无流量统计”属于“卡片-状态牌”，使用原文本次级色 `var(--text-2)` 实心背景、白色文字和透明边框；“版本过低”和“未知”继续使用各自语义色。

## Login modal boundaries

- Naive UI 的 `.n-modal-mask` 与 `.n-drawer-mask` 是全视口遮罩，固定为 `0` 圆角，不能被全局表面圆角兜底改成圆角。
- 登录卡片保持 `overflow: visible`，以保留填写框焦点边界的左右可见区域。
- 登录弹窗品牌名和顶栏品牌名统一使用 `var(--ff-heading)`、零字距和显示字号；登录流程与路由不变。

## Floating dropdown menus

- 顶栏“管理”和账户按钮属于“悬浮下拉菜单”，共用 `header-dropdown-menu` 类和同一圆角合同。
- 首页公共顶栏与登录后 Dashboard 的管理/账户悬浮下拉菜单使用互斥打开状态：打开其中一组会关闭另一组，选择菜单项后清理打开状态；菜单内容、路由和触发器几何不变。
- 顶栏“控制台 / 管理 / 账户”以及 DashboardLayout 的管理/账户入口完整复用 Sub2 语言切换的非颜色几何：`32px` 最小高度、`1px` 描边、`12px` 圆角、`0 10px` 内距、`13px/500` 字体、`20px` 行高和过渡；颜色继续使用 QingZhou token。
- 相关下拉菜单使用 Sub2 的 `144px` 宽度、`12px` 内距、`16px` 外框、`2px` 项间距；选项使用 `40px` 最小高度、`8px 12px` 内距、`8px` 圆角和 `14px/20px` 文本。账户头像仍保留自己的 `27px` 方形图标底，不改变图标内容或交互。
- 触发器常态背景使用页面白色 `--bg`，只有悬浮/聚焦才切换到 `--card-hover`；按钮内容和图标在 20px 行高轨道内 flex 居中，图标外边距归零。公共顶栏与 DashboardLayout 的账户按钮共用同一 27px 方形头像、横向内距、内容间距和居中轨道，按钮总高保持 32px，避免页面间出现不同账户样式或灰底常驻。
- Naive UI `quaternary` 触发器同时锁定 `--n-color`、`--n-color-hover/focus/pressed` 及文字/边框变量；不能只设置普通 `background`，否则组件变量会让灰色常驻或覆盖悬浮状态。
- 公共 `AppHeader` 与登录后 `DashboardLayout` header 使用页面色 `--bg`，与 Sub2 的 `.app-header-atelier` 页面背景一致；模块灰色只用于页面模块，不作为整条顶部导航的常态底色。
- 顶栏下拉选项的通用 `::before` 兜底位于专用规则之后，因此必须在全局兜底后再次覆盖：常态 `transparent`，仅 `:hover`、`:focus-visible` 或 pending 状态使用 `--card-hover`；菜单宽度按内容自适应，不额外固定宽度；清除 Naive UI 的 prefix/suffix 预留列并让 label 按内容宽度 flex 居中，避免文案向右偏移。
- 顶栏账户入口使用裸 `18px` SVG 图标，不再渲染独立圆角头像容器；公共顶栏和 DashboardLayout 保持同一图标与文本轨道。
- 公共顶栏与 DashboardLayout 的账户文本统一使用 `var(--ff-body)`、`13px/500/20px` 和零字距；DashboardLayout 不得保留组件级 `font-weight: 600` 覆盖。

## Shared brand rail

- 首页公共 `AppHeader` 的品牌左侧内距固定为 `16px`，与登录后侧栏 `.sidebar-brand` 的内容轨道对齐；桌面右侧导航继续使用原有响应式内距，移动端同样保持 `16px` 左轨道。
- 此项只调整品牌位置，不改变 Logo 尺寸、品牌文字层级、顶栏高度或导航交互。

## Dropdown close stability

- 首页公共顶栏与 Dashboard 的管理/账户悬浮菜单继续共享互斥 `openMenu` 状态；切换时忽略旧菜单迟到的关闭事件，避免两个菜单同时显示。
- 菜单显示由唯一 `openMenu` 状态控制，离开触发区域立即关闭；面板与触发器相接，避免关闭缓冲造成退出延迟。入场沿用 Anthropic Learn 的节奏：`400ms` opacity 渐入，内容轨道用 `200ms` `grid-template-rows: 0fr -> 1fr` 展开；离场不设置 transition，瞬发收起；切换到另一菜单时仍保持互斥。
- 这只改变浮层状态同步时序，不改变菜单内容、颜色、圆角、触发器几何或路由行为。
- 管理/账户菜单使用共享 `useMutualHoverMenu` 单一互斥状态；组件只负责 hover/focus 事件，离开触发区域立即关闭，不再维护第二套开闭镜像状态。
- 浮层恢复页面背景 `var(--bg)`、`1px var(--border)` 外框和原有 `var(--card-hover)` 菜单项悬浮色；默认以触发按钮中心为锚点，组件在竖屏/窄视口空间不足时将面板水平位置夹紧到视口 `8px` 内边距，避免右侧溢出。

- 为避免 Naive UI `n-dropdown` 自带 hover、延迟关闭和 Transition 状态竞争，首页公共顶栏与 Dashboard 的四个管理/账户菜单统一使用 `TopbarHoverMenu`；按钮与菜单共用同一 hover/focus 区域，单一 `openMenu` 状态负责互斥，离开区域立即关闭。
- 面板与触发按钮之间固定保留 `8px` 视觉间距；`.topbar-hover-menu-hit-bridge` 真实透明 DOM 命中桥覆盖间隙，并随面板夹紧后的位置和宽度同步，鼠标从按钮移入面板时不会因空隙触发关闭或闪烁。
- QingZhou 以用户选定的摘要卡提供 18px 外层视觉基准。要求相邻圆角曲线对齐时，优先使用嵌套几何：`内层半径 = 外层半径 - 总内缩`；按钮 4px focus ring 的外缘约为 `按钮半径 + 4px`。
- 上游管理与首页上游余额卡的 OCI/Cloudflare 标题使用透明 SVG provider logo，图标直接位于标题文字前，不绘制独立背景容器；管理页标题 logo 使用 `18px`，首页余额子卡标题 logo 使用 `16px`，分别匹配各自文字轨道。
- Naive UI 下拉选择菜单（包括 `n-select`、`n-popselect` 与 `n-dropdown`）只改弹出菜单本体，复用顶栏菜单的 `var(--bg)`、`1px var(--border)`、`16px` 外框、`12px` 内距和 `0 4px 24px rgba(0,0,0,.05)` 阴影；触发按钮不纳入本合同。选项默认透明，hover/pending 使用 `var(--card-hover)`，selected/active 使用 Apple 蓝并配白色文字；`n-select`/`n-dropdown` 的 `fade-in-scale-up-transition` 与 `n-popselect` 的 `popover-transition` 均使用 `400ms` opacity + `200ms` transform 入场，离场瞬发。各视图标注“下拉选择菜单”，不重复定义选项圆角。
- 订阅管理页订阅地址与“复制”按钮、账号/节点只读值及设置页安装命令属于“复制栏”，不是“填写框组合”：只读输入点击、聚焦或复制时固定使用 `#d1cfc5` 中性边框，不绘制 Apple 蓝焦点线、阴影或过渡特效；复制按钮行为不变，其他可编辑输入框继续使用全局 Apple 蓝焦点合同。

## Secondary route switches

- 节点管理、sing-box 配置和管理概览使用 `n-tabs.route-switch-2`；独立认证页使用 `.auth-mode-nav`。两者共享“二级切换路由”底部活动线合同。
- 二级路由的横向滚动 wrapper 不得继承 Naive UI 的模块圆角：该层同时负责 overflow 裁切，底部左圆角会把桌面首项活动线裁成斜边；wrapper 使用 `border-radius:0`，圆角只保留在外层模块。
- 二级页签的 `.n-tabs-nav-scroll-wrapper` 固定为 `width:100%; min-width:0; max-width:100%` 并启用 `overflow-x:auto`；当页签总宽度超过窄屏可视区时通过触控/横向滚动访问后续页签，不把内容直接绘制到视口外。滚动条视觉隐藏，活动线和整行基线仍保持可见。
- 竖屏（`max-width:768px`）下该 wrapper 是独立滚动区域：垂直溢出隐藏、横向滚动条显示为 4px 细轨道，触控横向滚动不会传递到页面；与系统设置移动端导航使用同一“内容区内独立滚动”的交互合同。
- Naive UI 的 `shadow-start/end` 伪元素在该独立轨道中关闭，避免滚动边缘渐变伪装成活动线或遮盖首尾页签；滚动反馈由轨道本身和活动线提供。
- 标准页签外轨使用一级模块底色 `var(--card)`，与节点管理和 sing-box 配置所在模块一致。活动下划线由活动页签自身绘制，使用 `2px` 高度、`border-radius: 0` 的直线；页签文字轨道保持透明，不额外绘制活动背景色块。导航、页签包装层和内容 pane 保持可见且 `min-width: 0`，唯一的横向滚动由 `n-tabs-nav-scroll-wrapper` 承担，避免窄屏边缘裁切或内容撑宽。
- 活动线显式清除边框、圆角、`clip-path` 和变换，首个页签左端保持直角，不出现倒梯形；颜色、基线和桌面页签排列不变。
- 活动状态只绘制底部 Apple 蓝线；Naive UI 页签显式禁用左侧伪元素、inline-start 边框和阴影，认证导航链接也不绘制 `::before` 或侧边装饰。键盘导航仍保留现有可见焦点状态。
- 竖屏 wrapper 为独立横向滚动条预留的 7px 底部空间不参与页签基线定位；基线向上 7px 与 33px 页签内容底边对齐，避免无溢出页面出现活动线脱离基线。活动线使用 `width:100%; box-sizing:border-box`，确保首项左右边界完整。
- 二级页签导航滚动内容保留 `8px` 左右独立内距，让首个页签及其活动线与外轨左边保持一致留白；该内距不作用于内容 pane。
- 二级页签导航轨道在所属一级模块的完整宽度上绘制 `1px var(--border)` 中性基线；活动页签的 Apple 蓝 `2px` 线覆盖对应区段并置于基线之上。登录弹窗保持透明外轨，但同样显示整行基线。
- 中性基线左右端点与导航内容的 `8px` 水平内缩一致，和首尾活动蓝线共享同一轨道，避免首项左侧或末项右侧出现多出的灰线。
- 登录弹窗填写框保留可见溢出以避免容器遮挡；焦点态不再使用外扩光晕，统一使用 `2px` `var(--accent)` 内边框。
- 认证页导航使用透明文字轨道和整行基线，不绘制独立灰色外轨；节点管理、sing-box 配置和管理概览使用 `var(--card)` 一级模块底色外轨。

## Page-dimension route switches

- 订单记录的订单状态、积分明细的收支、用户管理的套餐状态、监控详情的时间范围，以及用量报表的时间范围/用户汇总与套餐明细，均属于“路由切换组件”。它们使用 `n-radio-group.route-switch` 的 `16px` 外轨、`12px` 选项、`4px` 内轨与共享跟随指示面，不改变原有筛选、查询或导出行为。
- 管理员监控的热力图/单机趋势范围、帮助文档发布状态和 Telegram 设置子分区也属于“路由切换组件”，使用相同跟随指示面，保留各自的数据加载与面板切换逻辑。
- 所有切换选项使用 `inline-flex`、`align-items:center`、`justify-content:center`、`20px` 行高与 `32px` 最小高度。悬浮不绘制强调蓝框；键盘 `:focus-visible` 保留中性可见环。
- 管理概览时间范围、用户控制台趋势、监控首页热力图和管理员订单状态/分组使用自定义跟随指示面；概览继续保留 `overview-range-tabs` 的现有 DOM 合同。所有切换控件离开悬浮/焦点后回到当前选中项。
- 全局 `[class*="-switch"]` 圆角兜底使用 `!important`，各自定义切换器外轨需显式设 `border-radius:16px !important`，选项/指示面为 `12px`，避免视图圆角漂移。
- 登录/找回密码、退款方式、通知目标、节点类型、服务器密钥及 sing-box 表单内 radio 是表单选项，不标记为路由切换组件。

## Interactive blue

- QingZhou 的按钮主强调色使用 Apple 浅色模式系统蓝 `#007AFF`，由
  `frontend/src/styles/global.css` 的 `--accent` 和 `frontend/src/App.vue` 的
  Naive UI `primaryColor` 共同提供。全局主按钮悬浮统一使用
  `--accent-button-hover`（`color-mix(in srgb, var(--accent) 84%, white)`，当前
  `#298fff`），theme `primaryColorHover` 同步；`--accent-hover` 仍用于链接等非按钮
  悬浮，按下态保持独立。图表色板保持独立不变。
- 全局文本选择固定使用 `--selection-bg: rgba(0, 122, 255, .2)` 的 Apple 系统蓝半透明高亮，文字使用 `inherit`；同时覆盖 `::selection` 与 `::-moz-selection`，避免不同操作系统的原生选中色差。此行为与按钮、菜单和路由组件的选中状态分离。

## Radius scaling

- QingZhou 使用监控摘要卡确认外层基准 18px。通用 Naive UI 下拉菜单外框为 18px；选项悬浮伪元素四边各内缩 3px，并使用 `14px / 8px` 椭圆圆角。顶栏和控制台内的管理/账户控件按 Sub2 语言切换源码复刻完整非颜色几何：触发器 `32px`、`1px` 描边、`12px` 圆角、`0 10px` 内距和 `13px/500/20px` 文字；菜单 `144px/12px/16px`，选项 `40px/8px 12px/8px/14px 20px`。按钮和菜单颜色仍归 QingZhou token 管理。
- 这是 QingZhou 的 Cloudscape 适配约定，不是 AWS 官方圆角 token；菜单悬浮面的 top/right/bottom/left 必须一致，避免非同心曲线。侧栏仍遵守独立 Cloudflare 几何合同。

## Form and search focus motion

- 所有 Naive UI 填写框、数字输入框、选择框，以及侧栏筛选和顶部搜索框保留
  原有中性悬浮样式；聚焦边框统一使用 `2px` 全局苹果蓝 `var(--accent)`（`#007AFF`），不使用扩散阴影或外置光晕，并复用 `0.25s` 边框、背景和焦点线过渡。文本光标统一使用同一蓝色 token。复制栏明确排除在该填写框合同之外，始终保持中性边界。
- 焦点线条保持固定 `1px` 几何，使用过渡中的 `inset 0 0 0 1px var(--accent)` 视觉增粗到 `2px`；Naive UI 内部 border/state-border 与原生侧栏筛选都过渡 `border-color`、`box-shadow`（`0.25s var(--ease-standard)`），避免改变 border-width 引起布局跳动。

## Sidebar menu hierarchy

- 侧栏菜单保留 `scrollbar-gutter: stable` 以防展开/收起时滚动条改变布局；由于该轨道独立占用右侧空间，菜单内容轨道使用左 `16px`、右 `0` padding，抵消滚动轨道后的可见留白差异。桌面与移动 Drawer 共用同一菜单、层级和底部折叠按钮样式；移动端的“收起侧栏”关闭 Drawer，折叠态继续使用 `8px` 内轨。

- 一级归类“常用”“商城”“信息”使用 Naive UI `type: 'group'` 静态标题，因此不显示 SVG、展开箭头、竖线或伸缩开关。
- “账户设置”和管理员可见的“管理后台”属于“信息”下的二级菜单；管理后台的“运营”“节点服务”“内容系统”属于三级归类，二级/三级菜单及叶子页面保留 SVG 图标和展开箭头。
- 展开箭头按 Naive UI 实际 DOM 层级 `.n-submenu[aria-expanded] > .n-menu-item > .n-menu-item-content` 变换方向；`.sidebar-menu`、`.n-menu`、`.n-submenu` 和菜单内容锁定 100% 宽度边界，展开不会改变侧栏内部宽度。
- 每级 `.n-submenu-children` 保留 Cloudflare 的子列表轨道：`margin-left:12px`、`16px padding-left`；层级线固定在轨道内 `8px` 位置以独立伪元素绘制，正好对齐对应 SVG 图标中心，二级/三级内容整体右移 `8px` 并与竖线保留透明间距。悬浮/选中面不覆盖竖线且不延长侧栏右边界，菜单内容统一 `border-box`；二级/三级菜单的选中与子级激活 SVG 使用 `var(--accent)`，一级分组标题保持不透明中性色。
- 侧栏展开父轨道固定 `16.5rem`（264px），桌面折叠后为 `72px` 图标轨道；底部折叠按钮沿用 Cloudflare 侧栏 `32px` 行高和 `8px` 圆角，图标项保留屏幕阅读器标签并提供原生标题提示。移动 Drawer 保持 `300px`，不显示桌面折叠按钮。`.sidebar-menu` 与 Naive UI 菜单树全部禁止横向溢出；图标和箭头列均在固定网格列中垂直居中，图标的 `var(--accent)` 与页面主按钮实际 Apple 蓝 `#007aff` 保持一致。
- 菜单树使用 `contain: inline-size` 和固定父/子 `100%` 轨道，收起子树不会改变父行宽度；高亮面由 `.n-menu-item-content::before` 贴合轨道绘制，使用 CF 的 `8px` 行圆角，图标列固定 `24px`（16px 图标 + 8px 间距），选中与子级激活 SVG 强制使用 `var(--accent)`。
- `.sidebar-menu` 额外使用 `scrollbar-gutter: stable` 固定纵向滚动轨道；管理后台展开或收起时滚动条不会改变筛选框、悬浮面、选中面和图标列的可用宽度。

## Dashboard action buttons

- 顶栏未登录时的“登录”使用 `.action-button.action-button--emphasis` 强调按钮，和控制台“去商城”共享蓝色主按钮几何与悬浮提亮状态。
- 控制台“订阅管理”和订阅管理页顶部“订单记录”共用 `.action-button.action-button--normal` 普通按钮；使用 Sub2 账号管理页刷新按钮的 `32px` 高、`8px` 圆角、紧凑内边距、浅色常态文字、悬浮加深文字与中性 ring。
- 控制台“去商城”和订阅管理页顶部“去商城”共用 `.action-button.action-button--emphasis` 强调按钮；使用相同紧凑几何，保留 `var(--accent)` 并在悬浮时与外 ring 一同切换到 `var(--accent-button-hover)`。
- 两种语义的几何、hover/focus ring 和 active 位移只由 `frontend/src/styles/global.css` 单点控制；页面模板负责声明按钮类型，不重复定义状态规则。文字、图标、路由行为不变。
- 订阅管理“显示二维码”、订单空状态“去商城看看”和管理员在线更新“立即更新”统一属于“高亮弧边按钮”，必须使用 `type="primary"` + `.highlight-arc-button` 的实心 Apple 蓝常态；悬浮/聚焦切换为中间深蓝 `var(--accent-arc-hover: #0068d7)`。禁用态保留 Naive UI 默认样式，作为禁用态模板，不由高亮弧边规则覆盖。“更换订阅地址”属于“弧边警告按钮”，保留 Naive UI warning 色与圆角以表达地址立即失效的风险，不改重置流程。
- 登录主动作同样标注为“高亮弧边按钮”；`.highlight-arc-button` 只承载实心 primary 变体，不再把默认型描边按钮混入该语义。标准默认弧边按钮仍由无独立语义类的 Naive UI 默认类型承载，仅在悬浮/聚焦时显示设计蓝边框。
- 登录表单的“警告信息”使用 `12px/16px` 辅助文字规格和上下 `2px` 内距；`n-form-item-feedback-wrapper` 固定预留 `20px` 高度，槽位底部另留 `4px` 间距并保持可见溢出，校验提示出现时不改变表单后续控件位置。
- 普通按钮需要覆盖 Naive UI 内部 `.n-button__border` 基础边框及 `.n-button__state-border` 的 hover/focus 边框变量为透明；否则基础灰边会与共享 ring 叠成双圈，或主题主色蓝边会透过中性 ring 显示。普通描边与 hover/focus ring 仅由共享 `.action-button--normal` 规则绘制。
- “订阅管理”普通按钮悬浮/聚焦时保持透明背景，将文字从较浅的 `var(--text-3)` 加深到 `var(--text-2)`，中性 ring 扩为 2px；“去商城”使用全局相同的浅亮蓝主按钮 hover，背景和 ring 同步从 `var(--accent)` 切换到 `var(--accent-button-hover)`。禁用态不套用悬浮状态。
- 新用户引导区的“选择套餐 / 导入订阅 / 查看帮助”三个普通按钮常态文字使用 `var(--text-3)`，悬浮/键盘聚焦时提升到 `var(--text-2)`。ring 使用与“订阅管理”相同的透明 1px spacer 和 2px 中性外 ring；spacer 必须透明，避免白色遮盖使可见描边变细。不再变蓝底或增加投影。
- 商城空状态“重新加载”使用同一 `.action-button.action-button--normal` 普通按钮语义类，并在模板旁标注类型；尺寸、悬浮/聚焦状态由 `global.css` 单点控制，保留 `loadPackages` 行为。
- 订单页空状态“去商城看看”标注为“高亮弧边按钮”，固定使用 `type="primary"` 实心 Apple 蓝；标准默认类型弧边按钮的 hover/focus 边框继续映射至 `var(--accent)`（`#007AFF`），不与高亮弧边按钮语义混用。

## Dashboard statistic cards

- 可跳转统计卡（当前控制台的“生效中套餐”和“积分”）在鼠标悬浮或键盘聚焦时，仅将 `.sc-sub` 辅助说明切换为 `var(--accent)` Apple 蓝，并显示原有箭头提示；卡片纸面、阴影、边框和尺寸保持不变。不可跳转统计卡的辅助说明继续使用中性文字色。
- 复制栏与提示信息的语义合同见更新页与复制栏规则：只读复制内容不使用填写框焦点环、阴影或过渡特效，更新提示保留语义底色但不绘制外框线。

## Admin user-card interactions

- 用户管理卡片中的“套餐”可跳转块使用 `var(--card-hover)` 中性悬浮面，不使用蓝色业务状态底；箭头提示仍在悬浮时出现，点击分配/查看套餐的行为不变。
- 用户管理顶部状态筛选卡不绘制外框线，常态使用 `var(--card)`、选中态使用 `var(--card-hover)`；仅键盘 `:focus-visible` 保留可见焦点轮廓。

- 管理设置中的邮箱验证及其他布尔配置均标注为“切换开关”，保留 Naive UI 开关自身的启用/停用状态色；全局覆盖内部 rail 的 focus shadow，不绘制额外高亮边框。sing-box 的“显示 IP”复用同一开关合同。

## Select menus

- `n-select` / `n-base-selection` 统一标注为“选择下拉菜单”；点击或展开时保持中性边框，不套用填写框的 Apple 蓝焦点高亮。弹层只改变菜单本体，触发按钮保持组件原样；下拉浮层内的默认、悬浮、pending 和选中项颜色由共享顶栏弹层合同统一。

## Account actions

- 账户设置页的“绑定邮箱”“生成绑定链接”“修改密码”和“前往认证中心绑定”均属于高亮主动作，统一使用 `type="primary"` + `.highlight-arc-button`：实心 Apple 蓝常态、悬浮/聚焦变深、禁用态复用统一低对比实心样式。
- “发送验证邮件”“打开 Telegram”“复制链接”和“解除绑定”等次级/解除操作不套用高亮弧边按钮。

## Data tables

- Naive UI 数据表表头背景使用所在一级模块底色 `var(--card)`；行悬浮统一使用中性 `var(--card-hover)`，不使用强调蓝色底。边线、排序和分页行为不变。

## Settings navigation

- 管理设置分区导航复用侧栏内部菜单合同：外框不绘制边框或阴影；选中与悬浮使用中性 `#f0f0f0` 表面，活动项不绘制额外的左侧蓝色装饰条，键盘焦点仍使用可见 outline。
- 侧栏层级竖线位于独立层级轨道，子菜单悬浮/选中面显式无阴影并为竖线预留透明轨道，避免背景遮盖层级线。
- 系统设置底部“保存设置”属于当前设置面板的主动作，使用 `type="primary"` + `.highlight-arc-button` 的实心 Apple 蓝合同；“放弃更改”保持普通次级动作。

## Update and code surfaces

- 在线更新页的版本概览、回滚、指定版本、进度和变更日志属于一级页面模块，统一使用无边框、无阴影的平面表面；更新提示保留语义背景但不绘制外框线，填写框、进度条和按钮自身边界不受影响。
- Markdown 内联代码使用中性 `var(--bg-subtle)` 底色、无边框、`4px` 圆角、紧凑内距和 `var(--ff-mono)`；深色代码块维持独立代码块样式。
- sing-box 安装命令“复制”属于普通按钮，复用全局 `.action-button.action-button--normal`，不使用 primary/ghost 蓝色主动作语义。

## Project hyperlinks

- 所有可导航文本链接统一使用 `var(--accent)` Apple 蓝；悬浮态沿用全局交互蓝。普通 `a`、`router-link` 和 `n-button tag="a"` 统一复用 `.project-link`，Markdown 正文、在线更新发布页、系统设置说明、用户控制台、证书配置和账户外部入口的局部样式必须保留这一合同，并在对应代码位置标注“项目超链接”。状态标签、统计数字、按钮和焦点环不归入超链接颜色合同。

## Monitor controls

- 一级大模块（包括 Naive UI `n-card`、页面卡片和面板）统一使用无边框、无阴影的平面表面；可聚焦模块使用 `2px` `var(--accent)` outline 保留键盘可见性。弹窗卡片属于浮层，保留独立外框与浮层阴影。
- 监控首页时钟 `.clock` 属于信息文本层，仅保留 `padding`、图标间距和数字排版，不绘制独立背景、边框、圆角或阴影；自动刷新提示与刷新按钮继续使用各自的状态样式。
- 帮助文档管理统计卡的 SVG 图标复用首页摘要图标的中性合同：前景为 `var(--text-2)`，底框为 `var(--bg-subtle)`；统计数字和文字仍可保留状态色。
- 管理监控六个摘要 SVG 同样使用 `var(--text-2)` 中性前景和 `var(--bg-subtle)` 灰色底框；在线、离线、告警等数字状态色保留在文本层。
- sing-box 概览五张卡片标注为“卡片 SVG”，使用语义内联 SVG 替代“机/盾/入/出/同步”文字占位；图标前景统一 `var(--text-2)`，底框统一 `var(--bg-subtle)`，状态信息保留在数字与辅助文字层。
- sing-box 概览摘要按钮不绘制边框或悬浮阴影，悬浮时只切换至 `var(--card-hover)`；键盘焦点保留独立可见 outline。
- sing-box 机器分组属于一级模块内的二级内容，折叠项、标题和内容区均使用页面底色 `var(--bg)`，不绘制卡片边框或活动分隔线。
- sing-box “本机/远程”标注为“区分-身份牌”，采用中性底色和文字，不将位置身份误表达为状态色。
- 用户管理“管理员”属于“区分-身份牌”：身份牌使用 AWS 语义色底（本项目 `var(--warn)`）与白色文字，不使用浅色底搭配彩色文字。统计筛选卡选中态沿用中性卡片悬浮面，不绘制蓝色装饰边框；卡片内“套餐”操作属于“弧边高亮按钮”，保持原尺寸。
- 手动通知、SMTP、Telegram 和在线更新的说明块统一使用 `frontend/src/components/InfoNotice.vue`“提示信息”组件：`var(--accent-soft)` 浅蓝底、Apple 蓝圆形白色 `!`、无边框、无阴影；页面通过修饰类保留各自上下间距。
- 该“提示信息”保留 info 语义底色，但提示面及内部 alert body 不绘制边框或阴影，避免 Naive UI bordered 默认样式回退。
- 设置页“放弃未保存的更改？”确认弹窗关闭 Naive UI 默认 `autoFocus`，避免弹窗初始状态把 focus ring 投到“继续编辑”；键盘主动聚焦仍保留可见焦点。
- 系统设置底部未保存操作条 `.settings-actions` 保留边框、背景和粘性定位，不绘制四周外部阴影；按钮自身焦点和主动作状态不变。
- 在线更新页的架构不可用、指定版本不可用/降级/预发布和更新流程说明统一标注为“提示信息”，复用 `.update-alert.update-info-notice` 的无边框语义样式；版本状态和 warning/info 语义不改变。
- 系统设置 SMTP 未配置和 Telegram Bot 未配置的影响说明统一标注为“提示信息”，使用 `var(--accent-soft)` 浅蓝底、无外框、无阴影和无橙色警告侧线；提示内容与配置逻辑不变。
- 监控首页刷新按钮为中性普通操作，悬浮只使用 `var(--border-strong)` 描边和原色文字，不使用蓝色背景、蓝色边框或蓝色 focus ring。
- 热力图“1h / 6h / 24h / 7d”属于路由切换组件；指示面负责跟随和选中状态，单个选项 hover/focus 不再额外绘制蓝色内框。

## Subscription routing selector

- `UserSub.vue` 的原生配置代理范围 `n-select` 不再使用局部蓝色主题覆盖；其 selected/pending 状态与其他 `n-select`、`n-popselect`、`n-dropdown` 一样使用 `var(--card-hover)` 悬浮灰和 `var(--text)` 正文色，所有选择菜单隐藏右侧勾选图标并取消对应空位，不改代理范围值或订阅链接生成行为。

- The route-switch adaptation follows the Sub2 geometry without importing its
  Anthropic tokens: a `16px` outer rail, `12px` option/indicator corners, a
  `4px` inset track, and a `0.24s` pointer-following indicator that returns to
  the selected option on leave or focus-out. The user dashboard, admin orders,
  and admin overview range switches share this contract.
- The dashboard's normal and emphasis actions use the same compact hover/focus
  ring expansion and pressed `1px` displacement as the Sub2 controls. The
  normal action stays transparent and darkens its text; the emphasis action
  lightens its blue background and ring without using the global dark hover
  token. Onboarding action buttons reuse the normal action's neutral hover ring
  and text-darkening behavior.
- The dashboard account dropdown trigger keeps its avatar tile square across
  hover/press/focus states; mouse focus and press do not paint a circular fill,
  while keyboard `:focus-visible` retains the outer accessible focus ring.

QingZhou keeps its existing Vue, Naive UI component tree, routes, menu hierarchy,
page order and business behavior. The frontend visual layer follows the AWS
Cloudscape system through the custom `cloudscape-design-system` skill.

## Scope

- Source-level branding defaults match the production configuration: `Kreeproxy`
  and `/kreeproxy-brand.png`. The PNG is byte-identical to the production
  `brand_icon_data_uri` after decoding; persisted administrator settings still
  take precedence at runtime. Legacy default values `轻舟`, the old SVG path and
  an empty description normalize to the production brand when public config is
  read.
- The sidebar and `/shop` page call the shop entry 订阅套餐 while retaining the
  `/shop` route and purchase behavior.
- All Naive UI text inputs, number inputs, selections, the header search and the
  sidebar filter are 填写框. Their normal and hover borders use `#d1cfc5`, and
  focused controls use `#2c84db` with a `0 0 0 3px rgba(44,132,219,.18)` ring.
  The focused border and ring use a `0.18s` transition matching the refresh
  control. Naive UI's
  hover border shorthand and default focus shadow are overridden so hover cannot
  compete with the focused state; the route-switch indicator keeps its independent
  pointer-follow animation.
- `frontend/src/styles/global.css` owns the Cloudscape-inspired surface, border,
  typography, focus, semantic status and control tokens. Typography follows the
  Cloudscape scale: body `14px/20px`, headings `28px/36px`, `24px/30px`,
  `20px/24px`, and `16px/20px`, with zero negative tracking. Sub2's active font
  roles are bundled locally: `Fraunces` + `Source Han Serif SC` for display
  headings and `Inter 18pt Light` + `Resource Han Rounded CN` for body text.
  Inter is distributed with its `OFL-1.1` license; the retired oblique Smiley
  asset is not used.
  Numeric values keep the AWS-style `Amazon Ember Mono` fallback stack and
  `tabular-nums`.
- `frontend/src/App.vue` maps the same semantic colors into Naive UI theme
  overrides.
- The selected summary card supplies the QingZhou `18px` outer radius reference.
  For nested corners, use `inner-radius = outer-radius - total-inset`; a focus
  shadow's outside contour is approximately `control-radius + spread`. Small
  Logo/icon containers may use `8px` so they do not collapse into circles;
  status dots remain circular by shape. This is a local adaptation contract,
  not an AWS-published radius token.
  These roles are exposed as `--r`, `--r-sm`, `--r-control`, `--r-overlay`,
  `--r-logo` and `--r-pill` in `frontend/src/styles/global.css`. The sidebar
  intentionally follows Cloudflare's `32px` menu rows, `8px` corners and `2px`
  row gaps. Mouse-selected
  controls do not receive a decorative blue border; keyboard `:focus-visible`
  retains the accessible focus ring.
- ECharts chart roots use the Cloudscape data-visualization palette separately
  from ordinary UI colors.
- Existing page-scoped styles may refine presentation, but must not restore the
  retired blue-gradient, glass-surface or decorative lift treatment.
- Desktop and mobile sidebars share the `sidebar-surface` shell. The mobile
  Drawer removes its independent rounded/shadow panel and lets `.sidebar-menu`
  own the same native vertical scrolling boundary as the desktop sidebar,
  keeping the `300px` track, background, spacing, row corners and hierarchy
  treatment identical across orientations.
- The shared `.sidebar-menu` boundary explicitly pins Naive UI menu rows to
  the Cloudflare-style `8px` radius. This protects the sidebar treatment from
  the global `18px !important` surface fallback and applies equally after the
  mobile Drawer is teleported to `body`. Hover and selected rows use distinct
  neutral surfaces (`--sidebar-hover` and `--sidebar-selected`); neither state
  uses a decorative blue border.
- The global surface-radius fallback includes `[class*="-item"]`, which matches
  Naive UI's `.n-menu-item-content`. The final global sidebar exception therefore
  explicitly restores the CF `8px` radius for the menu row and its pseudo-element,
  pins the `100%` parent track, and preserves the fixed `16px` icon column.
- The `.sidebar-menu` scroll boundary uses `scrollbar-gutter: stable` so
  expanding or collapsing the admin subtree cannot resize the filter or menu
  surfaces when the native scrollbar appears or disappears. It also uses
  `contain: inline-size`, and the
  teleported mobile Drawer keeps the same contract: the menu content
  background remains transparent and `.n-menu-item-content::before` draws the
  `8px` hover/selected track. The teleported tree also receives the same
  `32px` row height, fixed grid columns, nested left track and rotating arrow
  geometry as the desktop tree. This prevents a global surface-radius fallback
  from turning the narrow Cloudflare rail into a large rounded block. Selected
  and child-active SVG icons remain pinned to `var(--accent)` in both desktop
  and teleported menu trees.
- `DashboardLayout.vue` keeps the menu geometry in one scoped `:deep` rule set
  for both desktop and teleported mobile trees. Only the Drawer shell remains
  in `:global` selectors; the generic cross-component radius/width exception
  stays in `global.css`. This avoids duplicate component-level state rules.
- Naive UI's nested-menu rule can otherwise replace the intended row height
  with `var(--n-item-height)` (42px in the rendered menu). The sidebar now pins
  `.n-menu-item` and `.n-menu-item-content` to `32px` with `border-box`, so
  adjacent hover surfaces do not overlap and nested rows are not clipped by
  their parent container. This QingZhou contract is Cloudscape/Cloudflare
  based and explicitly excludes the Kreeper & Co/Anthropic design system.
- Nested menu children keep a separate `16px` left padding track after the
  hierarchy border while retaining the parent width. The menu surface therefore
  stays separated from the vertical rule without changing width when a submenu
  collapses; icon-to-label spacing remains `8px`.
- The user dashboard traffic range control (`7天` / `30天`) is a 路由切换组件:
  its outer rail is fixed at `16px !important` to avoid the global `[class*="-switch"]`
  `18px` radius fallback; the selected surface remains `12px`. It uses its own
  compact neutral shell and moving indicator, has `16px` separation from the
  `流量趋势` title, and keeps hover return, focus-visible treatment and unchanged
  range queries. The sidebar `Kreeproxy` brand label
  uses `var(--ff-heading)` at `16px/20px` with
  zero tracking, so it follows the display font contract rather than the body
  Inter stack. The user dashboard page and section titles use `24px/30px` and
  `16px/20px` respectively instead of local non-token sizes. The shared page
  title and Naive UI card-header rules also explicitly use zero tracking so
  scoped styles cannot reintroduce negative spacing.
- The admin overview `切换路由2` draws its active underline on the active tab
  itself rather than relying on Naive UI's `n-tabs-bar` inside the horizontal
  scroll layers. Its pane, card and spin-content chain uses `min-width: 0` and
  `max-width: 100%`; wide tables remain scrollable only inside `.tbl-wrap`.
  The overview's time-range `路由切换组件` uses the shared Sub2 geometry:
  `16px` outer rail, `12px` option/indicator corners, and a `4px` inset track.
- Monitor summary cards are展示卡片. Their悬浮效果 uses no base shadow, while
  hover/focus adds only `0 8px 28px rgba(0, 0, 0, 0.08)` and preserves the
  paper surface, border, position and opacity.
- Monitor summary SVGs use neutral `var(--text-2)` strokes on `var(--bg-subtle)`;
  chart and server-status colors remain scoped to their data/status surfaces.
- Monitor summary icon tiles are `42px` square with a dedicated `12px` radius;
  do not let the global `18px` surface radius turn these compact frames into
  near-circular shapes. The responsive `38px` tile keeps the same radius.
- The monitor heatmap time-range control is a “路由切换组件”: it uses the shared
  `16px` outer rail, `12px` moving indicator/options and `4px` inset track. Its
  legend stays outside the switch, and range loading behavior is unchanged.
- The four user-dashboard KPI cards reuse the same 展示卡片 and 悬浮效果 through
  `frontend/src/components/StatCard.vue`; clickable cards keep their cursor and
  action affordance, while the card surface behavior remains identical.
- The four subscription-management summary cards in `frontend/src/views/UserSub.vue`
  use the same 展示卡片 and 悬浮效果 contract, with type comments at the
  `.sub-stat` style block.
- The four order-summary cards in `frontend/src/views/UserOrders.vue` use the
  same 展示卡片 and 悬浮效果 contract, with type comments at the `.kpi-card`
  style block.
- The four points-summary cards in `frontend/src/views/UserPoints.vue`, the four
  admin-overview KPI cards in `frontend/src/views/AdminOverview.vue`, and the six
  admin-user summary cards in `frontend/src/views/AdminUsers.vue` use the same
  展示卡片 and 悬浮效果 contract. Admin user cards use it as well; the summary
  strip retains its selected filter state.
- The three user-group resource summary cards use the same contract through the
  page-specific `.group-summary-card` type layer in `frontend/src/views/AdminUserGroups.vue`.
- The four package-management resource summary cards use the same contract through
  the page-specific `.package-summary-card` type layer in `frontend/src/views/AdminPackages.vue`.
- Other top resource summaries use the shared `resource-metric` 展示卡片 contract.
  Independent summaries in usage reports, monitor management/detail, help status,
  admin orders, sing-box configuration, and online-update version overview use the
  same surface behavior. The four server traffic-analysis summaries use the same
  contract inside the analysis drawer. Admin order status/group filters are a
  路由切换组件 with a pointer-following indicator and unchanged filter logic.
- The application sidebar locally mirrors the Cloudflare Docs sidebar treatment:
  the page `--bg` base surface, an independent internal scroll region, a `264px` desktop
  rail and `300px` mobile drawer,
  rail, sidebar filtering, `32px` menu rows, `8px` corners,
  muted `13px/500` links, neutral hover/selected surfaces, collapsible sections,
  nested left rules, rotating chevrons and inset focus outlines. Routes and mobile
  drawer behavior remain unchanged.
- The desktop sidebar rail uses a `1px var(--sidebar-border)` right divider, and
  the Dashboard layout header uses a `1px var(--border)` bottom divider. The
  mobile Drawer remains borderless as a separate overlay surface.
- The public home `AppHeader` brand block mirrors the sidebar brand hierarchy:
  a `40px` mark, `16px` display site name, and `12px/16px` `服务控制台` caption.
  Its existing header padding and left origin remain unchanged.
- The mobile Dashboard menu trigger keeps its existing button geometry and drawer
  behavior while using the Sub2 long-short-long three-line icon: outer lines are
  `18px`, the center line is `12px`.
- The sidebar base and filter use `--bg`; hover and selected menu surfaces remain
  `#f0f0f0`. Desktop `.sidebar-menu` owns the available remaining height and
  scrolls when needed, while `.sidebar-footer` is locked to a fixed `64px`
  height. Short menus may leave extra space in the menu region, but the collapse
  control itself never grows or shrinks; the bottom spacing token remains shared
  by expanded and collapsed layouts. The mobile Drawer keeps a full-height
  scrolling menu.
- Nested submenu structure follows the Cloudflare Docs spacing contract:
  `margin-left: 12px` and `padding-left: 16px`, with the `1px` hierarchy line
  drawn by an independent pseudo-element at the track's `8px` center. The
  submenu width remains bounded by its parent, so moving level-two/three content
  right does not extend the sidebar or its right shadow. Hover/selected surfaces
  begin after the line and use no box shadow, leaving the line and a transparent
  gap visible. Icon and expand-arrow cells are explicitly centered.
- The public header and authenticated Dashboard each use one shared open-menu
  state for the admin/account dropdown pair. A stale close event from the menu
  being left cannot close the newly selected menu, so switching is mutually
  exclusive without a visible flash.
- The Admin overview time-range control is a 路由切换组件. Its outer frame,
  options and sliding indicator use the shared `18px` radius. The overview
  content tabs are annotated as 切换路由2; their underline is kept above the
  navigation scroll layers so the leftmost active indicator is not clipped.
  Their pane, filter row and table wrapper use `min-width: 0`, so the user
  analysis table cannot expand the whole tab container.
  Pointer hover and keyboard focus keep the sliding motion and return to the
  selected range when focus or hover leaves.
- Component type annotations are a maintenance contract: every new or modified
  component, interaction state, or independent style type gets a concise Chinese
  semantic comment at its corresponding template/style location, such as 展示卡片,
  悬浮效果, 路由切换组件, 填写框, or 侧边栏. The comment records the semantic
  type, not an external source. When a request introduces a new type without a
  supplied annotation name, remind the user to confirm the name before editing.

## Shift5 page lifecycle

- 页面级入场与切换统一由 `frontend/src/utils/shift5.ts` 管理。`frontend/index.html`
  在 Vue 首次挂载前写入 pending gate；字体、首屏图片/视频和两次 paint 就绪后，
  纸面遮罩在 189ms 内淡出，页面模块使用 `clip-path: inset(0 0 100% 0)` 到完整显示
  的 1008ms 揭示，模块内标题、说明和卡片头部按 16ms 级联上移。相对原 Shift5
  参数累计提速约 37%；字体/媒体等待与 5 秒 watchdog 属于加载可靠性，不随动效提速。
  `prefers-reduced-motion` 下直接显示内容。
- 路由范围必须区分：公开监控页、登录/退出或布局改变使用全屏遮罩；同一
  `DashboardLayout` 内的用户与管理子路由只在 `.route-page-shell` 矩形内切换，
  顶栏、侧栏、搜索、菜单展开状态和滚动容器保持原节点，不重新加载或动画。路由守卫
  负责离场，目标页面壳负责入场，避免组件同时维护第二套页面过渡状态。
- 系统设置的 `?section=` 是更内层的路由切换：`DashboardLayout` 不接管该查询参数，
  `AdminSettings` 只在 `.settings-main` 内运行 Shift5，`.settings-nav` 分区侧栏保持挂载、
  选中状态和滚动位置不被重载。路由守卫在提交 query 变更前先给 `.settings-main`
  加入 pending 锁，防止 `v-show` 更新与入场 watcher 之间出现一帧新内容裸露；入场建立
  后才解除该锁。
- 该合同只覆盖页面生命周期。图表绘制、数据刷新、按钮按压、菜单展开、折叠面板、
  状态脉冲等组件自身动画继续由各自组件拥有。页面迁移时删除 `route-page-in`、
  `heroIn`、`summaryIn`、`panelIn`、`cardIn`、`riseIn` 等整页/首屏规则，不能用
  全局 `animation: none` 误伤局部交互。
- 页面最上方标题文字有独立的 Shift5 文字入场：`.page-title/.page-sub`、监控的
  `.hero-title/.hero-sub` 以及设置分区 `.settings-section-head > h3/p` 统一以
  `translateY(100%) + opacity:0` 到原位的 1008ms 动画进入，标题节点之间按 16ms
  级联。它们从模块揭示的内容节点集合中排除，因此不会整体 clip 后再次移动；标题文本、
  字体、布局和业务内容不改变。

See Also: `frontend/src/utils/shift5.ts`, `frontend/src/router/index.ts`, `frontend/src/main.ts`

## Scrollbar geometry

- 页面仍由 `body` 承担原生滚轮/键盘滚动，但隐藏平台滚动条绘制，由
  `frontend/src/components/PageScrollbar.vue` 统一绘制 16px 固定轨道、居中的 8px DOM 滑块和内容边界线；
  滑块高度和位移通过 Vue 内联样式绑定，避免 CSS 变量序列化差异。滚动监听、轨道点击、拖拽和设置页定位均读取/写入 `document.body.scrollTop`，并保留 document/window 回退；页面宽度只由显式 `16px` 内距预留，因此 macOS、Windows、Linux 的视觉几何一致。
  长页面滑块按文档高度更新，并支持轨道点击和拖拽；短页面不显示滑块但保留轨道和竖线。
- 桌面和移动端均保留该内容边界竖线；仅滚动 thumb 是否出现由实际内容溢出决定。
- 侧栏菜单是独立的内部滚动容器，继续保留 `scrollbar-gutter: stable` 以防展开/收起
  菜单时筛选框和菜单行发生水平跳动；该局部轨道不参与页面顶栏宽度计算。

## Mobile menu trigger

- Dashboard 移动端“菜单”按钮复用 Sub2 `AppHeader` 的竖屏侧栏按钮合同：`42px` 透明圆角按钮、`22px` 图标、`32x32` 连续折线路径和透明悬浮态；颜色继续使用 QingZhou token。
- 按钮位置、无障碍标签和抽屉行为不变。

## Sidebar filter

- 侧栏 `type="search"` 筛选框隐藏 Chromium 原生搜索清除叉号，避免输入有内容时出现额外控件；输入筛选、Esc 清空、快捷键聚焦和焦点边界保持不变。

## Color rules

### Global surface hierarchy (2026-09-23)

- 页面基础背景统一为 #FFFFFF（RGB 255,255,255）。直接铺在页面背景上的一级模块容器（卡片、面板、表格外壳等，不含按钮和填写框）统一使用 #FAFAFA（RGB 250,250,250），且不绘制外框线。
- 侧边栏基础面使用页面背景 `--bg`；悬浮菜单、菜单悬浮/选中面及其他悬浮交互面统一使用 #F0F0F0（RGB 240,240,240）。悬浮只改变交互面颜色，不改变按钮、填写框和业务状态色。
- 路由切换组件去除外轨边线，外轨背景为 #F0F0F0，悬浮/选中跟随面为 #FAFAFA。键盘焦点仍保留中性可见环，不使用强调蓝边。
- 路由切换按钮本身必须保持透明，高亮只由容器的跟随伪元素绘制；切换或悬浮后不能同时保留旧位置和新位置两个高亮面。
- 一级模块（包括可点击统计卡和引导条）不绘制外框线或外阴影；选择器已选文本与弹出框正文统一使用正文深色 token `--text`。
- 共享展示卡（商城余额/空状态/商品卡、资源统计卡、帮助文档状态卡、sing-box 概览卡、更新版本卡等）的常态纸面保持 `--card`（#FAFAFA），悬浮/键盘聚焦只增加 `0 8px 28px rgba(0,0,0,.08)` 中性阴影，不改背景、边框或位置；状态筛选/活动选择项仍可使用独立的中性跟随面，不使用蓝色外框。
- 订单页“去商城”和管理员页面级右上角主操作（发布公告、新建文档、创建套餐、创建用户组、添加服务器、创建用户等）统一标注为“高亮弧边按钮”，复用 `.action-button.action-button--emphasis` 与控制台“去商城”的尺寸、强调蓝和悬浮状态。
- 以上 token 由 --bg、--card、--card-hover、--bg-soft、--bg-subtle 统一提供；页面和组件优先复用 token，不新增局部灰色常量。

The first eight categorical chart colors are `#688ae8`, `#c33d69`, `#2ea597`,
`#8456ce`, `#e07941`, `#3759ce`, `#962249` and `#096f64`. Continuous maps use
`#529ccb`, `#3184c2`, `#0273bb`, `#015b9d` and `#003c75`. Chart colors must
remain scoped to chart series and must be paired with labels or other visual
distinctions. UI blue is reserved for interaction and links; red, green and
amber carry status semantics.

## Compatibility boundary

The official Cloudscape React packages are the reference implementation, but
QingZhou is Vue 3. A React component package is not imported into the runtime;
Naive UI remains the component implementation and receives equivalent tokens,
states and accessibility treatment.

## Maintenance contract

- Keep the existing route map, sidebar hierarchy, page order, component types,
  component positions and business handlers unchanged during visual updates.
- Prefer the shared tokens in `frontend/src/styles/global.css` and the Naive UI
  overrides in `frontend/src/App.vue` before adding page-scoped literals.
- Do not reintroduce glass surfaces, decorative gradients, glow effects, lift-on-
  hover cards, or legacy blue/green palette literals. Use a semantic token or a
  chart token instead.
- Any new interactive element must retain an accessible name and a visible
  keyboard focus state. Verify both a representative desktop route and a narrow
  viewport after changing shared styles.
