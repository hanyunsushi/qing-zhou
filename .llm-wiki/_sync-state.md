---
title: Current Wiki Sync State
updated: 2026-10-15
---

# Current synchronization evidence

本轮发布已将状态牌/标签合同与前序视觉改动保持同一同步边界：QingZhou、canonical `kreeper第一设计系统`、源码示范/独立示范均使用 `6px / 600 / 3px 10px / 13px` 标签几何、Apple 深色状态文字变体和 `.18/.20` 浅底透明度；默认弧边按下状态复用悬浮色，Dialog ghost 也不下沉。`180/180` 前端测试、typecheck/build、Go tests/vet、skill `28/28`、独立 build、`77/53/238` audit 和 `git diff --check` 均已通过。Canonical source-reference、patterns、Gallery、StatusBadge、status-colors、coverage hashes 与 QingZhou 目标视图一致；生产运行态已随 `v0.2.112-kreeper-20261015-secondary-sidebar-final` 核验完成。

本轮状态牌与标签视觉统一已同步 QingZhou 源码、canonical `kreeper-first-design-system` 规范、设计系统示范页：所有标签类型统一为 `6px` 圆角、`600` 字重、`3px 10px` 内边距、`13px` 字号，全局引入四组加深文字色 (`--success-text`/`--warn-text`/`--danger-text`/`--inactive-text`)，应用到状态牌、KPI 数字、订单金额、流量告警、监控状态等所有使用状态色显示文字的位置。改动范围：`frontend/src/styles/global.css` CSS 变量与状态牌样式，`AdminMonitor.vue`、`UserOrders.vue`、`UserPoints.vue`、`Monitor.vue` 的状态文字样式，设计系统示范页 `/private/tmp/kreeper-showcase`。门禁、验证与规范同步见 [Validation](guides/validation.md#状态牌与标签视觉统一未部署) 与 [设计系统](modules/kreeper-first-design-system.md#2026-10-15-状态牌与标签视觉统一本地未部署)。本地未提交、未发布、未部署。

本轮最终同步边界还包括文字链接：裸 `a`、`.project-link` 和 Markdown 链接在悬浮/键盘聚焦时保持 Apple 蓝，只添加下划线；QingZhou、canonical skill 与示范合同一致，随 `v0.2.110` 发布部署。


`v0.2.107-kreeper-20261014-switch-mobile-scroll` 已发布部署：只包含全局开关40×23/17×17参考比例与回弹、≤768px页面滚动槽补偿修正；Release 38593721201、CI 38593807022、ARM64运行哈希、SQLite Backup API完整性、服务/PID及公网资源证据见[Deployment](guides/deployment.md)与[Validation](guides/validation.md)。其他工作区脏改动仍排除。

本轮 BranchedMenu 视觉合同复核已完成：`AdminSettings.vue` 与 canonical `#navigation` 示范的二级侧边栏统一为首组默认展开、36px 行高、40px 子项缩进、CSS-only 主干/分支/活动线；增加独立裁剪层后，折叠分支不再残留占位，活动分支与叶子弧线仅在展开状态显示并保留淡入/绘制过渡。源快照、pattern、navigation/reference、coverage hash 和项目验证页已同步；已随 `v0.2.112-kreeper-20261015-secondary-sidebar-final` 发布并部署。

本轮修正示范玻璃文件夹的展开状态级联：原 `.gf-root:has(.gf-interaction:hover)` specificity 高于 `.gf-root[data-open]`，鼠标停留在已点击前盖时会覆盖完整展开位移，导致纸页没有正常弹出；现仅对 `:not([data-open])` 应用 hover/focus-within 参数，展开状态保持完整 hinge/lift/spread/fan/stack。5191 `#folders` 已实际点击核对 `aria-expanded`、`data-open` 与 computed 展开参数；源码、canonical skill 组件/快照/pattern/契约、项目权威与本页已同步。沿用“玻璃文件夹卡片”，未新增分类；本地未提交、未发布、未部署。证据见 [Validation](guides/validation.md#玻璃文件夹展开状态修正本地未部署)。

本轮顶栏组合下拉与完整互斥示范已同步 QingZhou 源码、canonical `kreeper-first-design-system` 的 topbar/overlays/showcase 规范、复用 CSS、源快照、pattern、契约及原 5191 示范：`#menus` 只保留点击下拉、弹出选择、Popover、Tooltip 四个互斥控件；点击下拉增加分割竖线与打开时旋转箭头，顶栏悬浮入口只增加箭头；Popover/Tooltip 去除下方小圆形/箭头；独立顶栏同款展示已移除。仅借鉴用户指定 Try Claude 的组合几何，不引入 Anthropic token/字体/组件或独立 skill。`180/180` 前端测试、typecheck、build，skill `28/28` 契约/独立 typecheck/build 与 `77/53/238` audit 通过；5191 `#menus` 本地浏览器已确认四控件与点击下拉展开。无新增分类、AWS规则或生产变更；未提交、未发布、未部署。证据见 [Validation](guides/validation.md#顶栏组合下拉与完整互斥示范未部署)、[设计系统](modules/kreeper-first-design-system.md#2026-10-15-顶栏组合下拉与完整互斥示范本地未部署) 与 [项目权威](../agent.md)。

本轮设置页独立导航已归类为“二级侧边栏”：`AdminSettings.vue` 使用一级分区展开/折叠、二级路由项、CSS-only 主干/分支/活动标记与 ResizeObserver 定位，保留搜索、查询参数和键盘无障碍；模板和 scoped CSS 均有分类注释，未使用 SVG。canonical skill 的 navigation/sidebar/semantics、AdminSettings pattern/source-reference、coverage 与契约已同步；项目权威和模块页已记录本地未部署边界。当前工作区的前端回归、类型检查、构建、skill audit/verify-assets及浏览器验收结果仍按各专项验证记录，未将本地改动视为生产或示范部署。

本轮用户确认的回弹开关已同步到青舟全局`n-switch`、canonical `kreeper-first-design-system`表单规范/可复用CSS/源快照/契约，以及示范Controls：轨道40×23px、滑块17×17px、3px内距，500ms回弹曲线，按下缩放0.96，保留Naive状态色/禁用/焦点/reduced-motion。≤768px页面继续原生body滚动并隐藏PageScrollbar，同时html/body不绘制或预留桌面浏览器滚动槽；移动端`!important`覆盖Naive UI弹层滚动锁可能写入的`padding-right`/`scrollbar-gutter`补偿，修复右侧留白占位；侧栏原生滚动合同不变。180项前端测试、typecheck、build，canonical 27项契约、typecheck、build及77源/53 pattern/238哈希审计均通过；390×844/360×800本地预览已重新测量，未部署、未提交、未执行业务写操作；完整证据见[Validation](guides/validation.md#开关与手机滚动槽本地修正未部署)。

本轮本地未部署修正已同步源码、`kreeper第一设计系统` skill、项目权威与本页：玻璃文件夹透明留白/包装层/组背景不再形成命中面，实际后板、前盖和纸页按钮保留点击、悬浮与预览滚轮；公共/控制台顶栏及两处品牌区直接复用玻璃文件夹前盖的渐层与 `blur(22px) saturate(1.5)`。5191 `#folders` 刷新后真实浏览器已确认透明留白不改变开合状态、实际前盖可开合，且顶栏与`.gf-tint`渐层、`.gf-front`模糊材质一致。无新增分类、AWS规则或生产变更；未提交、未发布、未部署。证据见[Validation](guides/validation.md#玻璃文件夹命中边界与顶栏材质未部署)与[项目权威](../agent.md)。


DotMatrix source3a91d7748816957587d682baff9697b9cc1968db is now deployed
asv0.2.106-kreeper-20261014-dotmatrix after successful Release/CI.171 isolated
frontend tests/typecheck/build and Go vet/race/full tests passed. Native panel-only
replacement, SQLite rollback integrity, configuration/PID preservation and
local/public runtime hashes/health passed; six core public assets match the tag.
Desktop/390/360px production read-only checks confirm continuous20px dots,
loading before Shift5 and reduced-motion waiting. Uncommitted copy/Dialog,
hyperlinks and shop folders are excluded; their earlier local records below
do not describe deployed features. Evidence:[deployment](guides/deployment.md),
[validation](guides/validation.md),[authority](../agent.md).

Bare text navigation links now share the project-link hover/focus underline
contract, including explicit semantic markers on the showcase hero links.
Blue and neutral joined copy controls retain their surfaces with type/enabled
selector precedence over ordinary button hover/press, 220ms color-only root and
inner-border transitions, no shadow/transform and static keyboard focus. Source,
canonical references/CSS/examples/snapshots/patterns and original5191 showcase
are synchronized. 179 frontend tests and26 skill contracts/typecheck/build pass;
desktop actual hover/held press/clipboard and390/360px alignment evidence is in
[validation](guides/validation.md#文字链接与两种复制按钮未部署).
No new category, AWS rule change, production write or deployment; other work retained.

Copy seam follow-up corrects the previous focus-ring root-cause claim. The input
state-border atz-index1 painted over the1px overlap until the hover button border
covered it. Groupisolation:isolate and constant buttonz-index1 now keep the seam
owned by the button at rest/hover/press. Real screenshot decoded seam pixels,
both running tabs, heldSpace and390/360px geometry pass; internal keyboard focus
remains visible. 179 frontend tests and26 isolated skill contracts/typecheck/build
pass. Source classification, forms, reusable CSS, exact snapshots and running5191
are synchronized; no new category/AWS change or deployment.

Markdown links now use the shared project-link state contract: no underline at
rest, deep blue and underline on hover/focus-visible, restored on leave/blur.
Semantic CSS comments, canonical content/interaction references, reusable CSS,
source snapshot and running5191 showcase are synchronized. 179 frontend tests
and26 isolated skill contracts/typecheck/build pass; real desktop hover-only,
leave and keyboard-only evidence is in[validation](guides/validation.md#markdown链接下划线未部署).
No new category, AWS rule change or production deployment; other local work retained.


Current local glass-folder interaction correction remains uncommitted and undeployed:
`UserShop.vue` now uses one `activeFolder` so plan/traffic switches are immediate;
`GlassFolder.vue` no longer renders a second expanded list; the original full
`.shop-card` cards render below the active folder and preview selection scrolls to
those cards. Wheel over a folder with more than four items prevents page scrolling
and advances a four-item preview window. 179 frontend tests, typecheck and Vite
build pass; 5198 GET-only QA confirms 5 plan cards, 2 traffic cards and direct
switching. Canonical skill and 5191 showcase are synchronized. No new category,
AWS rule change, production write or deployment.

User-confirmed glass folders now group real subscription/traffic products in the
local shop; original glass/hinge/fan/art motion is retained, with a full accessible
list beyond the four-sheet preview and original details/confirmation/purchase
contracts. Canonical progressive specification, reusable Vue/art code, semantic
comments, source/pattern coverage and original5191 showcase are synchronized.
179 frontend tests/typecheck/build and26 isolated skill contracts/typecheck/build,
77-source/53-pattern/238-hash audit passed. Desktop and390/360 browser, keyboard,
empty/stock/affordability, cancel-only confirmation and pixel evidence are in
[validation](guides/validation.md#玻璃文件夹商城未部署). No production write,
deployment or dependency change; previous copy/Dialog and DotMatrix work retained.
New category was explicitly confirmed; source license/author URL remain absent.

Working-tree copy/Dialog changes are not deployed: joined readonly inputs and
copy controls share32px/44px geometry; hover/focus/pressed colors agree, with
fixed borders, no shadow/movement and a static keyboard outline. Default ghost
cancel actions are scoped to the Dialog action area and use neutral arc states.
Semantic comments, canonical progressive references/reusable CSS/examples and
source snapshots/patterns are synced. 165 frontend tests/typecheck/build and23
skill contracts/typecheck/build passed; actual desktop/390/360px browser evidence
and production scrollbar3.5px/3.5px centering are in[validation](guides/validation.md).
No new type, AWS rule change or production business write; runtime remainsv0.2.105.
The copy/Dialog validation above remains scoped to its original build. Current
loading-animation work is independently synchronized and validated below; the
copy/Dialog changes were preserved, not reverted or reimplemented.

Current DotMatrix work replaces the canceled special-card registration. Default
waiting symbols are compact3x3 dots:20px content/page and16px inline controls.
Initial API requests, JSON parsing, Vue updates and media readiness settle before
the page indicator exits; only then does Shift5 start. Token isolation cancels old
navigation; reduced motion waits for data without route movement. Canonical
references/reusable components/CSS/state utils/patterns and source snapshots are
synced. Source/API dependencies and production remain otherwise unchanged.
173 frontend tests, typecheck/Vite and24 skill contracts/typecheck/build passed;
desktop/390/360px slow-response, error, rapid navigation and showcase checks are in
[validation](guides/validation.md#dotmatrix加载与切屏顺序未部署).
No production deployment or new React/Motion/Tailwind dependency was made.
The original running showcase on5191 is now synchronized too: its missing
loading stylesheet caused the old28px circle despite the updated canonical
skill/5197 preview. Actual desktop/390/360px and reduced-motion replay checks
pass at the original URL; other copy/Dialog CSS was preserved.
Smoothness follow-up: the old shadow keyframes produced only4 distinct states
despite16.7ms frame intervals. Five registered numeric diagonal phases now
interpolate continuously before calculating opacity/radius; source, skill and
both running showcases are synced. Real desktop/390/360px intermediate-value
and decoded-pixel checks pass, with loading/transition order unchanged. Current
174 frontend tests/typecheck/build,24 skill contracts/typecheck/build and
74-source/51-pattern/228-hash audit pass; production remains unchanged.

Mobile sidebar/page scrolling now follows the user-confirmed responsive contract:
shared portrait menu geometry and 64px glass brand/footer, hidden native menu
scrollbars with no gutter, and native page indicators with no custom rail or
16px reservation at <=768px. Desktop rail/collapsed alignment is preserved.
162 frontend tests/typecheck/build and 21 skill contracts/typecheck/build passed;
390/360px QingZhou fixture, 820px portrait/768px breakpoint and 390px showcase
browser checks are recorded in [validation](guides/validation.md). Semantic
comments and canonical references/reusable assets/source snapshots are synced.
Source62d26764480bf12cac4e23d6a71a351bbf852e1a is released/deployed as
v0.2.105 after successful Release build/CI, local Go tests and skill checks.
No new category or AWS rule change. Production390/360px menus and820px portrait
verify the mobile contract and collapsed alignment;8 public JS/CSS assets match
the source build. Exact runtime hash, backup, preservation and health evidence
belong to[authority](../agent.md) and[deployment](guides/deployment.md).

Current committed source and canonical skill align sidebar empty feedback with
the existing menu result track, add Markdown-specific hover/focus color, and
define wave-free 1px mouse/keyboard press recoil for operation buttons. Highlight
and warning pressed colors equal hover; disabled and reduced-motion contracts are
preserved. Existing semantic comments, source snapshots, patterns and progressive
references are synchronized. No new category or unapproved specification change.
161 frontend tests/typecheck/build and 20 skill contracts/typecheck/build passed.
Real 1167px browser confirms inline sidebar empty state, Markdown hover/focus and
actual Naive pointer/Enter press states. Mobile and final audit evidence are in
[validation](guides/validation.md). These contracts are included in v0.2.105.
Continuous-resize chart clipping was observed; initial360px loading passes,
and the unmodified resize risk is recorded in validation.

本轮监控后台与首页复用AvailabilityHeatmap的16列×3行矩阵/立体视图、坐标、状态色、提示和键盘交互；查询保留管理/公开权限边界。后台本机指标和趋势只显示一次，OCI回环资产保留关联资产编辑入口；摘要与管理端热图去重，不停止采集、不删除资产。全部NAlert类型、订单条目和首页摘要SVG无额外边框；帮助状态切换完整测量/跟随/回位，选中卡维持中性选中底色。超链接常态Apple蓝，hover/focus-visible显示下划线offset3px。折叠分组为4px中性圆点；顶栏/侧栏无匹配显示“无结果”；移动侧栏Teleport包装均0圆角，菜单行仍8px。首页价格牌来自手填资产月费，默认零值不显示。分类注释、专项规范、复用代码、示范与快照同步，无新分类或待确认规范偏离。

- Owners: project authority for release/runtime evidence; design integration and validation for implementation/browser checks. Canonical skill contains synchronized exact source snapshots, extracted template/style patterns, reusable assets and progressive references.
- Passed: 158 frontend tests, vue-tsc/Vite, full Go tests, 18 skill checks/build, 71 sources / 50 patterns / 220 hashes. Local read-only browser: 1280,390,360px; no page overflow; square mobile drawer; one physical-machine card and shared heatmap; search-empty feedback and measured help status switch.
- Previous baseline1459bc5740a4c078390555c29c85f5097f4996b3/v0.2.104 was verified against its Release asset and running executable; it is now superseded by v0.2.105 above. Protected configuration and sing-box/Tunnel processes preserved; SQLite Backup API integrity passed. No asset deletion, database overwrite, probe shutdown or public visibility policy change. Exact release/runtime evidence belongs to[authority](../agent.md) and[deployment](guides/deployment.md).
- Production read-only browser: 1280px one metric card and real 3D heatmap; zero alert/order/icon borders, no default zero monthly fee, keyboard-underlined links, visible no-result search feedback and centered collapsed dots. Help selection and measured switch checked; mobile drawer 390px is square, help/monitor 360px have no page overflow. Showcase all five alert internal borders are zero; actual 390/360px have no page overflow and a square drawer. Viewport restored; independent mouse hover, coarse pointer and OS reduced-motion remain unclaimed.
