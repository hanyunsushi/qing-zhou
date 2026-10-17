---
title: kreeper第一设计系统 — QingZhou 集成
updated: 2026-10-17
---

## 复选框、单选框与分页（2026-10-17）

共享global.css补齐现有表单/数据控件合同：Checkbox4px角，点击无外焦点阴影；普通Radio按HeroUI3.2.6官方control/indicator及field-shadow源码适配到Naive原生input，项目颜色/字体保持。原全局胶囊根规则仅限button式radio组，普通组无底框；route-switch不变。分页页码及左右翻页8px角、选中蓝底白字，显式覆盖全局-item18px兜底。

canonical CSS/精确源快照/分类与forms/content/source规范、许可、5191的Controls说明示范同步；未增加HeroUI运行依赖、未改业务事件/数据请求。用户已直接指定三个既有控件及其样式决定，无待确认类别；本次未改AWS字体/图表规范。验证归属[Validation](../guides/validation.md#表单选择与分页2026-10-17)。

## DotMatrix左上角绘制修复

loading.css在同一伪元素内以径向背景直接画左上角原点，其余8点保持原偏移阴影。原零偏移外阴影被浏览器裁掉自身边框盒内部区域，导致相位变化但该点不可见；新背景半径`.12em + (phase - 1) × .045em`与原缩放公式相同，仍由diagonal-0驱动。低动态模式直接画currentColor圆，九点一起低频透明度呼吸。独立DotMatrix及Naive BaseLoading共用修复；16/20px占位、对角时序/颜色、加载区域居中与请求/切屏顺序保持。分类仍为加载反馈，无新类型或AWS/字体变更。青舟/canonical/5191共用相同CSS；像素及连续相位验收见[Validation](../guides/validation.md#dotmatrix左上角绘制2026-10-17)。本项已随v0.2.117发布部署，运行态范围见[发布验收](../guides/validation.md#v02117点阵发布验收)。

## 青舟实际侧栏动效接入（v0.2.116已部署）

DashboardLayout桌面/手机均复用KreeperSidebarMenu、sidebar-motion-react.tsx、sidebar-motion.ts及sidebar-motion.css，与canonical/5191同一字节源码。SharedLayoutBg悬浮、子菜单整行错峰/模糊/位移及兄弟重排、200ms整栏宽度及文字错峰直接执行来源React Motion。保留既有单项目MenuOption、权限/路由与外部帮助回调、筛选和选择关闭手机Drawer；不引入多项目最高层，不改页面内部BranchedMenu。

新增运行依赖React/react-dom19.2.0、framer-motion14.3.0及jsx=react-jsx；来源/许可保留frontend/SIDEBAR-NOTICES.md。nav使用layoutScroll且overflow-anchor:none，静态几何不覆盖popLayout退出定位，入场终值释放filter层。分类为侧边栏/组件绘制动画，无新增类型或AWS/字体变更。验收见[Validation](../guides/validation.md#青舟实际侧栏接入2026-10-17)；已随v0.2.116部署，运行态证据见[发布验收](../guides/validation.md#v02116实际侧栏发布与生产验收)。

## 发布状态

青舟源码`48c4f84953e0079640bc352b09ed6deb623d2ab9`和canonical`5a0098c137bb3c6476537284c54aa193de334644`已随[v0.2.117](https://github.com/hanyunsushi/qing-zhou/releases/tag/v0.2.117-kreeper-20261017-dot-matrix-origin)提交发布部署，包含实际侧栏及点阵原点绘制修复；可选多项目最高层仍只用于多项目复用/示范。历史记录按日期保留，当前运行态见[发布验收](../guides/validation.md#v02117点阵发布验收)。

## 顶栏竖屏按实际按钮内容显示

global.css与canonical kreeper.css共享规则作用于公共/控制台header-right按钮：orientation:portrait或≤768px，有功能SVG只显示SVG；无SVG保留文字与自身宽度，不补图标、不隐藏入口。附带CSS下拉箭头不算功能图标。AppHeader/PublicHeader不再写按入口类名强制隐藏的局部规则；DashboardLayout/Shell管理入口只有文字，有权限时手机也保留；账户SVG入口补齐可访问名称。图标fine32px/coarse44px，权限/菜单/事件保持。沿用顶栏/普通按钮/悬浮下拉菜单分类，源快照/pattern/规范/5191同步；[验收](../guides/validation.md#顶栏按内容显示2026-10-17)。本地未部署。

## 实际及复用侧栏直接运行来源React动画

KreeperSidebarMenu为Vue数据/事件桥接，sidebar-motion-react.tsx运行来源SharedLayoutBg、layout-position、popLayout与两个附件的父子variants。删除Motion Vue适配和额外分组动画祖先/累计延迟；SharedLayoutBg的直接motion.li孩子和relative/z10内容层保留，顶层入口与子树属于同一投影结构。真实nav以layoutScroll参与测量，关闭overflow-anchor；退出定位/宽高不再被旧CSS覆盖，padding/层级线保留。Vue label/icon只在React独占叶节点挂载并随root卸载清理。每组子菜单也独立复用来源SharedLayoutBg与弹簧选中投影，父路径隔离layoutId/hover作用域；原错峰展开/反向退出保持，撤掉子项静态hover背景。子项入场完成追加transitionEnd.filter=none，释放blur(0px)形成的层叠上下文，防止滑动背景盖住相邻行文字；退出仍使用原blur3。

依赖React/react-dom19.2.0和framer-motion14.3.0；青舟DashboardLayout桌面与手机已接入相同桥接/源码资产，三项依赖列入runtime dependencies；页面内部BranchedMenu保持独立。原项目颜色、264/72/300px、32px行、单项目边界、底部控制/键盘/搜索继续保留。分类注释为侧边栏/组件绘制动画，无新类型、字体或AWS规则变动。来源源码/本地复核记录见[Validation](../guides/validation.md#侧栏动画完整源码复核2026-10-17)。

## 可选多项目路由最高层

仅projects.length>1启用；每个项目头位于其所属菜单上一级，点击独立展开/收回分组与页面。头部48px、SVG替代字母Logo、右侧同款Motion箭头、与其他入口相同中性共享悬浮/选中面，撤掉独立项目切换区/蓝底/侧标。单项目无此层，实际青舟DashboardLayout/router不接入。

项目数据提供key/label与caption/icon/options/expandedKeys；Shell按project:<key>隔离内部key，保存sidebarRouteKey与sidebarProjectOwner，跨项目同名路由不串披露/选中。选择项目头只控制披露和上下文；手机保持Drawer，选择叶子才navigate并关闭。项目key不会混入页面navigate。筛选临时打开匹配父级、清空恢复状态，顶栏searchItems仍由宿主按当前上下文提供。项目切换不重建React root或清空其他披露；桌面整栏收起保留最高项目层的开合key与原导航入口图标，仅清空原二级起的可展开子菜单和筛选；项目图标在72px轨道独立开合，点击深层组才展开整栏。

项目最高层复用原SharedLayoutBg、spring箭头、popLayout/clip与兄弟重排；各动作整行使用原子菜单y=-6/blur3/opacity及45ms进入/25ms反向退出错峰，文字通过公开MotionContext接回原整栏stagger父级，保留源码30ms/20ms横移错峰，不用逐项animate；项目披露不驱动文字横移；内容flow-root包含分组margin，项目按钮和父盒都保持48px；文字区36px限高网格、标题20px/说明16px行高、6px纵向内距，垂直居中且单行省略；文字区及strong/small采用overflow:clip与4px overflow-clip-margin保留首字越出排版框的笔画，SVG轨道与动效不改。折叠40×40图标行居中，手机300px直角/隐藏原生滚动条。规范、分类注释、coverage与5191同步；[本地验收](../guides/validation.md#项目最高层折叠分组2026-10-17)。

## 双区组合下拉（独立菜单，本地未部署）

用户明确左右是不同菜单。TopbarHoverMenu在splitLabel模式下以hoverOptions提供左服务菜单、options提供右操作菜单；computed menuOptions按splitMode选对应数据。左hover/focus总是切到左菜单，右click总是切到右菜单或再次关闭；当前侧单一渲染，不叠加，两边expanded状态独立，箭头只表示右菜单。菜单positionPanel分别以文字区/箭头区为锚，原根坐标、8px视口夹取及桥保持；当前侧或选项变化后重新定位。外部/焦点/Esc、父级互斥与监听清理沿用。

共享CSS未改，保持左88/右36/总126.5px和触摸44px合同；普通顶栏不传splitLabel，原trigger槽与整体hover不变。示范左为计算/存储/网络，右为新建/导入/导出，独立selectDropdownMenu只关闭组合菜单和显示示范反馈，不更改旁边“弹出选择”的选中值。项目/注释/canonical规范/精确快照/pattern/coverage及5191一致，无新视觉分类或AWS规则改变。验收见[独立菜单](../guides/validation.md#双区下拉独立菜单2026-10-16)；v0.2.114是修正前发布，未冒称本地修正已上线。

## 加载反馈的区域居中

`page-loading.ts`维护pageLoadingTarget并提供loadingRegionCenter/usePageLoadingPosition。router在导航开始即选择保留壳的layout-content或settings-main；Shift5.prepareEnter在挂载时交接实际root。route-page-shell定位为所属layout-content，settings-main优先独立定位，全页qz-shift5-page-shell使用视口。App与Gallery的fixed点阵共用返回style，而按钮/Naive模块符号保持自身布局。

定位取目标与visualViewport交集，排除同壳sticky顶栏；ResizeObserver在布局变化时重算，滚动/窗口/可见视口事件合帧更新，nextTick复核移动首屏。加载结束或取消清理目标和监听，scope销毁释放watch/observer/rAF。目标完全离屏不把符号挪到常驻导航区域。沿用“加载反馈”分类，图形、动画和请求门控不变；canonical规范/源码/示范与注释同步，验收见[Validation](../guides/validation.md#加载区域内居中2026-10-16)，已随v0.2.114发布部署。

## 文件夹投影、状态牌、导航与资源圈

- `shift5.runShift5Enter`对含.gf-root的揭示块使用96px clip outsets，从上边界外开始、终帧保留模糊投影空间；非文件夹块和原1008ms/级联/finish时序不变。
- `UserOrders`与`AdminOrders`的成功/已退款使用NTag及显式`n-tag--success-type/n-tag--warning-type`，命中全站6px/13px600/3px10px几何。Naive的type prop不自动生成这些class，不以type源码断言替代实际样式验收。
- `.route-switch-2`复用原Naive活动bar测量left/max-width，以240ms同路由切换节奏过渡；wrapper内距8px、scroll-content零重复内距、baseline与bar共用滚动坐标。移除每个活动tab伪线；reduced-motion/transition-disabled保留。
- Gallery标题为“切换路由”；四个浮层触发器共用顶栏12px角/固定1px框/透明到中性悬浮面。原click/hover、互斥、选项、Popover/Tooltip不变，保持已有两枚箭头，没有新SVG。
- ResourceGauge以inline-size容器及min(13px,16cqi)适配百分比、%按.6923em；完整100.0%仍显示一位小数、不截字。示范列以76px最小宽度auto-fit换行，圆弧、颜色、数据和绘制逻辑保持。

沿用“玻璃文件夹卡片 / 组件绘制动画 / 区分-状态牌 / 二级切换路由 / 路由切换组件 / 悬浮下拉菜单 / 数字展示”已有分类，无新增类型。源码、canonical引用/精确快照/pattern与5191同步，验收见[Validation](../guides/validation.md#六项视觉复核2026-10-16)，已随v0.2.114发布部署。

## 设置页首次入场与分区切换

`DashboardLayout`整页hook以`route.name === 'admin-settings' ? route.path : route.fullPath`为key，不再禁用设置页入口。首次直达或从其他路由进入，由route-page-shell统一隐藏/揭示标题、二级侧边栏与正文。`AdminSettings`的settings-main hook设置enterOnMount=false，只处理已进入后的分区fullPath变化；分区导航常驻但首次整页不能抢先显示。

沿用“加载反馈 / 组件绘制动画 / 二级侧边栏”分类，未修改BranchedMenu、页面布局、请求/重试、保存和认证。canonical源码快照、pattern、loading/motion规范与5191示范说明同步。实际慢请求与分区验证见[Validation](../guides/validation.md#设置页首次入场与分区切换2026-10-16)，已随v0.2.114发布部署。

## 文件夹滚轮与数字字面（2026-10-16，v0.2.114）

`GlassFolder.wheelPreview`在原实际对象命中边界内增加受控open门禁：只有`props.open && files.length>4`时preventDefault/stopPropagation并切换预览。闭合、悬浮预展开、收回后及四项以内保持页面滚动；原点击、事件、互斥文件夹与购买逻辑不改。

前端`--ff-mono`和示范统一为自托管Courier Prime Regular/Bold，字体文件和OFL放于`frontend/public/fonts/courier-prime`，复用包沿用同字节资产；两个face统一size-adjust125.53%，从字体capHeight比1490/1187校准到Inter参考字面。该字体层规则覆盖numeric/mono工具类及现有局部数字/日期/IP等宽消费者；单位/说明保持正文，各处字号/行高不变，无transform/zoom逐处放大。四个中英显示/正文角色保持；独立Go HTML模板不在本轮前端范围。

数字face的升降部同时校准：`ascent-override77.1728% / descent-override19.2154% / line-gap-override0%`，由Inter原始hhea度量除以size-adjust比例得到。相同行高的数字与正文共用基线，不对单个金额施加偏移，也不改变字号、原标签高度；“区分-信息牌 / 数字展示”源码注释与canonical同步。验证见[数字混排基线](../guides/validation.md#数字混排基线2026-10-16)。

分类仍为“玻璃文件夹卡片 / 数字展示”，canonical typography/glass-folder/foundations/reuse、字体来源说明、源快照、pattern、coverage与5191运行示范同步。AWS Typography本轮已读取，125.53%明确为项目适配值；无新类型。验证见[Validation](../guides/validation.md#文件夹滚轮与数字字面2026-10-16)，已随v0.2.114发布部署。

## 高亮弧边统一与状态牌几何（2026-10-16，v0.2.114）

按钮视觉类型由普通、强调、默认弧边、高亮弧边和删除组成，禁用/loading沿所属类型表达。退款、下架、强制推送、解除链路、变更订阅地址及确认主动作共用高亮弧边：primary、Apple蓝/白字、18px角、32px桌面/44px触摸、悬浮/聚焦/按下同一提亮色、静止点击。原warning按钮调用已迁移；20处warning确认框保留反馈类型并提供positiveButtonProps.type=primary，由`.n-dialog__action`与显式highlight-arc-button共享声明。风险文案、确认、请求状态与原业务回调不改。

`global.css`中success/warning/error/info/inactive五种标签共用根与内部边线6px角、3px 10px、13px/600；inactive原先只设颜色，现已纳入几何规则。canonical FolderSpecimens购买示范直接使用NButton，局部类只负责margin-left布局。Controls移除重复风险按钮示范，套餐操作示范按同一高亮类别。

分类注释、buttons/interactions/semantics/overlays/showcase/foundations、精确source-reference、受影响pattern、coverage和5191示范同步，无新增类型或AWS颜色/排版调整。源码与本地验收见[Validation](../guides/validation.md#高亮弧边统一与状态牌几何2026-10-16)，已随v0.2.114发布部署。

## 下拉箭头、顶栏与竖屏页签（2026-10-16，v0.2.113）

- `global.css`的`.topbar-trigger-chevron`采用10×10px固定占位和对称SVG mask，只有0/180度旋转，避免L形边框视觉重心翻转移位；四个示范/顶栏入口共享实现。
- `DashboardLayout.vue`与可复用`KreeperShell.vue`同步：操作列max-content、标题至少120px、搜索min-width0且最大400/360px；<=768头像按钮同时隐藏姓名和箭头。
- `.route-switch-2`的中性基线位于实际`.n-tabs-wrapper::after`，与活动页签底线共用bottom0和横向滚动坐标；滚动层自然撑高，移除固定40px和bottom7补偿、组件重复底边。

沿用“下拉选择菜单 / 悬浮下拉菜单 / 顶栏 / 填写框 / 二级切换路由”分类，源码/CSS注释、canonical复用资产、精确源快照、pattern、规范和coverage同步。没有新增类型、颜色/字体/AWS规则改变。原版二级侧边栏不改。验收见[Validation](../guides/validation.md#下拉箭头顶栏与竖屏页签2026-10-16)。


## 二级侧边栏：项目颜色、去菜单图标（2026-10-16，v0.2.113）

用户确认仅移除菜单项前的SVG图标，保留原SVG分支线和动画。BranchedMenu的模板与附件逐字相同；script仅将默认颜色改为项目正文/Apple蓝/中性边界token，并去掉默认菜单icon字段和对应未使用导入，其他参数、状态、路径与事件保持原版。可选图标API仍在，标准默认菜单与实际设置数据不提供icon。

实际AdminSettings与Gallery共用该组件，示范不再放于深色承载面。canonical导航/侧栏/语义/复用/来源、source-reference、pattern、coverage和测试已同步；分类仍为“二级侧边栏”，没有新增类型或AWS规则变化。验证见[Validation](../guides/validation.md#二级侧边栏项目颜色与无菜单图标2026-10-16)，已随v0.2.113发布部署；生产证据见[Validation](../guides/validation.md#v02113导航同步发布验收)。

## 2026-10-15 二级侧边栏视觉修复（本地未部署）

根据参考组件 BranchedMenu 的精确几何，修复 `AdminSettings.vue` 二级侧边栏的视觉细节，确保与参考规范完全一致：

**修复项：**
- 主干线宽度从 `2px` 改为 `1.5px`
- 活动标记宽度从未定义改为 `1.5px`，高度保持 `16px`
- 分组标签字体从 `15px` 改为 `calc(14px + 1px) / 1.2`
- 子项字体保持 `14px / 1.2`，确保行高 `1.2`
- 展开区主干宽度统一为 `1.5px`，圆角保持 `1px`
- 主干截止位置使用 `calc(36px - 10px)`
- 分支圆角统一为 `10px`
- 分支位置使用 `calc(50% - 5px)` 垂直居中
- 分支尺寸保持 `18px × 10px`，线宽 `1.5px`
- 活动分支延伸线宽度统一为 `1.5px`

**验证覆盖：**
- 新增静态 CSS 测试 `frontend/tests/secondary-sidebar-visual.test.mjs`（13 项几何断言）
- 全部 `193/193` 前端测试通过
- 本项保持配色不变，使用 CSS（非 SVG）实现所有几何
- 与参考组件在行高、字体、线宽、圆角、位置等所有视觉尺寸完全对齐

本项已同步：`AdminSettings.vue` 源码、测试文件；未提交、未发布、未部署。验证见 [Validation](../guides/validation.md#二级侧边栏视觉修复本地未部署)。


## 2026-10-15 状态牌与标签视觉统一（发布候选）

所有标签类型（状态牌、信息牌、身份牌、位置牌）统一几何样式：圆角 `6px`（不再使用 pill 形状 `18px`）、字重 `600 (semibold)`、内边距 `3px 10px`、字号 `13px`。视觉形式完全一致，语义仅通过颜色区分，符合 Xcode 和系统设置的系统化工程风格。

全局引入四组 Apple 状态色的加深文字版本：
- `--success-text`: `#12A652` (原 `--success` 加深)
- `--warn-text`: `#E37100` (原 `--warn` 加深)
- `--danger-text`: `#DD3730` (原 `--danger` 加深)
- `--inactive-text`: `#828282` (原 `--inactive` 加深)

状态牌底色维持原有浅色透明度 (0.18-0.20 alpha)，文字改用加深色，确保深色模式可读性。应用到：
- 状态牌（正常/警告/异常/未启用）
- KPI 数字（成功/退款、收入/支出）
- 订单金额（退款删除线）
- 流量告警文字
- 监控状态文字

该统一原则已应用到全局样式 `frontend/src/styles/global.css` 和所有使用状态色显示文字的视图组件（`AdminMonitor.vue`、`UserOrders.vue`、`UserPoints.vue`、`Monitor.vue`），并同步设计系统示范页。模板与 CSS 责任边界均标注"状态：标签"分类注释。

QingZhou、canonical skill、源码示范和独立示范已完成同步；`180/180` 前端测试、typecheck/build、Go tests/vet、skill `28/28`、独立 build 与 `77/53/238` audit 全部通过。本轮仍待 Release/生产部署，验证见 [Validation](../guides/validation.md#状态牌与标签视觉统一发布候选)。


## 开关与手机滚动槽（已发布集成）

全局 Naive UI `n-switch` 沿用“切换开关”语义：轨道 `40×23px`、滑块 `17×17px`、内距 `3px`；滑块使用 `500ms cubic-bezier(.68, -.55, .265, 1.55)` 回弹，按下缩放 `0.96`，保留状态色、禁用、键盘焦点与 reduced-motion 语义。实现位于 `frontend/src/styles/global.css`，不新增设计类型。

≤768px 页面继续使用原生 body 滚动，隐藏 `PageScrollbar`，不绘制或预留桌面滚动条槽位；`scrollbar-gutter:auto` 与 `padding-right:0` 的移动端强制覆盖用于清除 Naive UI 弹层滚动锁留下的右侧补偿。移动侧栏自己的原生滚动合同不变。该合同已随 `v0.2.107-kreeper-20261014-switch-mobile-scroll` 发布并部署；项目门禁、资源和运行证据见[Validation](../guides/validation.md)与[Deployment](../guides/deployment.md)。

## BranchedMenu 视觉合同复核（发布候选）

按用户提供的 BranchedMenu 参数重新核对二级侧边栏：一级分区保留 36px 行高并默认只展开第一组（`defaultOpen=0`），二级项使用 40px 缩进；主干、分支弧线和活动延伸线继续使用 CSS，不使用 SVG。折叠分支由 `grid-template-rows: 0fr → 1fr` 配合独立裁剪层实现，收起后不再占用残留高度；活动项维持中号字重，不因选中额外变成粗体。`AdminSettings.vue` 实际设置页、canonical 示范页、pattern、源快照和 coverage hash 已同步。本项源码、规范、快照、示范与验证记录已纳入 `v0.2.112-kreeper-20261015-secondary-sidebar-final` 发布边界并完成生产部署核验。

## 玻璃文件夹展开状态修正（本地未部署）

`GlassFolder.vue` 的 hover/focus-within 状态现在只在闭合对象上生效。此前 `.gf-root:has(.gf-interaction:hover)` 的选择器 specificity 高于 `.gf-root[data-open]`，鼠标停留在已点击前盖时会覆盖展开参数，纸页只到 hover 位移而未正常弹出；改为 `.gf-root:not([data-open]):has(...)` 后，展开保持完整翻盖与纸页扇形。该修正仍归“玻璃文件夹卡片”，源码、canonical skill 组件/快照/pattern/契约与 5191 `#folders` 已同步，未提交、未发布、未部署。验证见 [Validation](../guides/validation.md#玻璃文件夹展开状态修正本地未部署)。

## 2026-10-15 下拉点击反馈与二级侧边栏可见性复核（本地未部署）

全局按钮与下拉触发器点击取消位置下移和水波扩散；真实 loading、颜色语义、键盘焦点不受影响。点击下拉的分割线固定为32px并贯穿按钮内容高度，箭头有固定占位，打开只旋转方向，不引起文字或按钮移位；悬浮顶栏入口仅追加箭头。该实现沿用“普通按钮 / 下拉选择菜单 / 悬浮下拉菜单”分类，无新增样式类型。

二级侧边栏不是示范页才有的孤立展示：`frontend/src/views/AdminSettings.vue` 的实际系统设置页已经包含独立 CSS-only 分支导航。示范页 `#navigation` 也展示同一模式；原先看到的 `5197` 旧进程未重载示范资产，现已重启同步，`5191` 与 `5197` 均可见示范。真实 QingZhou `5173` 未登录会先跳转认证页，生产站点尚未部署本地改动，因此线上旧页面看不到本轮设置页改动。未使用 SVG，保留无障碍和键盘合同。

本轮源码、canonical CSS/示范/源快照/契约与本地示范进程同步；未提交、未发布、未部署。验证见 [Validation](../guides/validation.md#下拉点击反馈与二级侧边栏可见性复核未部署)。

## 2026-10-15 顶栏组合下拉与完整互斥示范（本地未部署）

示范页 `#menus` 的“完整下拉交互”现在只保留四个互斥控件：点击下拉、弹出选择、Popover、Tooltip。四者共享 `overlayOpen` 单一状态，打开一个时立即关闭其他浮层；移除独立重复的“顶栏同款互斥菜单”展示，避免把同一模式展示两次。Popover/Tooltip 使用 `show-arrow=false`，共享 CSS 仅作兜底隐藏 Naive UI 下方小圆形/箭头，不改变需要箭头的其他浮层合同。

点击下拉沿用用户指定的 Try Claude 顶栏组合几何：文字区右侧保留 16px 分割竖线和 7px 描边向下箭头，打开时箭头旋转 180°；公共顶栏与控制台顶栏的悬浮下拉入口只追加旋转箭头，不追加分割线，原有按钮尺寸、颜色、面板和命中桥不变。该参照只采用“文字区 + 分割线 + 箭头”的几何关系与旋转行为，不引入 Anthropic token、字体、组件库或独立设计系统。

本次继续沿用既有“下拉选择菜单 / 悬浮下拉菜单 / 浮层和反馈 / 互斥菜单状态”分类，模板和 CSS 责任边界均有青舟同款分类注释，未出现需要拟定的新样式类型。源码、canonical skill 的 `topbar`/`overlays`/`showcase`/来源说明、复用组件、源快照、契约和原 5191 示范已同步；本项仅本地源码与示范，未提交、未发布、未部署。验证见 [Validation](../guides/validation.md#顶栏组合下拉与完整互斥示范未部署)。

## 系统设置二级侧边栏（未部署）

`AdminSettings.vue` 的设置分区导航是独立的“二级侧边栏”，不是全局主侧栏的 264px/72px rail。宽屏保持 210px 导航列和 22px 内容间距；一级分区可展开/折叠，二级项继续使用原 `section` 查询参数和页面滚动定位。路由直达会自动打开所属分区，搜索结果在同一导航轨道内临时替换分支树，清空后恢复。

分支主干、子树竖线、水平分支和活动标记全部由 CSS 绘制，明确不使用 SVG；活动标记用 ResizeObserver 跟随一级按钮，展开采用 `grid-template-rows` 过渡。模板与 scoped CSS 均标注“二级侧边栏”，二级项有 `aria-current`，一级按钮有 `aria-expanded`，折叠项 `tabindex=-1`。<=900px 为页面内纵向导航滚动区，<=640px 不产生横向溢出；reduced-motion 时关闭相关过渡。

规范入口同步至 canonical skill 的 `references/navigation.md`、`references/sidebar.md`、`references/semantics.md` 和 `assets/patterns/AdminSettings.md`（skill 根目录：`/Users/hinaw/Library/Mobile Documents/com~apple~CloudDocs/obsidian vault/knowledge vault/ai/agent-skills/custom/kreeper-first-design-system`）；本项仅本地源码和规范，未提交、未发布、未部署。


## DotMatrix发布范围

加载组件、CSS连续相位、API/router/Shift5就绪门控及对应测试已随v0.2.106发布，源码3a91d7748816957587d682baff9697b9cc1968db。只发布加载相关改动，不包含复制/Dialog、文字链接或玻璃文件夹等并行未提交功能；skill与本地示范可展示这些工作区增量，不代表生产全已部署。当前运行证据见[Deployment](../guides/deployment.md)，生产逐帧及加载/切屏顺序验收见[Validation](../guides/validation.md)。

## 文字链接与复制状态覆盖

普通文字导航链接与Markdown、`.project-link`共用“项目超链接”合同：常态Apple蓝/无下划线，hover与focus-visible保持Apple蓝并显示下划线，键盘保留2px outline。通用`a`规则补齐下划线与键盘状态，示范顶部公共顶栏/登录页面入口显式标记`project-link`和责任注释；按钮、菜单等链接容器仍按自身专项规范。

两种复制栏保留蓝色与中性表面，几何及交互共用“复制栏”合同。专项选择器包含实际Naive按钮类型和enabled状态，覆盖普通按钮hover/focus/pressed优先级；根及内部边线仅220ms颜色过渡，固定1px边线、零shadow/transform。中性示范按钮不再混用`action-button`。源码、canonical content/forms/复用CSS、Controls/Gallery、源快照/pattern和原5191运行副本同步。没有新分类、AWS规则变更或部署；证据见[Validation](../guides/validation.md#文字链接与两种复制按钮未部署)。

接缝绘制层必须固定：Naive输入state-border的z-index1会越过-1px重叠接缝，常态盖住蓝底；按钮hover状态边线再盖住输入灰线，DOM不变仍出现向左扩张。复制栏组isolation:isolate、按钮所有状态z-index1，让整个按钮始终位于输入边线之前。键盘内部2px outline/offset -3px（primary白、中性accent）保留，但不是此次悬浮接缝缺陷的根因。分类注释、forms、源码/skill契约、快照与原5191同步；验收同时检查截图接缝和矩形，沿用“复制栏”，没有新类型或部署。

## Markdown链接下划线

Markdown正文沿用“项目超链接”合同：`global.css`中`.md a`常态Apple蓝且无下划线，hover/focus-visible保持同色并显示underline、offset3px，键盘保持2px焦点框。取消此前Markdown常态underline的局部例外，不改字体、布局或导航行为。CSS责任分类注释、canonical content/interactions规范、复用CSS、来源快照与原5191示范同步，无新增类型或AWS规则变动。此项纳入本轮同步发布，真实状态与回归证据见[Validation](../guides/validation.md)。

## 玻璃文件夹商城

`UserShop.vue`以真实商品type分成订阅计划/流量包，使用`GlassFolder.vue`、`FolderArtCanvas.vue`和`utils/folder-art.ts`。对象保留用户附件轮廓/玻璃/翻盖/扇形与完整动效，增加114px展开留白、容器缩放和键盘/外部关闭边界。每个文件夹最多显示四页预览；文件夹本体不再渲染第二套小菜单，打开后由调用方直接展示全部原版商品卡片。

商城使用单一`activeFolder`互斥状态：点击另一个文件夹立即切换，不需要先收起再点一次；文件夹区域超过四件商品时，wheel阻止页面滚动并按方向切换预览窗口，预览选择只滚动定位下方对应的原版卡片。原卡片继续保留规格、时长价格、库存/积分、排队说明、二次确认和幂等购买，无新增业务API。

本轮进一步收窄命中面：对象占位的114px顶部展开留白、`.gf-root`/`.gf-interaction`透明包装以及文件夹组背景空白均不形成交互区域；悬浮、点击和wheel只从实际后板、前盖轮廓或展开纸页按钮承接。代码与skill合同均保留透明包装的`pointer-events:none`及实际子面恢复命中，避免点击组件背景误开合或滚轮误切页。

新分类“玻璃文件夹卡片”已获用户确认，模板/CSS责任边界与内部分开的数字/展示卡片注释同步。完整skill按需入口见[专项](</Users/hinaw/Library/Mobile Documents/com~apple~CloudDocs/obsidian vault/knowledge vault/ai/agent-skills/custom/kreeper-first-design-system/references/glass-folder.md>)：提供无API/store依赖的三文件复用单元、滚轮预览和互斥接入合同，默认完整动画，仅系统减少动态效果静态；明暗对象材质不改变模块深度或AWS/Apple业务颜色合同。来源是未附可核实URL/许可证的用户附件，保留SHA与分发授权边界。

源码、canonical规范/快照/pattern和原5191示范同步；本项尚未提交发布部署，运行及预览事实由[项目权威](../../agent.md)维护，浏览器/测试边界见[Validation](../guides/validation.md#玻璃文件夹商城未部署)。

## 复制栏与既有修正

相连复制栏在`global.css`统一input的`--n-height`及按钮height/min-height：桌面32px、触摸44px，外端18px、接缝直角、输入min-width0及按钮不收缩。primary/中性复制按钮悬浮、聚焦及按下同色，固定1px边线、根及内层无shadow/位移，220ms仅颜色过渡；键盘使用静态outline。`UserSub.vue`订阅/代理凭据和`AdminSettings.vue`命令复制分类统一为“复制栏”，不再误称普通按钮的扩圈/回弹合同。Dialog action区的default ghost取消动作按标准默认弧边覆盖，其他ghost专项及业务行为保持。skill forms/buttons/interactions/overlays、复用CSS、Controls/Dialog示范、来源快照/pattern同步；本次源码未提交部署，当前生产仍为v0.2.105，验证见[Validation](../guides/validation.md)。

PageScrollbar居中按实际内部15px轨道验收：外宽16px包含左侧1px分界线、8px滑块左右各3.5px；已在生产订阅页实测，无须改变几何。规范补充此测量口径，页面/手机滚动合同保持。

手机侧栏与竖屏共用菜单/品牌/footer样式：品牌固定64px、共享顶栏玻璃/底线和状态，菜单仍32px/13px正文/16px SVG/8px角及独立层级线；外包装直角。手机nav左右各16px、scrollbar-gutter:auto、隐藏平台滚动条，Drawer包装overflow:hidden，只有菜单原生纵向滚动。≤768px页面自绘轨道、分界线和16px预留空间一同隐藏，body右内距0；页面仍由原生body滚动，不建立桌面浏览器滚动条槽；Naive UI弹层滚动锁写入的`padding-right`与`scrollbar-gutter`补偿由移动端覆盖规则清除，避免轨道消失后仍留白。桌面轨道与折叠居中保持。全局Naive开关轨道40×23px、滑块17×17px、3px内距，滑块沿500ms回弹曲线移动，按下缩放0.96，启用/停用颜色、禁用、焦点和reduced-motion语义保持。源码分类、skill forms/motion/sidebar/topbar/scrollbars/responsive、复用代码和示范同步，无新类型，AWS规则不变；本轮仅本地未部署。此前源码62d2676随v0.2.105发布部署的生产合同不因本地改动改写；验证见[Validation](../guides/validation.md)。

当前结果区与按钮反馈：侧栏“无结果”以正常文档流替换菜单轨道，顶栏继续在原下拉结果面；Markdown正文链接显式hover/focus-visible深蓝。操作按钮隐藏水波层，普通/强调/默认弧边/高亮/警告/删除共用1px鼠标/键盘按压回弹，禁用静止，减弱动态效果位移0；高亮/警告按下与悬浮保持同色。对应模板/CSS和页面分类注释、skill规范/复用代码/快照/pattern与示范同步。无新分类或待确认偏离；已随v0.2.105部署，当前验收见[Validation](../guides/validation.md)。

本轮监控后台与首页复用AvailabilityHeatmap的16列×3行矩阵/立体视图、坐标、状态色、提示和键盘交互；查询保留管理/公开权限边界。后台本机指标和趋势只显示一次，OCI回环资产保留关联资产编辑入口；摘要与管理端热图去重，不停止采集、不删除资产。全部NAlert类型、订单条目和首页摘要SVG无额外边框；帮助状态切换完整测量/跟随/回位，选中卡维持中性选中底色。超链接常态Apple蓝，hover/focus-visible显示下划线offset3px。折叠分组为4px中性圆点；顶栏/侧栏无匹配显示“无结果”；移动侧栏Teleport包装均0圆角，菜单行仍8px。首页价格牌来自手填资产月费，默认零值不显示。分类注释、专项规范、复用代码、示范与快照同步，无新分类或待确认规范偏离。

## 默认加载与页面切屏

用户指定DotMatrix作为默认等待图标，新增“加载反馈”分类；`DotMatrixLoader.vue`与`styles/loading.css`提供小型3×3圆点。Naive BaseLoading共享替换保留原请求/禁用/占位语义，覆盖按钮16px、NSpin/表格20px、选择器/输入16px；标准刷新继续沿用其专项SVG。React文本仅用于DotMatrix视觉参考，不安装React/Motion/Tailwind；参数、源码和来源见 [skill 专项规范](</Users/hinaw/Library/Mobile Documents/com~apple~CloudDocs/obsidian vault/knowledge vault/ai/agent-skills/custom/kreeper-first-design-system/references/loading.md>)。用户取消的特效卡片规范与局部按钮变体已移除。

`utils/page-loading.ts`按导航token收集准备期请求，`api/index.ts`追踪完整fetch/JSON与原45秒截止时间，成功或失败均落定；Vue更新和绘制安静期包含连续请求，目标壳实际NSpin/按钮/aria-busy状态保留重试间隙的加载门控。router只准备scope，目标页隐藏挂载，`shift5.ts`在API和字体/媒体就绪后撤掉加载符号一帧，再离场/揭示。快速导航取消旧动画和门控，旧响应不能提前揭示新页；取消/错误释放等待。后续刷新不重启路由加载；减弱动态效果保留数据等待，跳过切屏。模板/CSS/状态边界已标记“加载反馈 / 组件绘制动画”，复用代码与示范同步，未发布部署。

默认点阵以五条对角线的CSS `@property <number>`连续相位计算透明度与半径（左上角改由径向背景直接绘制，其余8点为阴影），保持用户来源的对角延迟及两个半周期ease-in-out；不使用曾造成四档跳变的整组阴影关键帧。无需新DOM或JS逐帧循环，原尺寸/颜色/切屏顺序保持。验收必须逐帧确认中间值与实际像素变化，不能只检查animationName和截图首尾；当前Chrome实测及浏览器兼容边界见skill loading和[Validation](../guides/validation.md#dotmatrix加载与切屏顺序未部署)。

## 后台监控范围切换与公开入口

后台可用性热图现与首页共用矩阵/立体组件，单机CPU/内存/网络趋势继续使用ECharts。

热力图与单机时间范围按已有“路由切换组件”规范修复：独立悬浮/键盘跟随、离开回真实选中，筛选重建后重新测量，选项状态可访问；最终焦点描边覆盖通用清除规则。13px/20px/500和40px/32px桌面几何、44px触摸选项同步skill navigation与完整AdminMonitor快照/pattern；查询序号阻止迟到响应覆盖当前范围。未出现需新增的样式类型，AWS字体/图表外部规则没有改变。

“公开状态页”是路由`monitor`（`/admin#/`首页），不要求登录。后台开关更新资产public_visible；公开数据仍要求该记录启用采集/探针。旧回环资产仅在管理接口复用本机流，本轮不改变公开API或公开权限：当前OCI无独立probe，因此首页只展示面板本机。本轮给开关添加“切换开关”注释、可访问名称与明确首页/回环提示。当前验证边界见[Validation](../guides/validation.md)，发布运行证据见[Deployment](../guides/deployment.md)。

## 2026-10-13 OCI 回环采集与服务器标题

生产核对确认：`OCI Singapore` 是数据库中的 `id=1` 回环资产记录（`host=127.0.0.1`、探针关闭、已禁用），面板原生采集数据写入保留的 `server_id=0`。因此监控页对回环资产复用 `server_id=0` 的实时指标、流量与趋势，保留 OCI 名称和资产管理入口，不提供重复探针安装；热力图仍只展示一次面板采集行。

服务器卡片仅标题进入详情，并非整卡可点击，因此标题按“项目超链接”标记：router-link 提供真实 href，常态 Apple 蓝、无下划线，hover 沿用全局交互蓝，键盘可见焦点；卡片容器仍是“展示卡片”。纠正先前中性标题与“可跳转展示卡片”的误分类，不新增例外或类型。

回环资产复用采样来源，不覆盖资产自己的流量重置日、时间或计费方向；列表与流量分析使用同一资产周期，校准写入对应的本机采样源/周期/方向。监控摘要与热力图继续只计一次本机，公开页的独立开关与数据边界保持原实现。

## 2026-10-13 监控页、链接与刷新交互同步

源码提交 `4ec8bd18cfe66dd32a83ea73134797fa21fe9cbc` 将管理页中用户标注的既有组件重新对齐到设计系统：编辑动作使用默认弧边按钮，流量分析使用高亮弧边，删除/清除动作按删除按钮或默认弧边语义归类，文档操作、到期提示与认证入口补齐“项目超链接”或“提示信息”责任注释。监控范围切换继续使用“路由切换组件”，服务器名称与面板入口使用 Apple 蓝可访问导航文字；没有新增未确认样式类型。

监控卡片的本机与远程语义被显式区分：面板本机是 QingZhou 自动采集的本机记录，生产只读核对确认 OCI Singapore 是 host=127.0.0.1 的 ID 1 服务器记录、探针关闭，本机指标实际写入 ID 0。回环服务器无独立指标时明确指向“面板本机”；真正远程服务器在探针成功上报后才显示指标，缺失时呈现探针状态与下一步信息。节点链路预览使用中性深度背景，断链使用无边框危险浅色面，继续遵循模块深度背景合同。

首页、监控页、设置、更新、公告和用户控制台的刷新入口统一复用 `RefreshButton`。刷新 SVG 使用完整居中的 `refresh-cw` 路径；悬浮/键盘聚焦旋转180°，移开400ms linear回转，半圈400ms与加载整圈800ms同为450°/秒，真实请求 loading 才无限旋转，`prefers-reduced-motion` 时保持静止。该行为是现有刷新专项与普通按钮交互状态的实现细化，不新增样式分类。

本轮完整验证为前端 `148/148`、`vue-tsc`、Vite、`go test ./...`、skill `18/18` 资源契约/类型检查/构建，以及 `71` 源文件、`50` pattern、`220` 哈希审计；既有 ECharts 大 chunk warning 仍为非阻断警告。发布和生产核验记录见 [Validation](../guides/validation.md) 与 [Deployment](../guides/deployment.md)。

## 2026-10-13 按钮操作组与顶栏材质同步

源码提交 `1c665580765e18ceb1c5ac4eef22da5287387d3a` 将操作区几何收敛为桌面32px高、13px/20px、字重500、左右10px；触摸指针统一44px命中高度。普通、强调、默认弧边、高亮弧边、警告弧边、删除和撤销在同一操作组共用高度与文字基线，颜色和圆角继续按语义分类。删除按钮从原先过小的局部尺寸改为同组几何，账户“撤销会话”沿用删除外观但仍调用原会话撤销业务；上游“清除”、用户组、用户卡和套餐卡操作轨道均垂直居中。

套餐管理移除前后箭头，改为展示卡片拖动排序。卡片支持鼠标拖放、触摸指针和方向键，提交完整 ID 顺序，保存失败恢复原顺序；编辑、上架/下架、删除和拖动把手在同一操作轨道内对齐。新增回归覆盖几何 token、生产操作轨道、排序插入/失败回滚与无操作边界。

控制台桌面左侧品牌区与右侧 layout-header 现在直接复用玻璃文件夹前盖的顶栏材质：`linear-gradient(180deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,.5) 42%, rgba(252,252,252,.93) 100%)`、`blur(22px) saturate(1.5)`、底部分界线和滚动/菜单打开状态；公共顶栏与手机 Drawer 品牌区同样遵守这套材质，品牌区保持64px高度，折叠侧栏的SVG仍按72px内容盒中心线居中。完整 skill、青舟源码快照、页面 pattern、示范和CSS已同步；没有新增分类，也没有未确认的规范偏离。

## 权威与文档分工

青舟完整设计规范、来源、代码复用和字体资产统一由 [kreeper第一设计系统](</Users/hinaw/Library/Mobile Documents/com~apple~CloudDocs/obsidian vault/knowledge vault/ai/agent-skills/custom/kreeper-first-design-system/SKILL.md>) 管理。这是完整 skill 包，而非孤立 md；入口采用渐进式披露。本页仅维护青舟项目集成边界，不复制全套组件规范。

- 规范按需入口：skill 的 references/foundations、typography、sidebar、topbar、scrollbars、buttons、forms、surfaces、semantics、navigation、overlays、charts、content、motion、pages、authentication、interactions、responsive、maintenance、showcase，以及refresh/skyline专项。
- 覆盖索引：references/component-catalog.md 与 coverage.json；当前 71 个 Vue/TS/CSS 文件、50 个组件/页面均有映射，逐文件 template/style/媒体查询在 assets/patterns，完整业务依赖在 assets/source-reference。
- 可挂载复用：16 个无青舟 API/store 依赖的 Vue 组件（10 个青舟派生组件 + 6 个明确扩展），参数化 Shell/公共顶栏、hover menu、PageScrollbar、StatCard、InfoNotice、单圈/双圈、趋势图和 BrandMark。原业务页面快照不承诺无依赖独立挂载。
- AWS、Apple、Cloudflare 等来源仅在 skill 的 references/sources.md 维护；旧 Anthropic 和独立 Cloudscape skill 不再作为活动入口。

## 真实运行层

Vue 3 + Naive UI + Ionicons + ECharts。实际视觉入口仍是 `frontend/src/styles/global.css`、`frontend/src/App.vue` 的 themeOverrides 及 Vue scoped styles；没有新增运行依赖，也没有把 Cloudscape React 包导入 Vue。

外部参考组合：AWS 数据系列色/文字刻度与交互语义，Apple 状态/身份色及顶栏玻璃参考，Cloudflare 侧栏层级几何；PageScrollbar、Shift5、count-up 与资源圈属于青舟专项实现。项目局部数值和 CSS 最终层叠优先于通用参考。

## 必须保留的集成合同

- 背景层级按模块嵌套深度：页面第 0 层白底、直接模块一级 #fafafa、一级内部子模块二级白底；透明布局包装不另计模块。#f0f0f0 仅为交互态/轨道，专项玻璃、浮层、标签另有合同。更深层级未定义时须提醒确认；现有源码例外见 skill surfaces。
- 侧栏展开 16.5rem（默认 264px）、折叠 72px；折叠时单列网格覆盖全局三列规则、原生滚动槽stable both-edges、40px菜单面居中，SVG与品牌/底部按钮共用内容盒中心线。移动抽屉 300px；行 32px、8px 圆角。二级/三级树的 16px 独立留白轨道与 left:8px 层级线不能进入选中底色。桌面 `DashboardLayout.vue` 使用受控 `expanded-keys`；收起清空全部子树展开 key 和隐藏筛选，立即隐藏子容器，只保留各静态分组内最外层可操作入口的 SVG。静态分组标题仍无 SVG；重新展开不恢复旧子树，点击折叠分组 SVG 先展开侧栏再打开该组。移动 Drawer 独立使用完整默认展开导航，选择页面时关闭抽屉。内部菜单继续使用原生滚动与 stable gutter。
- 顶栏 64px、宽度属于 containing block，不用 100vw。公共顶栏、控制台 layout-header、桌面 sidebar-brand 与移动 Drawer sidebar-brand 共享玻璃文件夹前盖材质：渐层 `rgba(255,255,255,.16) → rgba(255,255,255,.5) → rgba(252,252,252,.93)`、`blur(22px) saturate(1.5)`、底部 `1px rgba(0,0,0,.12)` 分界线；滚动/菜单打开仍保持同一材质，不切回旧的 `.8/.92` 纯色 scrim。顶栏按钮保留独立透明命中面，菜单面板独立不透明。
- 顶栏互斥菜单：trigger12px角、面板16px、选项8px；8px透明命中桥；400ms渐显/200ms展开，离开立即关闭。常规Naive dropdown/select面板16px，普通Popover18px，不能互相误覆盖。
- 页面原生 body 滚动 + PageScrollbar 16px轨道/居中8px滑块；短页保留边界线/槽位，body右内距只占一次。表格、二级tabs等横向滚动必须留在局部容器。
- 普通分类/连续系列颜色使用AWS；状态牌、状态数值、热力图、资源环/进度使用Apple语义色。身份色稳定按用户名派生；管理员身份有警告实底例外。信息牌不代表查询成功，正常余额展示卡不得变绿。
- 四种字体类型：Fraunces 英文标题、Source Han Serif SC 中文标题、Inter 英文正文、Resource Han Rounded CN 中文正文。数字/代码/地址角色按 AWS 官方 Typography 场景选用明确命名的可用等宽字体；单位、文字状态不用整段 mono。青舟源码列 Amazon Ember Mono 但未提供 face，不能由 CSS 名称证明加载。示范选用 Courier Prime，属于示范实现选择，不是额外中英字体类型或全系统强制复用包。
- AWS 字号、行高、字重、字距、文字层级和数字规范直接读取 [Typography](https://cloudscape.design/foundation/visual-foundation/typography/) 及其关联来源；图表色读取 [Data visualization colors](https://cloudscape.design/foundation/visual-foundation/data-vis-colors/)。不在 skill 复制完整 AWS token 快照/排版 CSS 作为平行权威。青舟局部 28/36、heading500、650/750 等在专项规范明示本地覆盖，不冒称 AWS 默认。
- token18px圆角是通用值而不是全部控件最终值；侧栏8、路由16/12/4、topbar12/16/8、图标12、BrandMark8等专项例外保留。
- 输入框2px蓝色内焦点边界，无扩散晕；选择框中性，copy-field只读/中性/无过渡。完整认证规范包含登录/注册/找回、OAuth与配置开关、反馈槽固定28px、860px单栏断点以及loading/disabled/focus状态。
- 全部提示类型使用无边框浅色语义面，保留原背景、状态图标、文字和布局。`frontend/src/App.vue` 的 Alert 主题与 skill `assets/utils/theme.ts` 同步设置 `border` / `borderInfo` / `borderSuccess` / `borderWarning` / `borderError` 为 `none`，使用已有“提示信息 / 警告信息”分类；普通类型正确token是`border`而非`borderDefault`。完整规范在 skill overlays。Naive 2.44.1 的边框由 `.n-alert__border` 内层绘制，须核对它的计算边宽，不以根节点 border0 或不存在的类型class代替验收；显式bordered=false的实例可直接不输出内层。
- 鼠标focus不清除按钮原外ring：全局box-shadow重置已移除，普通/强调/默认弧边的Naive focus/pressed内边框为0；高亮/警告点击后保持聚焦提亮属于正常状态。状态验收覆盖点击释放、失焦、再次点击与键盘聚焦，防止仅验证hover。
- 默认弧边与普通按钮共用紧凑尺寸、字体、透明背景、中性描边及hover/focus/pressed；唯一差异为18px与8px圆角，撤销默认弧边独立蓝色hover描边。沿用“标准默认弧边按钮”分类；源码、复用CSS与示范同步，已随v0.2.98按钮版本发布。
- 当前按钮几何以源码提交 `1c665580765e18ceb1c5ac4eef22da5287387d3a` 为准：桌面32px高、13px/20px、字重500、左右10px，触摸设备44px；同组删除、撤销、编辑、充值、订单、上架/下架和拖动把手统一高度与垂直中心线。套餐卡使用拖动排序，提交完整ID顺序并在失败时回滚；这属于已有“展示卡片 / 普通按钮”组合，不新增分类。
- 明确删除按钮使用节点卡同款delete-button，并在删除入口与全局样式责任边界标注“删除按钮”；删除实体/记录及删除表单条目共用，撤销、吊销、禁用和重置不按颜色自动迁移。完整尺寸/状态/触摸命中规范由skill buttons维护，原删除处理器及确认流程保留。
- AdminNodes顶层/分组/空态“添加节点”和各页面“清除筛选”归入默认弧边；示范移到同款功能复用区，取消浅蓝次级/轻量独立样式与分类。用量报表清空筛选也归默认弧边；明确销毁记录的套餐移除/流量包清空、上游配置清除、Short ID和动态卖点删除均归delete-button（24个模板入口）。强调按钮与高亮弧边注释按真实class区分；其他历史secondary/primary-quiet仅保留调用方兼容；Naive2.44.1不输出tertiary/quaternary/text类，默认弧边使用实际.n-button__border子节点限定，避免误改裸编辑动作和数字步进控件。
- 高亮弧边hover/focus（含鼠标点击后）的背景和边框复用提亮accent，分类注释同步“变亮”，与警告同为提亮方向；完整合同在skill buttons/interactions。loading是现有按钮的请求状态；高亮弧边示范取消模拟加载，按下/释放后的聚焦反馈与警告一致。标准刷新使用Lucide refresh-cw完整SVG及viewBox中心旋转。按钮修正已同步青舟、skill代码/快照/pattern与规范，已随v0.2.98按钮版本发布。
- 悬浮、聚焦、按下、禁用分别约束；展示/可跳转卡维持所属深度底色和位置，只增加指定中性阴影。按钮变体、普通下拉/顶栏菜单各自遵循专项几何；文本选择为 rgba(0,122,255,.2) 且前景继承。
- 响应式是基本理念，所有组件同时覆盖宽/窄屏、触摸、键盘和reduced motion；页面不横向溢出，表格/代码/页签横滚局限于自身。验证尺寸和专项断点见 skill responsive，不用一套全局断点覆盖全部页面。
- 页面Shift5与组件绘制分离；资源单圈/双圈用1100ms共享数字/弧值，在所属页面揭示后启动；刷新从当前值过渡，迟到数据独立绘制，零值无假进度圆头。
- 保留路由、权限、菜单层级、数据口径、位置与业务处理器。逐页局部例外以完整pattern与源码为准，不把规范整理当成改视觉授权。

## 首页热图与标准刷新集成

`frontend/src/views/Monitor.vue` 使用 `frontend/src/components/RefreshButton.vue`、`frontend/src/components/AvailabilityHeatmap.vue` 和 `frontend/src/components/SkylineHeatmap.vue`。状态适配/投影位于 `frontend/src/utils/heatmap-skyline.ts`，绘制及生命周期位于 `frontend/src/utils/skyline-renderer.ts`；活动适配另有 `frontend/src/components/ContributionSkyline.vue`，首页仅采用可用性。

原API仍给48个时间桶状态矩阵，`state_count: 4`表示三种真实负载状态（0正常/1高负载/2严重负载）加3离线/无数据哨兵，不是四种健康状态。可用性只保留Apple绿/橙/红三种原生状态色与灰色缺失色；撤销此前5级渐变，不生成中间色或渐变标尺。立体侧面的84%/68%是同一色的光影，不表示新增状态。根据 2026-10-12 首页验收改为每台16列×3行（48桶不变），从上到下再从左到右按时间排列；不会把时间纵轴称作“桶序”。说明性文案已从工具栏移除，但 Canvas 的无障碍名称继续说明格数、坐标和键盘操作；余额卡片底部“余额卡片可拖动排序”文案删除，顶部拖动入口与拖拽排序保留。名称与最新时间用DOM换行，640px下移到矩阵上方。柱高只编码三个状态的严重级别，灰格为薄格且不作严重柱；平面/立体共用同场景，首揭示由ringsReady接入。AWS蓝色连续刻度仅属于活动量示范，未改。完整交互、尺寸和复用输入由skill refresh/skyline专页维护，本页不复制平行规范。

RefreshButton请求期间aria-busy/禁用，SVG悬浮与loading旋转分离；首页手动刷新同时更新指标与当前热图，30秒自动刷新保留。范围请求序号防迟到结果覆盖；失败保留现有数据并显示重试说明。`frontend/tests/heatmap-skyline.test.mjs` 覆盖数据折叠、缺值/旧接口、活动零/缺失、投影与减少动态效果/卸载。管理员监控页可用性热图复用首页，单机趋势保留ECharts。首页16×3、去除说明性文案与保留拖拽能力的改动已发布，部署证据见 [Deployment](../guides/deployment.md) 与 [Validation](../guides/validation.md)。

## 已核实的兼容边界

独立装配浏览器核对发现：已安装Naive2.44.1裸NTag不自动输出旧type class，warning/error浅底实际回落.15/.10，不能以CSS token或构建通过证明达到.14/.12。skill的StatusBadge显式补class并验证适配；这是新项目复用扩展，青舟运行标签代码未改，原页面不据此声称已修复。TrafficTrendChart仍是up/down与bytes专用；通用分类/单位用另附CategoryTrendChart，不声称青舟已采用。

## 分类与更新路径

源码中文标记（展示卡片/信息模块、状态牌/信息牌/身份牌、各按钮、填写框/选择器/复制栏、路由切换/二级切换、开关/提示/超链接/加载反馈等）描述当前语义，不是独立组件API。完整分类表及对应规范在 skill 的 references/semantics.md。新增/修改/复用UI必须在模板与CSS/渲染责任边界写同款分类注释，不能只写在md；顶栏、页面滚动条按已确认专项区域标记，不强塞信息模块。未知类型须主动提醒用户，拟定名称和几何/状态/响应式边界并等待确认；未确认不能正式登记或宣称验收完成。17个复用组件已有责任标记；桌面折叠变更在青舟模板、展开处理器与子容器CSS补齐“侧边栏 / 菜单归类级别”注释。源码快照与pattern同步实际源码；“删除按钮”由用户明确指定登记，默认弧边功能合并沿用已有分类；用户直接指定默认DotMatrix及更新加载/切屏先后，无待确认类型。

变更全局样式先核对 global.css 与 App.vue；变更专项组件读其专页和当前源码。发生漂移时同步规范、逐文件pattern、source-reference与coverage；不要只更新哈希。使用设计系统生成的项目，后续拟改实现违背已有规范时，必须主动提醒用户是否同步修改对应规范；已明确授权的规范更新无需重复询问，不能静默登记例外。

## 完整示范与验证边界

完整示范入口 `assets/examples/App.vue` / `Gallery.vue`，按26个规范主题映射15个展示区域，并提供51个组件/页面源合同目录。控制台全组件、公共顶栏、完整认证为三个实际场景；原业务页面不接真实API。默认DotMatrix在反馈区与页面准备→切屏→资源绘制的可操作示范中复用；进度单圈/双圈是既有类型，不重复创建类别。

skill的`scripts/preview-showcase.mjs`可生成独立预览；`scripts/audit.mjs`检查源覆盖/哈希/链接/alias，`scripts/verify-assets.mjs`在临时项目做typecheck、24项契约与build。实际验收和当前限制见[Validation](../guides/validation.md)与[同步证据](../_sync-state.md)。源码构建不替代真实浏览器或生产验收；按钮/手机合同已随v0.2.105部署，DotMatrix/加载门控与复制栏增量未部署，运行证据见项目权威文档。

青舟派生代码 CC BY-NC-SA 4.0，字体 OFL；规范来源不改变代码许可。字体文件、实际字重/变量轴和原字节快照属于可复用资产事实，按需见 skill assets/fonts/LICENSES.md；AWS 来源与字体类型定义仍由 typography 专页负责。

See Also: [Project Authority](../../agent.md), [Validation](../guides/validation.md), [System Overview](../architecture/overview.md).
