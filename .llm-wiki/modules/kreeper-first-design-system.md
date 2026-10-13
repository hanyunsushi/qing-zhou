---
title: kreeper第一设计系统 — QingZhou 集成
updated: 2026-10-14
---

# kreeper第一设计系统 — QingZhou 集成

## 当前修正

本轮监控后台与首页复用AvailabilityHeatmap的16列×3行矩阵/立体视图、坐标、状态色、提示和键盘交互；查询保留管理/公开权限边界。后台本机指标和趋势只显示一次，OCI回环资产保留关联资产编辑入口；摘要与管理端热图去重，不停止采集、不删除资产。全部NAlert类型、订单条目和首页摘要SVG无额外边框；帮助状态切换完整测量/跟随/回位，选中卡维持中性选中底色。超链接常态Apple蓝，hover/focus-visible显示下划线offset3px。折叠分组为4px中性圆点；顶栏/侧栏无匹配显示“无结果”；移动侧栏Teleport包装均0圆角，菜单行仍8px。首页价格牌来自手填资产月费，默认零值不显示。分类注释、专项规范、复用代码、示范与快照同步，无新分类或待确认规范偏离。

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

控制台桌面左侧品牌区与右侧 layout-header 现在共享顶栏背景透明度、saturate(180%) blur(20px)、底部分界线和滚动/菜单打开状态；品牌区保持64px高度，折叠侧栏的SVG仍按72px内容盒中心线居中。完整 skill、青舟源码快照、页面 pattern、示范 Controls 和示范 CSS 已同步；没有新增分类，也没有未确认的规范偏离。

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

源码中文标记（展示卡片/信息模块、状态牌/信息牌/身份牌、各按钮、填写框/选择器/复制栏、路由切换/二级切换、开关/提示/超链接等）描述当前语义，不是独立组件API。完整分类表及对应规范在 skill 的 references/semantics.md。新增/修改/复用UI必须在模板与CSS/渲染责任边界写同款分类注释，不能只写在md；顶栏、页面滚动条按已确认专项区域标记，不强塞信息模块。未知类型须主动提醒用户，拟定名称和几何/状态/响应式边界并等待确认；未确认不能正式登记或宣称验收完成。16个复用组件已有责任标记；桌面折叠变更在青舟模板、展开处理器与子容器CSS补齐“侧边栏 / 菜单归类级别”注释。源码快照与pattern同步实际源码；“删除按钮”由用户明确指定登记，默认弧边功能合并沿用已有分类，无待确认类型。

变更全局样式先核对 global.css 与 App.vue；变更专项组件读其专页和当前源码。发生漂移时同步规范、逐文件pattern、source-reference与coverage；不要只更新哈希。使用设计系统生成的项目，后续拟改实现违背已有规范时，必须主动提醒用户是否同步修改对应规范；已明确授权的规范更新无需重复询问，不能静默登记例外。

## 完整示范与验证边界

完整示范入口 `assets/examples/App.vue` / `Gallery.vue`，按 25 个规范主题映射 15 个展示区域，并提供 50 个组件/页面源合同目录。控制台全组件、公共顶栏、完整认证为三个实际场景；原业务页面不接真实 API。进度单圈/双圈是既有类型，补齐状态/注释与1100ms共享绘制合同，没有重复创建类别。

skill 的 `scripts/preview-showcase.mjs` 可生成独立预览；`scripts/audit.mjs` 检查源覆盖/哈希/链接/alias，`scripts/verify-assets.mjs` 在临时项目做 typecheck、18项契约与build。实际验收和当前限制见 [Validation](../guides/validation.md) 与 [同步证据](../_sync-state.md)。源码构建不替代真实浏览器或生产验收；按钮合同随v0.2.98发布；运行验收见项目权威文档。

青舟派生代码 CC BY-NC-SA 4.0，字体 OFL；规范来源不改变代码许可。字体文件、实际字重/变量轴和原字节快照属于可复用资产事实，按需见 skill assets/fonts/LICENSES.md；AWS 来源与字体类型定义仍由 typography 专页负责。

See Also: [Project Authority](../../agent.md), [Validation](../guides/validation.md), [System Overview](../architecture/overview.md).
