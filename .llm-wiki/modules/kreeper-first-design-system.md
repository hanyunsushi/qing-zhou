---
title: kreeper第一设计系统 — QingZhou 集成
updated: 2026-10-12
---

# kreeper第一设计系统 — QingZhou 集成

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
- 顶栏 64px、宽度属于 containing block，不用 100vw。桌面 sidebar-brand 的高度/底边线与主顶栏贯通；移动 Drawer 品牌无桌面底线。共享玻璃 rgba(250,250,252,.8) + saturate(180%) blur(20px)，scrolled/菜单打开按实际特异性处理。
- 顶栏互斥菜单：trigger12px角、面板16px、选项8px；8px透明命中桥；400ms渐显/200ms展开，离开立即关闭。常规Naive dropdown/select面板16px，普通Popover18px，不能互相误覆盖。
- 页面原生 body 滚动 + PageScrollbar 16px轨道/居中8px滑块；短页保留边界线/槽位，body右内距只占一次。表格、二级tabs等横向滚动必须留在局部容器。
- 普通分类/连续系列颜色使用AWS；状态牌、状态数值、热力图、资源环/进度使用Apple语义色。身份色稳定按用户名派生；管理员身份有警告实底例外。信息牌不代表查询成功，正常余额展示卡不得变绿。
- 四种字体类型：Fraunces 英文标题、Source Han Serif SC 中文标题、Inter 英文正文、Resource Han Rounded CN 中文正文。数字/代码/地址角色按 AWS 官方 Typography 场景选用明确命名的可用等宽字体；单位、文字状态不用整段 mono。青舟源码列 Amazon Ember Mono 但未提供 face，不能由 CSS 名称证明加载。示范选用 Courier Prime，属于示范实现选择，不是额外中英字体类型或全系统强制复用包。
- AWS 字号、行高、字重、字距、文字层级和数字规范直接读取 [Typography](https://cloudscape.design/foundation/visual-foundation/typography/) 及其关联来源；图表色读取 [Data visualization colors](https://cloudscape.design/foundation/visual-foundation/data-vis-colors/)。不在 skill 复制完整 AWS token 快照/排版 CSS 作为平行权威。青舟局部 28/36、heading500、650/750 等在专项规范明示本地覆盖，不冒称 AWS 默认。
- token18px圆角是通用值而不是全部控件最终值；侧栏8、路由16/12/4、topbar12/16/8、图标12、BrandMark8等专项例外保留。
- 输入框2px蓝色内焦点边界，无扩散晕；选择框中性，copy-field只读/中性/无过渡。完整认证规范包含登录/注册/找回、OAuth与配置开关、反馈槽固定28px、860px单栏断点以及loading/disabled/focus状态。
- 警告/错误提示使用无边框浅色语义面，保留原背景、状态图标、文字和布局。`frontend/src/App.vue` 的 Alert 主题与 skill `assets/utils/theme.ts` 同步设置 `borderWarning` / `borderError` 为 `none`，使用已有“提示信息 / 警告信息”分类；完整规范在 skill overlays。Naive 2.44.1 的边框由 `.n-alert__border` 内层绘制，须核对它的计算边宽，不以根节点 border0 或不存在的类型class代替验收。
- 悬浮、聚焦、按下、禁用分别约束；展示/可跳转卡维持所属深度底色和位置，只增加指定中性阴影。按钮变体、普通下拉/顶栏菜单各自遵循专项几何；文本选择为 rgba(0,122,255,.2) 且前景继承。
- 响应式是基本理念，所有组件同时覆盖宽/窄屏、触摸、键盘和reduced motion；页面不横向溢出，表格/代码/页签横滚局限于自身。验证尺寸和专项断点见 skill responsive，不用一套全局断点覆盖全部页面。
- 页面Shift5与组件绘制分离；资源单圈/双圈用1100ms共享数字/弧值，在所属页面揭示后启动；刷新从当前值过渡，迟到数据独立绘制，零值无假进度圆头。
- 保留路由、权限、菜单层级、数据口径、位置与业务处理器。逐页局部例外以完整pattern与源码为准，不把规范整理当成改视觉授权。

## 首页热图与标准刷新集成

`frontend/src/views/Monitor.vue` 使用 `frontend/src/components/RefreshButton.vue`、`frontend/src/components/AvailabilityHeatmap.vue` 和 `frontend/src/components/SkylineHeatmap.vue`。状态适配/投影位于 `frontend/src/utils/heatmap-skyline.ts`，绘制及生命周期位于 `frontend/src/utils/skyline-renderer.ts`；活动适配另有 `frontend/src/components/ContributionSkyline.vue`，首页仅采用可用性。

原API仍给48个时间桶状态矩阵，`state_count: 4`表示三种真实负载状态（0正常/1高负载/2严重负载）加3离线/无数据哨兵，不是四种健康状态。可用性只保留Apple绿/橙/红三种原生状态色与灰色缺失色；撤销此前5级渐变，不生成中间色或渐变标尺。立体侧面的84%/68%是同一色的光影，不表示新增状态。每台独立8列×6行、时间顺序不变。名称与最新时间用DOM换行，640px下移到矩阵上方。柱高只编码三个状态的严重级别，灰格为薄格且不作严重柱；平面/立体共用同场景，首揭示由ringsReady接入。AWS蓝色连续刻度仅属于活动量示范，未改。完整交互、尺寸和复用输入由skill refresh/skyline专页维护，本页不复制平行规范。

RefreshButton请求期间aria-busy/禁用，SVG悬浮与loading旋转分离；首页手动刷新同时更新指标与当前热图，30秒自动刷新保留。范围请求序号防迟到结果覆盖；失败保留现有数据并显示重试说明。`frontend/tests/heatmap-skyline.test.mjs` 覆盖数据折叠、缺值/旧接口、活动零/缺失、投影与减少动态效果/卸载。管理员监控页保留ECharts，不据首页变化声称所有监控页面已迁移。当前改动是本地未部署。

## 已核实的兼容边界

独立装配浏览器核对发现：已安装Naive2.44.1裸NTag不自动输出旧type class，warning/error浅底实际回落.15/.10，不能以CSS token或构建通过证明达到.14/.12。skill的StatusBadge显式补class并验证适配；这是新项目复用扩展，青舟运行标签代码未改，原页面不据此声称已修复。TrafficTrendChart仍是up/down与bytes专用；通用分类/单位用另附CategoryTrendChart，不声称青舟已采用。

## 分类与更新路径

源码中文标记（展示卡片/信息模块、状态牌/信息牌/身份牌、各按钮、填写框/选择器/复制栏、路由切换/二级切换、开关/提示/超链接等）描述当前语义，不是独立组件API。完整分类表及对应规范在 skill 的 references/semantics.md。新增/修改/复用UI必须在模板与CSS/渲染责任边界写同款分类注释，不能只写在md；顶栏、页面滚动条按已确认专项区域标记，不强塞信息模块。未知类型须主动提醒用户，拟定名称和几何/状态/响应式边界并等待确认；未确认不能正式登记或宣称验收完成。16个复用组件已有责任标记；桌面折叠变更在青舟模板、展开处理器与子容器CSS补齐“侧边栏 / 菜单归类级别”注释。源码快照与pattern同步实际源码，未出现需新增的样式类型。

变更全局样式先核对 global.css 与 App.vue；变更专项组件读其专页和当前源码。发生漂移时同步规范、逐文件pattern、source-reference与coverage；不要只更新哈希。使用设计系统生成的项目，后续拟改实现违背已有规范时，必须主动提醒用户是否同步修改对应规范；已明确授权的规范更新无需重复询问，不能静默登记例外。

## 完整示范与验证边界

完整示范入口 `assets/examples/App.vue` / `Gallery.vue`，按 25 个规范主题映射 15 个展示区域，并提供 50 个组件/页面源合同目录。控制台全组件、公共顶栏、完整认证为三个实际场景；原业务页面不接真实 API。进度单圈/双圈是既有类型，补齐状态/注释与1100ms共享绘制合同，没有重复创建类别。

skill 的 `scripts/preview-showcase.mjs` 可生成独立预览；`scripts/audit.mjs` 检查源覆盖/哈希/链接/alias，`scripts/verify-assets.mjs` 在临时项目做 typecheck、18项契约与build。实际验收和当前限制见 [Validation](../guides/validation.md) 与 [同步证据](../_sync-state.md)。源码构建不替代真实浏览器或生产验收；本轮没有部署。

青舟派生代码 CC BY-NC-SA 4.0，字体 OFL；规范来源不改变代码许可。字体文件、实际字重/变量轴和原字节快照属于可复用资产事实，按需见 skill assets/fonts/LICENSES.md；AWS 来源与字体类型定义仍由 typography 专页负责。

See Also: [Project Authority](../../agent.md), [Validation](../guides/validation.md), [System Overview](../architecture/overview.md).
