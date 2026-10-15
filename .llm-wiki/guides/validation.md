---
title: Validation Guide
updated: 2026-10-15
---

## 二级侧边栏视觉修复（本地未部署）

根据参考组件 BranchedMenu 的精确几何修复 `AdminSettings.vue` 二级侧边栏，确保所有视觉尺寸与参考规范完全对齐：

**修复项：**
- 主干线宽度 `2px` → `1.5px`
- 活动标记宽度补充为 `1.5px`，高度保持 `16px`
- 分组标签字体 `15px` → `calc(14px + 1px) / 1.2`
- 子项字体保持 `14px / 1.2`
- 展开区主干宽度统一 `1.5px`，圆角 `1px`，截止位置 `calc(36px - 10px)`
- 分支圆角统一 `10px`，位置 `calc(50% - 5px)` 垂直居中
- 分支尺寸 `18px × 10px`，线宽 `1.5px`
- 活动分支延伸线宽度 `1.5px`

**验证覆盖：**
- 新增 `frontend/tests/secondary-sidebar-visual.test.mjs`，13 项静态 CSS 几何断言
- QingZhou `npm test` 通过 `193/193`（新增 13 项测试）
- 保持配色不变，使用 CSS（非 SVG）实现
- 与参考组件在行高、字体、线宽、圆角、位置等所有视觉尺寸完全对齐

本项已同步：`AdminSettings.vue` 源码、静态测试文件；未提交、未发布、未部署。真实浏览器效果需重启本地开发服务器验证。


## 状态牌与标签视觉统一（发布候选）

统一所有标签几何样式为 `6px` 圆角、`600` 字重、`3px 10px` 内边距、`13px` 字号，全局引入四组加深文字色 (`--success-text`/`--warn-text`/`--danger-text`/`--inactive-text`)，应用到状态牌、KPI、订单金额、流量告警等所有使用状态色显示文字的位置。

- 改动范围：`frontend/src/styles/global.css` CSS 变量与状态牌样式，`AdminMonitor.vue`、`UserOrders.vue`、`UserPoints.vue`、`Monitor.vue` 的状态文字样式；设计系统示范页 `/private/tmp/kreeper-showcase` 已同步。
- QingZhou `npm test` 通过 `180/180`，`npm run typecheck`、`npm run build`、`go test ./...`、`go vet ./...`、`git diff --check` 通过。
- canonical `kreeper-first-design-system` 的 `verify-assets.mjs` 通过 `28/28`；独立 `vue-tsc`/Vite build 通过；`audit.mjs` 通过 `77` source、`53` pattern、`238` package hashes。首次验证发现并已修复默认弧边按下变量和 canonical Courier Prime 字体 URL 门禁，最终全绿。
- 设计系统示范页可在 `http://localhost:5191` 查看 `#badges` 章节的统一效果；QingZhou 本地开发服务器需重启验证真实页面效果。
- 本项已同步源码、规范、示范、source-reference、patterns、coverage hashes 与回归断言；当前仍未完成本轮 Release/生产部署，不能用本节替代运行态证据。Vite 保留既有 ECharts 大 chunk 非阻塞 warning。

## BranchedMenu 二级侧边栏全量同步（发布候选）

- 本轮同步还包含文字链接合同：裸 `a`、`.project-link` 与 Markdown 链接常态保持 Apple 蓝无下划线，悬浮/键盘聚焦仍保持同色并显示下划线；对应测试已更新，未新增分类。

- QingZhou `npm test` 通过 `180/180`，`npm run typecheck` 与 `npm run build` 通过；Go `go test ./...`、`go vet ./...` 和 `git diff --check` 通过。保留既有 ECharts 大 chunk 非阻断 warning。
- canonical `kreeper-first-design-system` 的 `node scripts/contracts.test.mjs` 通过 `28/28`，独立 `vue-tsc`/Vite build 通过；`audit.mjs` 通过 `77` 源、`53` pattern、`238` package hashes；`verify-assets.mjs` 通过，无源码漂移、未覆盖源码、项目 alias 或坏链接。
- 本轮把用户 BranchedMenu 的 CSS-only 几何同步到实际设置页、完整示范和源合同：首组默认展开，分支折叠归零，活动分支/叶子弧线仅在所属分区展开并保留淡入/绘制过渡；无 SVG。示范进程 `5191/5192/5197` 已刷新。生产在新 Release 构建和部署完成前仍为 `v0.2.108-kreeper-20261015-visual-sync`。

## v0.2.108 全量同步发布验收

发布提交 `a3fb1fc7d6bf4226cb0bf93cd353325a153656a9`、Release `v0.2.108-kreeper-20261015-visual-sync`、构建 `38690142519` 和 CI `38690146328` 均对应同一源码。前端 180/180、`vue-tsc`、Vite、Go tests/vet、`git diff --check`、canonical skill 28/28、独立 typecheck/build、asset verify 及 `audit.mjs` 的 77 source/53 pattern/238 hash 全部通过。构建保留既有 ECharts 异步 chunk 大小警告，不影响发布。

运行态验收：Release ARM64 资产、宿主和运行面板哈希均为 `e92956cebea9657cfc83548cdc79a103fe3e06a914a6a61ba948c48e2663da74`；在线 SQLite Backup API 快照完整性为 `ok`；本机/公网 health 返回新版本；三项服务 active、NRestarts=0、sing-box/Tunnel PID 不变、监听端口保持、panel error journal 为空；公网首页的 `index-BlaWHU_D.js` 与 `index-Du0HlI9_.css` 分别与本地构建哈希 `7561bedaa12b7ea65f0d2f73e971521b66a976147d0b44f53457f2272325d441` / `860842b349c1e124f13a2acd9ffca5cca76668462f17be4a358d1fc5f6203982` 一致。QingZhou 源码、canonical skill 和 `5191/5192/5197` 示范均已复核同步；真实 iOS/Android 指示器、触摸硬件和认证业务写操作未冒充本轮验证。




## v0.2.107生产发布验收

发布范围仅为全局开关 `40×23px` 轨道、`17×17px`滑块、3px内距、500ms回弹与≤768px页面无桌面滚动槽补偿。Release/CI分别为 `38593721201`/`38593807022`，前端172项、类型检查/Vite、Go全量/vet均通过；公网 `/api/health` 返回新版本，index JS/CSS 与隔离构建逐字节匹配。用 curl GET-only 检查确认发布 CSS 含 `.68,-.55,.265,1.55`、`scrollbar-gutter:auto!important` 和 `padding-right:0!important`；未执行认证业务写操作，真实iOS/Android硬件指示器外观未冒充验证。

## 开关与手机滚动槽（发布前候选记录）

发布前门禁记录：该候选只包含全局 `n-switch` 的参考比例/回弹和移动端页面滚动槽修正。前端 172 项测试、`vue-tsc`、Vite build、Go 全量测试、`go vet ./...` 和 `git diff --check` 已通过；构建保留已知 ECharts 异步 chunk warning。随后已按上方 `v0.2.107` 发布验收部署，不能以本节候选记录替代运行态证据。

## 玻璃文件夹展开状态修正（本地未部署）

根因是 `GlassFolder.vue` 的 hover/focus-within 选择器原本为 `.gf-root:has(...)`，其 specificity 高于 `.gf-root[data-open]`；鼠标停在前盖点击后，闭合 hover 参数覆盖了完整展开参数，纸页只上移到 hover 位置，视觉上像没有正常弹出。现改为仅在 `:not([data-open])` 时应用 hover/focus-within，打开后保持 `-24deg / -96px / 40px / 5deg / 30px` 的展开合同。

5191 `#folders` 刷新后真实浏览器验证：点击“订阅计划”后 `aria-expanded=true`、`data-open=true`，computed `--gf-hinge=-24deg`、`--gf-lift=-96px`、`--gf-spread=40px`、`--gf-fan=5deg`、`--gf-stack=30px`，鼠标仍停留在前盖时不再回落到 hover 值；四张预览纸页的 computed transform 分别采用展开位移。切换“流量包”仍可直接打开，点击空白/关闭与键盘合同保持。未执行生产写操作、未提交、未发布、未部署。

本轮沿用“玻璃文件夹卡片”分类，无新增样式类型；青舟源码、canonical skill 组件/源快照/pattern/契约与项目 Wiki 同步。专项测试、typecheck、Vite build 结果以本轮实际命令输出为准。

## 下拉点击反馈与二级侧边栏可见性复核（未部署）

`node /Users/hinaw/.codex/skills/kreeper-first-design-system/scripts/verify-assets.mjs /Users/hinaw/qing-zhou-fork/frontend --keep` 通过 `28/28` 契约，并完成独立 typecheck/Vite build；构建仅保留既有大 chunk warning。新增/修正断言覆盖示范二级侧边栏分类注释、Dialog ghost 默认弧边按下变量，以及32px贯穿式下拉分割线。

5191 `#menus` 真实 DOM 测得点击下拉按钮宽99px/高32px，分割线宽1px/高32px，打开后按钮宽高不变，箭头仅由45°转225°；按钮被浮层布局向下推移是页面滚动到该示范区的滚动定位，不是按钮自身位移，DOM 几何和文字保持不变。5191 `#navigation` 无障碍树显示“二级侧边栏”、一级 `aria-expanded` 与二级项；5197 旧示范进程已重启并同步同一资产。

源码 `AdminSettings.vue` 已有实际设置页二级侧边栏，使用 CSS 主干/分支/活动标记而非 SVG，并保留搜索、查询参数、键盘焦点和折叠项 tabindex。真实 `5173` QingZhou 应用在未认证访问 `/admin/settings` 时先重定向到 `/login`，因此本轮没有冒充已登录业务页的浏览器验收；生产站点也未部署这些本地改动。沿用“二级侧边栏 / 下拉选择菜单 / 悬浮下拉菜单 / 按钮”分类，无新增类型、AWS规则或生产变更。

## 顶栏组合下拉与完整互斥示范（未部署）

前端 `npm test` 通过 `180/180`，`vue-tsc -b` 通过，Vite 构建通过；保留既有 ECharts `567.24 kB` 大 chunk 非阻断警告。canonical `kreeper-first-design-system` 的 `verify-assets.mjs` 通过 `28/28` 契约、独立 `vue-tsc`、独立 Vite 构建；`audit.mjs` 通过 `77` 源文件、`53` component/page patterns、`238` package hashes，无源码漂移、未覆盖源码、项目 alias 或坏链接。

契约覆盖：示范 `#menus` 只有点击下拉、弹出选择、Popover、Tooltip 四个触发器；`overlayOpen` 保证同一时间只有一个浮层；点击下拉有分割竖线和打开时旋转的箭头；顶栏悬浮入口只有箭头且隐藏分割线；Popover/Tooltip 显式关闭箭头并有 CSS 兜底；独立重复的顶栏同款示范已移除。源码和 canonical skill 的分类注释、topbar/overlays/showcase/source-reference/pattern 已同步。分类沿用“下拉选择菜单 / 悬浮下拉菜单 / 浮层和反馈 / 互斥菜单状态”，未出现需新增类型，不改变 AWS、字体或生产运行态。

5191 本地示范已重启并打开 `http://127.0.0.1:5191/#menus`；浏览器无障碍树确认四个控件存在、点击下拉可展开，且不再出现独立重复的顶栏互斥菜单。未执行生产写操作、未提交、未发布、未部署；本地构建和示范不代表生产已含本轮变更。


## v0.2.106生产发布验收

加载相关tag源码3a91d7748816957587d682baff9697b9cc1968db的Release构建38531536709与CI38531542063均success：171前端测试、类型检查/Vite、Go vet/race及脚本检查通过；隔离源码Go全量通过。此前174工作区测试包括其他未提交改动，不能替代本tag的171测试证据。ARM64资产digest/SHA256SUMS/宿主/运行文件均一致，备份API完整性ok，具体哈希/时间/保护检查见[Deployment](deployment.md)和[项目权威](../../agent.md)。

六个index/Monitor/DashboardLayout公网JS/CSS均200并逐字节匹配隔离tag构建。Playwright/已安装Chrome独立headless生产上下文1167×816、390×844、360×800只延迟真实公开GET响应1600ms，不写生产数据；20px点阵700ms分别42/44/43帧、每帧阴影均不同、中位帧间隔16.7ms，加载期间无切屏遮罩或clip运动，移除后才揭示一台真实本机卡。最终pending清除、无横向溢出/pageerror。390px减弱动态效果保留43帧/41种透明度反馈，等待后无切屏；不是关闭数据门控。截图位于`/tmp/qz-dotmatrix-production-{wait,ready}-{1167,390,360}-no-preference.png`及390-reduce版本。真实iOS/Android硬件和其他浏览器未测；没有认证后台业务写操作。本发布排除复制/Dialog、链接及商城文件夹未提交工作，它们的下方未部署记录保持有效。

## 设置页二级侧边栏（本地未部署）

源码测试覆盖设置导航的分支信息架构、CSS-only 主干/分支/活动标记、`aria-expanded`/`aria-current`、折叠项键盘 `tabindex=-1`、reduced-motion 和无 SVG；canonical skill 的 AdminSettings pattern、源码快照、导航/侧边栏/语义规范和契约同步。前端全量测试、类型检查、构建及 skill 独立审计/资源验证在本轮完成前仍需运行，真实 1167/390/360 浏览器交互验收未完成；因此不能将本地改动视为生产或示范部署。

## 文字链接与两种复制按钮（未部署）

悬浮接缝跟进纠正：两次此前检查确认DOM不变但没有覆盖接缝叠放，曾误把外置焦点框当作用户所述悬浮扩张根因。真实hover=true/focus-visible=false仍复现，Naive输入state-border的z-index1在-1px重叠处盖住按钮背景；悬浮按钮state-border盖回灰线。现组isolation:isolate与按钮所有状态z-index1使整块按钮始终盖住重叠输入边线，键盘内部焦点框保持。

在用户原5191/#folders截图同一复制栏的常态/真实悬浮：DOM左1033/宽46px不变，修正前接缝中部截图像素x306是浅蓝/灰混合、x307是灰蓝，悬浮这两列转为按钮色；修正后常态/悬浮x305均白、x306均按钮蓝色，不再由灰线遮盖/重新显露。截图工具输出JPEG，ffmpeg解码PNG后以中部像素及DOM叠放合并验证，压缩颜色近似值不当成精确CSS颜色。文件`/tmp/copy-actual-{idle,hover}.png`（原JPEG）、`/tmp/copy-stack-{idle,hover}.jpg`及其解码PNG；完整结果`/Users/hinaw/.codex/visualizations/2026/10/10/01a123dc-2f40-7871-855f-a0c71a45c555/copy-stack-fixed.jpg`。

两运行标签实际isolation:isolate/z-index1已生效；真实Space按住active=true、46px、零shadow/transform且内部白焦点。390×844/360×800两组46×32、deltaY0、无横向溢出，叠放不变；恢复视口、关闭临时标签和恢复原空剪贴板。179前端测试、26skill契约/类型检查/构建通过，原chunk警告保留。规范/分类注释/复用CSS/快照与运行示范同步，无新类型、AWS规则改动或部署。以下内部焦点证据仅证明焦点框边界，不再解释悬浮接缝缺陷。

独立新标签页在键盘操作前测得常态/真实鼠标悬浮均x1146、46×32px、hover=true/focus-visible=false、outline none、shadow/transform none；真实键盘聚焦primary白色2px/offset -3px，中性accent2px/offset -3px。实际390×844/360×800两组46×32px、deltaY=0、无横向溢出，焦点框仍内部；视口已恢复、临时标签已关闭。截图`/Users/hinaw/.codex/visualizations/2026/10/10/01a123dc-2f40-7871-855f-a0c71a45c555/copy-inset-hover.png`及`copy-inset-keyboard.png`。179前端测试、26项skill契约/类型检查/Vite再次通过，原大chunk warning保持；规范/分类注释/复用CSS/快照/运行示范同步，无新分类、AWS外部规则变动或部署。

原5191顶部“登录页面”真实鼠标悬浮为深蓝rgb(3,49,96)/underline，独立键盘聚焦hover=false/focus-visible=true同样下划线且2px outline。修正通用文字链接遗漏的hover/focus-visible下划线，不只依赖Markdown专项；示范入口增加项目超链接标记和分类注释。

桌面实测蓝色/中性复制按钮与输入均32px、deltaY=0，hover目标分别accent84%+white与rgb(240,240,240)，根/内层shadow及transform为none、border1px，三种颜色过渡均220ms。最终中性按钮无action-button类，真实Space按住时active=true、背景rgb(240,240,240)、零shadow/transform；蓝色按住状态也保持零shadow/transform，pressed/hover目标颜色由同一CSS变量定义。两种示范复制内容分别为`https://example.com/subscription`、`example --install`，原剪贴板已恢复。

实际390×844/360×800视口中两组输入/按钮均32px、deltaY=0，无根横向溢出，测试后恢复视口。此视口覆盖仍为细指针，不将它声称为真实触摸硬件44px测试；触摸44px合同由已有代码/回归覆盖。截图`/Users/hinaw/.codex/visualizations/2026/10/10/01a123dc-2f40-7871-855f-a0c71a45c555/hero-link-fixed.png`及`copy-links-final.png`。

179前端测试与26项独立skill契约、类型检查/Vite通过，保留ECharts567.24kB及完整示范大chunk warning；没有后端改动或重跑Go。沿用“项目超链接 / 复制栏”，源码/规范/示范/快照已同步，不改AWS外部规则、不新增分类、不提交发布部署。生产事实见[权威](../../agent.md)，实现见[设计系统](../modules/kreeper-first-design-system.md#文字链接与复制状态覆盖)。

## Markdown链接下划线（未部署）

原5191示范实际复现常态underline、hover=false；修正为常态无下划线后，真实鼠标命中确认hover=true/focus-visible=false，颜色rgb(3,49,96)、text-decoration-line=underline。移开并点击非链接区域恢复hover=false/focus-visible=false、rgb(0,122,255)/none；独立键盘聚焦hover=false/focus-visible=true，深蓝/underline及2px outline保持，offset3px。没有点击外链跳转或生产写操作。截图`/Users/hinaw/.codex/visualizations/2026/10/10/01a123dc-2f40-7871-855f-a0c71a45c555/markdown-link-hover.png`；本轮只实测桌面链接状态，不扩大为真实触摸硬件测试。

179前端回归与26项独立skill契约、类型检查/Vite通过，补充断言常态none、hover/focus-visible显式underline及规则顺序。沿用“项目超链接”分类，canonical规范/复用CSS与运行示范同步，保留其他未提交改动；未新增设计类型、改动AWS规范或部署，既有大chunk warning保持。生产发布事实仍属于[权威](../../agent.md)，实现见[设计系统](../modules/kreeper-first-design-system.md#markdown链接下划线)。

## 玻璃文件夹商城（未部署）

本轮修正了用户反馈的交互合同：`activeFolder`替代两个独立开关，点击流量包或订阅计划均直接切换；`GlassFolder`移除展开后的小菜单，文件夹下方直接渲染`UserShop.vue`原有完整`.shop-card`；预览按钮只定位对应原版卡片，不再打开第二套商品Modal。超过四项时，文件夹区域wheel阻止页面滚动并切换最多四页的预览窗口，打开时窗口从第一项开始。

179项前端测试、vue-tsc/Vite通过；前端真实本地GET-only样本`http://127.0.0.1:5198/#/shop`核对订阅计划5张完整原版卡片、流量包2张完整原版卡片，以及点击流量包从订阅计划直接切换。AX树确认不再出现`gf-contents`清单，完整商品卡片保留规格、库存/购买状态；文件夹预览仍最多4张。源码分类注释沿用“玻璃文件夹卡片 / 展示卡片 / 区分-信息牌 / 数字展示 / 高亮弧边按钮”，未出现需新增的样式类型。

canonical skill、源码快照/pattern与原5191`#folders`示范同步。未执行生产写操作、未提交发布部署，生产仍由[项目权威](../../agent.md)记录的运行版本负责；真实触摸硬件与OS reduced-motion本轮仍由代码契约覆盖，不扩大声称。

## 开关与手机滚动槽（本地未部署）

项目与canonical设计系统的全局`n-switch`保持参考组件比例：轨道40×23px、滑块17×17px、3px内距，滑块使用500ms `cubic-bezier(.68, -.55, .265, 1.55)`回弹，按下缩放0.96；启用/停用状态色、禁用、焦点与reduced-motion保留。≤768px隐藏PageScrollbar并交还原生body滚动，同时移除桌面滚动条绘制和右侧16px槽位；针对Naive UI弹层滚动锁可能注入的`padding-right`与`scrollbar-gutter`，移动端以`!important`覆盖为0/auto，避免自绘轨道隐藏后仍残留右侧留白。

前端全量180项测试、typecheck、Vite构建及canonical skill 27项契约、typecheck、build、77源/53 pattern/238哈希审计均通过；390×844与360×800仅作本地浏览器几何和无横向溢出检查，真实移动硬件指示器外观未冒充验证。改动仅本地源码、示范和规范，未提交、未发布、未部署，不改变生产运行态；沿用“切换开关 / 页面滚动条”，未出现需新增的样式类型。

## DotMatrix加载与切屏顺序（未部署）

用户反馈卡顿后直接采样原5191：120次帧间隔的中位数16.7ms、最大16.8ms，但两秒仅4种阴影值，旧currentColor/color-mix阴影关键帧发生离散插值；之前animationName/首尾截图验证不足以证明流畅。改用五条对角线的`@property <number>`独立连续相位，按(x+y)/4延迟，在两个半周期中计算.2→1→.2透明度和.7→1→.7直径。无新DOM/JS逐帧计时器、加载门控或尺寸变化；源码和完整skill样式/规范/契约/快照，以及5191/5197运行示范已同步。

修正后Playwright/Chrome独立上下文在原5191的1167×816、390×844、360×800约2.1秒采样分别128/127/127帧、114/115/116种阴影值，帧间隔中位数16.7ms且最大16.8ms；五条相位在200ms均有.465507中间值，16px按钮22帧均产生不同值。20px内容占位和隐藏圆圈包装保持，手机无横向溢出/pageerror；三尺寸相隔137ms截图解码后均有像素变化（398/458/458色彩通道），文件`/tmp/dotmatrix-smooth-{1167,390,360}-{a,b}.png`和`/tmp/dotmatrix-smooth-feedback-{1167,390,360}.png`。5197同样连续；独立DotMatrix准备示范与切屏无重叠，减弱动态效果仍为1.4秒opacity-only。174项前端测试/类型检查/Vite和24项skill契约/类型检查/构建、74源/51pattern/228哈希审计通过。既有大chunk warning保留，没有生产部署或真实手机硬件/其他浏览器帧率验收，不能把本机Chrome约60Hz采样保证为所有设备固定60fps。

173项前端测试、vue-tsc/Vite、24项skill契约/类型检查/独立构建通过。新增回归覆盖准备期并行/连续请求、响应体完整处理、错误终态、重试间隙页面busy、导航取消和旧token隔离、减弱动态效果及加载消失后才开始Shift5；原请求45秒截止时间/失败传播未变。React/Motion/Tailwind依赖未增加，刷新专项SVG保持；模板/CSS/状态边界分类为用户指定“加载反馈”和既有“组件绘制动画”。AWS外部规则未改，无待确认分类或规范偏离。后端未改，未重跑Go，保留原ECharts/示范大chunk warning。

Browser plugin/skill未提供，本轮使用已安装Playwright和Chrome独立headless上下文，不接触用户生产标签页。GET-only隔离样本在1167×816、390×844、360×800注入1200ms慢响应：目标内容hidden、点阵20px且9点可见、box-shadow随时间变化，点阵仍在时没有Shift5离场/clip动画；加载结束后才启动这些动画，最终gate解除且无横向溢出。注入HTTP500后错误终态正常揭示；两次快速导航不被旧响应提前结束。设置页首次失败后400ms重试空档仍保持loading/hidden，成功后显示，分区query切换最终无残留遮罩。减少运动模式保留等待和1.4秒透明度点阵、目标区域hidden，加载后无切屏运动。

完整示范真实Naive组件验证：按钮16px、NSpin20px、选择器16px，圆圈SVG包装display:none且点阵动画存在；反馈区和900ms准备→Shift5→资源圈重播可操作。框架pageerror为空，预期HTTP500仅为错误场景样本。截图位于`/Users/hinaw/.codex/visualizations/2026/10/14/01a1387c-7582-7c81-9e17-fc2195af7e68/dotmatrix-preview/`（loading-desktop、loading-390、loading-360、ready-desktop、showcase-feedback、naive-controls）；本轮没有真实iOS/Android硬件或生产部署验收。初次只更新独立示范5197，遗漏用户原先使用的5191运行副本。

用户反馈仍为圆圈后，浏览器直接复现5191没有loading.css、NSpin为28px且SVG包装display:block；5197则为20px点阵且包装隐藏，原因是运行副本漏同步而非已证明的浏览器缓存。现已在原5191补同步加载样式、DotMatrixLoader、page-loading/Shift5和对应示范/目录项，保留复制/Dialog及其他共享CSS改动，未重启或替换服务。原地址1167×816、390×844、360×800实测20px九点动画、SVG包装隐藏、无横向溢出与pageerror；900ms准备期加载出现而切屏遮罩不出现，加载结束后才切屏并恢复可操作状态。减弱动态效果为1.4秒dot-matrix-calm，等待后无切屏运动。原示范类型检查及74源/51pattern/228哈希审计通过；截图`/tmp/kreeper-loader-fixed-1167-no-preference.png`、`/tmp/kreeper-loader-fixed-390-no-preference.png`、`/tmp/kreeper-loader-fixed-360-no-preference.png`。此次补同步不代表生产已部署。

专项规范、17个复用组件、74份源码覆盖与51个pattern同步；228包哈希审计通过，Wiki17页无断链/孤立/过期源码引用，权威软链接有效，git diff whitespace检查通过。被用户取消的特效卡片文档/分类/来源/按钮变体登记均移除。并发复制/Dialog改动保留；生产仍为v0.2.105，未提交或发布本轮加载变更。

## 复制栏、Dialog取消与滚动轨道验收（未部署）

165前端测试、vue-tsc/Vite和23项skill资源契约/类型检查/构建通过。回归新增Dialog ghost取消责任边界、等高复制输入/按钮、触摸44px、同色pressed/hover、零位移/阴影和固定键盘outline；旧注释断言同步到“复制栏”专项。既有ECharts及完整示范大chunk警告保留；后端未改，未重跑Go。源码、skill规范/资产/完整快照/pattern与5191示范同步，AWS外部规则未改且未重新获取来源。无新增或待确认视觉类型。

生产订阅页仅测量未执行写操作：1167×816视口中轨道x1151/w16、左分界1px、滑块x1155.5/w8，内部左右净空各3.5px；输入34px/复制按钮32px的缺陷也在修改前复现。滚动几何已正确，未修改PageScrollbar。

本地当前青舟构建配GET-only固定样本验证：确认购买仅打开Dialog并取消，没有执行确定或购买；取消/确定均32px高、18px角，取消透明底/text3/1px中性ring；自动焦点保留，真实Tab后focus-visible为2px中性ring、内层border0。订阅复制栏1167/390/360px两侧height32、y和bottom一致，接缝直角/重合1px；390/360px根scrollWidth分别390/360，手机轨道display:none。复制样本链接成功反馈正常，未使用生产凭据。

隔离真实Naive复制控件按住500ms采样（由测试页面事件记录，而非注入class）：primary鼠标按下/释放背景同为accent84%+white，中性复制同为rgb(240,240,240)；两者transform/root-shadow/state-border-shadow均none、水波display:none、按下/释放过渡均220ms，边线宽度始终1px。真实Enter按住同样保持颜色/无位移；focus-visible静态2px蓝outline、offset2px，未移除键盘提示。完整示范两种复制栏均32px等高，取消样式使用同一共享CSS。截图`copy-dialog-desktop.png`、`copy-sub-mobile-360.png`与`copy-controls-showcase.png`位于本任务可视化目录。触摸44px及reduced-motion是源码合同，不冒称真实手机硬件/粗指针实测；完成后恢复视口、关闭临时QA并保留5191。

本轮验收时审计71源文件/50pattern/221包哈希无漂移、缺失或坏链接；Wiki17页无断链、孤立页或过期源码引用，权威软链接有效，git diff whitespace检查通过。验收构建的360px订阅复制栏仍32px等高，青舟fixture及完整示范浏览器error日志为空。临时只读服务和采样页已关闭/移除，5191示范保留。Codex/Claude Code链接共用canonical skill源，内容更新直接生效；Hermes未配置安装，Desk/外部插件未修改。

结束复核期间另一组加载动画工作进入共享工作区：App/api/router/global.css/shift5及新增DotMatrixLoader/page-loading，未由本轮修改、回退或同步到skill。整仓库audit因此报告这组来源漂移/未覆盖；本轮Dialog/复制CSS责任块仍与canonical资产逐字节一致。上面的165测试/build及浏览器证据对应验收时构建，不代表并发加载工作已经通过全量验收或部署。

## v0.2.105生产发布验收

精确tag源码62d2676的Release构建与CI均成功，含Go vet/race、162前端测试、类型检查/Vite及shell解析；本地Go全量和skill21契约/类型检查/build重跑通过，71源/50pattern/220哈希及Wiki17页通过。生产Release、宿主、运行哈希/health与SQLite Backup API完整性、配置/进程保护见[Deployment](deployment.md)及[项目权威](../../agent.md)；8个index/DashboardLayout/AdminNodes/AdminMonitor公网JS/CSS均HTTP200且逐字节匹配本地构建，error journal为空。

认证生产390×844侧栏：页面rail display:none/body右内距0/scrollbar-width:auto，nav300px、左右16px/gutter:auto/scrollbar-width:none/WebKit display:none/offsetWidth=clientWidth；长菜单真实滚动0→549，品牌y0/height64/footer y780/height64不变，五层抽屉包装圆角0。非匹配搜索空状态为nav直接子级/position:static且菜单0，清空恢复导航。360×800仍无轨道及侧栏槽位，body可原生滚动到800；监控根html宽360/scrollWidth360，页面内部边界存在1px超出但无根横向滚动，Naive按钮水波层均display:none。820×1180保留16px桌面轨道/内距，264侧栏折叠为72、SVG中心35.5px、嵌套子树0。截图`output/production-v0.2.105-mobile-sidebar-390.jpg`和`output/production-v0.2.105-monitor-360.jpg`；实际innerWidth逐次记录，完成后恢复1167×816。

限制：连续将已加载积分图表从桌面缩至390/360px时曾出现图表/card超出内容盒（body scrollWidth420），此图表resize路径本轮未改；在360px重新进入积分页后图表289px、body scrollWidth=clientWidth345、html360且无越界元素。不能用初始手机加载正常宣称连续尺寸切换全面通过。本轮没有生产编辑/删除/排序写操作，按压/hover逐帧仍沿用下面发布前真实Naive采样；真实iOS/Android触摸硬件与OS减弱动态效果未实测。

## 手机侧栏与滚动发布前验收

162前端测试、vue-tsc/Vite和21项skill资源契约/类型检查/build通过。新增合同覆盖768px手机原生页面指示器、隐藏自绘轨道和右内距、无槽位侧栏、共享品牌玻璃及包装无第二滚动区；旧侧栏/品牌测试按用户确认的手机合同更新。后端未改，未重跑Go；既有ECharts与示范大chunk警告保留。

当前青舟构建经本地只读fixture实际验收：390×844页面rail display:none、body padding-right:0、html/body scrollbar-width:none；手机nav宽300px、左右16px、scrollbar-width:none、WebKit display:none、gutter:auto、offsetWidth=clientWidth。长菜单scrollHeight1265/clientHeight716，真实滚动scrollTop从0到549，品牌y0/height64、footer y780/height64不变；抽屉body及body-content-wrapper overflow:hidden且圆角0。360×800同样无轨道/侧栏槽位和页面横向溢出，抽屉关闭后原生body滚动到800px。桌面浏览器模拟窄屏不再显示其15px经典滚动槽；真实iOS/Android滚动指示器外观仍由平台决定，未冒充硬件验证。截图`output/mobile-sidebar-20261014-390.jpg`、`output/mobile-native-page-20261014-360.jpg`。

## 开关与手机滚动槽本地修正（未部署）

源码与`kreeper第一设计系统`已同步全局Naive开关：轨道实测目标40×23px，滑块17×17px，3px内距；滑块位置使用500ms `cubic-bezier(.68, -.55, .265, 1.55)`回弹，按下缩放0.96，保留Naive启用/停用色、禁用、键盘焦点及reduced-motion静止语义。此前5191示范中同款局部类已收敛为系统级合同，实际业务写入和生产部署均未执行。

≤768px仍使用原生body滚动，PageScrollbar隐藏；同时撤销桌面浏览器的html/body滚动条绘制，body右内距为0，内容不再被右侧15/16px经典滚动槽挤窄。390×844和360×800本地预览的`html/body/#app`几何、滚动宽度和页面无横向溢出已测量；真实移动平台指示器未以桌面模拟器结果代替。

820×1180竖屏桌面仍为16px自绘轨道/body内距16；菜单32px高、padding6px12px、8px角、13/20/500，与手机相同。折叠宽72、SVG中心约35.5px、子树0；768px切换手机后rail隐藏/内距0。完整示范390×844同样无轨道及侧栏占宽、64px玻璃品牌和直角抽屉；打开二级图表菜单并实际滚动到89px，独立层级线left8px/width1px保留。截图`output/showcase-mobile-sidebar-20261014-390.jpg`。当前测试使用浏览器尺寸覆盖，不声称真实iOS/Android、触摸指针或OS减弱动态效果已实测。

源码分类沿用侧边栏、顶栏/品牌标识、页面滚动条，无新类型；用户要求的响应式规范已同步，AWS外部规则未改。上述是发布前本地验收，现已随v0.2.105部署；5191示范保留。

## 搜索与点击反馈发布前验收

161前端测试、vue-tsc/Vite通过；新增结构解析契约确认桌面/手机空状态为筛选框之后的菜单同级块，并与n-menu互斥；覆盖Markdown专属hover/focus、按钮水波、同色pressed、共享回弹、禁用与减弱动态效果变量。skill20契约、独立类型检查/build通过；后端未改，本轮未重跑Go。既有ECharts和完整示范大chunk warning仍为非阻断项。当前源码及规范同步，不以测试通过推断生产已发布。

1167px示范实际确认侧栏非匹配时position:static、border0、shadow:none且菜单数量0，清空恢复菜单。Markdown正文链接常态rgb(0,122,255)，真实指针hover及键盘focus-visible均rgb(3,49,96)，下划线保留。隔离验收页使用真实NButton/theme/复用CSS并将按住350ms采样写入可见DOM：六种操作按钮pointerdown矩阵translateY1px、水波层display:none，pointerup回到无位移；高亮背景为accent84%+white，警告rgb(252,176,64)，pressed/hover token相同；高亮Enter按住也1px同色，禁用transform:none。不是通过浏览器注入class模拟按压。OS减弱动态效果和coarse指针未实测，源码合同与浏览器证据分开。

当时生产仍为v0.2.104，上述修正现已随v0.2.105发布部署；示范5191保留，生产证据见本页首节。

390×844手机抽屉非匹配筛选空状态位于mobile-sidebar-nav直接子级、position:static、shadow:none，菜单数量0，抽屉圆角0；清空恢复导航。360×800按钮/表单示范无页面横向溢出，按钮水波层全部隐藏；截图`output/buttons-feedback-20261014-360.jpg`。实际innerWidth已记录，完成后恢复视口、关闭隔离采样/手机临时标签页。最终源/快照审计71源、50pattern、220哈希通过；Wiki17页无断链/孤立页/过期源码引用。

## 2026-10-14 界面与监控验收（已部署基线）

本轮监控后台与首页复用AvailabilityHeatmap的16列×3行矩阵/立体视图、坐标、状态色、提示和键盘交互；查询保留管理/公开权限边界。后台本机指标和趋势只显示一次，OCI回环资产保留关联资产编辑入口；摘要与管理端热图去重，不停止采集、不删除资产。全部NAlert类型、订单条目和首页摘要SVG无额外边框；帮助状态切换完整测量/跟随/回位，选中卡维持中性选中底色。超链接常态Apple蓝，hover/focus-visible显示下划线offset3px。折叠分组为4px中性圆点；顶栏/侧栏无匹配显示“无结果”；移动侧栏Teleport包装均0圆角，菜单行仍8px。首页价格牌来自手填资产月费，默认零值不显示。分类注释、专项规范、复用代码、示范与快照同步，无新分类或待确认规范偏离。

源码158项前端测试、vue-tsc/Vite、Go全量通过；skill18项契约/类型检查/构建、71源/50pattern/220哈希审计通过。保留既有ECharts及完整示范大chunk警告。只读本地fixture在1280/390×844/360×800无横向溢出，后台一张指标卡、关联OCI编辑、有效矩阵/立体Canvas、折叠圆点居中、搜索无结果、帮助切换指示面均确认；手机抽屉各包装层计算圆角0px。AWS外部规则未改变，未重新获取官方来源。

生产v0.2.104认证只读核对：后台指标卡数量1，关联OCI资产编辑入口保留，热图Canvas实际绘制48格立体矩阵；桌面1280px无横向溢出，标题为真实A/href、常态蓝色无下划线，键盘focus-visible下划线且offset3px。控制台到期提示border0且未输出内部边框，3个订单条目border0，首页6个summary-icon边框0/无阴影，默认零月费牌不存在。顶栏/侧栏非匹配搜索均出现“无结果”；折叠后4个4×4px圆点x33.5（中心35.5），嵌套菜单不可见。帮助页初始指示面x4/w54，选项aria-pressed正确，选中卡点击后仍rgb(240,240,240)。390×844抽屉四层包装均0圆角/300px；360×800帮助页和监控页无横向溢出，监控Canvas288×220。浏览器error为空，未执行编辑/删除/排序/公开开关等业务写操作。截图`output/monitor-v0.2.104-360.jpg`；部署过程见[Deployment](deployment.md)，精确运行证据见[项目权威](../../agent.md)。

完整示范的五种NAlert内部边宽均0px；真实390×844和360×800无页面横向溢出，复用手机抽屉各层0圆角/300px。截图`output/showcase-v0.2.104-360.jpg`。浏览器视口覆盖会因标签页不同而不生效，验收记录实际innerWidth而不是只记录请求值；测试后恢复默认视口。鼠标独立hover、粗指针与reduced-motion依然只有源码/回归证据，不冒充本轮设备实测。

## OCI 回环指标与服务器标题核对

生产只读数据确认 `OCI Singapore` 为 `id=1`、`127.0.0.1`、探针关闭的旧资产行；面板实时采样在 `server_id=0`。实现现在把回环资产的卡片指标、趋势、周期流量和详情查询映射到 `server_id=0`，并隐藏重复探针安装入口；回归测试覆盖在线状态、指标复用和无独立 probe token。

服务器标题按“项目超链接”验证：真实 router-link/href、常态 accent、无下划线，hover accent-hover，键盘 focus-visible 可见。容器是“展示卡片”，标题跳转不误写为整卡可跳转。

新增回归覆盖回环主机识别、趋势数据复用并保留资产 ID、不同重置周期/计费方向、校准与流量分析一致性。源码`da341b70e8c90e06ae78e8236aff88ca4d1d8359`通过149项前端测试、vue-tsc/Vite与Go全量测试；skill本轮实际重跑18项契约、独立类型检查/构建及71源文件/50 pattern/220哈希审计，全部通过。

生产`v0.2.102-kreeper-20261013-monitor-contract`认证监控页确认两卡真实CPU/内存/磁盘及趋势，OCI详情显示真实资源与历史流量；标题实际为A/href，常态rgb(0,122,255)、text-decoration:none，键盘focus-visible为2px蓝色outline。1280px桌面、390×844与360×800无页面横向溢出，浏览器error日志为空；未声称实际执行鼠标hover或coarse触摸测量。公网AdminMonitor JS/CSS与本地构建哈希一致。截图为`output/monitor-oci-v0.2.102.jpg`，临时viewport已恢复。仅只读浏览，未执行生产校准、编辑、保存、删除或排序。

## 监控页、链接与刷新交互发布前 gate

源码提交 `4ec8bd18cfe66dd32a83ea73134797fa21fe9cbc` 的验证覆盖管理页编辑/删除/清除/高亮弧边按钮、监控范围切换、服务器导航链接、到期提示、文档操作和全部刷新入口的分类注释与样式责任边界。刷新入口统一复用 `RefreshButton`：悬浮/聚焦旋转180°并以与真实 loading 相同的速率回转，真实请求期间才无限旋转，减少动态效果时静止。

前端测试 `148/148`、`vue-tsc`、Vite 构建、`go test ./...`、`git diff --check`、skill `18/18` 资源契约/类型检查/构建，以及 `71` 源文件、`50` pattern、`220` 哈希审计均通过。GitHub Release `v0.2.100-kreeper-20261013-monitor-refresh`（run `38356666544`）的 ARM64 资产 SHA-256 为 `9084ff13c493ff4aa0585b86a6f91ea8b89dfe8c85b2c55be4ce1bee38c32cbe`，生产运行态已核对一致。保留既有 ECharts 大 chunk warning；它不阻断发布。浏览器生产核验只读检查目标页面和刷新交互，不执行删除、清除、保存、排序或其他业务写操作。

注释判定沿用项目规则：修改已有类型时由实现根据语义自动补齐正确分类注释；无法归入现有分类时必须先提出候选名称、几何/状态/响应式边界并提醒用户确认，不能静默创建类型。后续实现若违背已确认规范，也必须提醒是否同步设计系统。

## Button contract release gate

Source `1c665580765e18ceb1c5ac4eef22da5287387d3a` passes 148 frontend tests, vue-tsc/Vite, full Go tests and diff check. Unified skill passes 18 contracts/typecheck/build plus the 71-source/50-pattern/220-hash audit. Default arcs share normal-button geometry/state except 18px corners; highlight arcs brighten on hover/mouse focus, keep press feedback, and no longer lose decorative rings on mouse focus. All explicit deletion templates use the unified 32px desktop / 44px touch red-text transparent surface; destructive plan removal, provider clear, session revoke and dynamic form deletion are included. Existing genuine requests, permissions, disabling and confirmation handlers are preserved.

The built QingZhou source and complete showcase verify desktop operation groups and the narrow package form without horizontal page overflow. The local 5191 showcase visibly confirms equal button heights/baselines, red delete/revoke surfaces, highlighter focus state without simulated loading, centered collapsed SVGs and shared brand/topbar glass. The package drag contract is exercised by insertion, no-op and persistence-failure rollback tests; no production reorder/delete/save action was executed. Pointer remains fine in this viewport-only test, so44px coarse-pointer hit targets are code evidence, not a claimed touch-device measurement. Existing ECharts567.24kB and full-showcase large chunks remain non-blocking warnings. Release and CI/race gates are tracked separately from local browser evidence.

## 节点分组删除恢复验收

2026-10-12定点恢复只修改node_groups、node_group_members、plan_groups。当前13个节点ID保持，四个套餐授权恢复；SQLite完整性ok，恢复前快照可用。生产sing-box授权用户由0恢复为4，三项服务active且无失败重启，Tunnel启动时间未变；公网健康版本保持现有发布。认证生产节点页显示1个分组、13个启用节点，包括全部11个Edge节点。SSH代理外连探针被远端中断，未取得真实外连成功证据；页面/配置恢复与代理外连验证分别报告。恢复流程见 [deployment](deployment.md)，生产备份与运行事实见 [项目权威](../../agent.md)。

## 删除按钮与默认弧边核对

统一删除以认证生产节点管理页的计算样式为来源：红字#ff3b30、透明底、桌面32px高、13px/20px、左右10px、weight500、18px角；触摸设备44px命中高度，无常态边框/阴影。hover浅灰rgba(46,51,56,.09)，键盘focus-visible单独显示白/蓝焦点ring，红字与无装饰边框保留。撤销会话复用外观但仍执行撤销业务；真实删除、撤销和套餐排序未在生产浏览器执行。

默认弧边、添加节点、清除筛选实测均为32px高、padding0 10px、13px/20px weight500、透明底、18px角、相同中性1pxring；后二者是功能复用，不再列浅蓝次级/轻量类型。普通按钮仅圆角为8px；默认样式以真实.n-button__border子节点限定，数字输入步进按钮仍18px高、无描边/阴影，quaternary裸按钮不受默认弧边覆盖。

按钮状态层叠实测复现普通按钮点击后shadow:none：旧全局鼠标focus重置清除了装饰ring。该规则已移除；普通/强调/默认弧边的Naive focus/pressed内边框均为0，外ring由各自合同绘制。八个可点击样例（普通、强调、默认弧边、高亮、警告、删除、添加、清除）逐一核对点击释放及失焦，均无模拟转圈；普通/默认弧边点击hover为2px中性强ring，失焦回1px中性ring。鼠标移开但保持focus的独立检查确认普通/默认/强调恢复常态ring，高亮/警告保留提亮、删除保留浅灰，失焦后回常态。

键盘Tab/Shift+Tab逐项核对，普通/默认的2px中性ring、强调的2px蓝ring保留；高亮独立focus-visible白/蓝焦点ring补齐，避免通用primary的无shadow覆盖。高亮与警告的点击聚焦提亮是正常状态，示范不触发假loading；真实业务请求状态由调用方控制。沿用已有分类，规范、源码快照、pattern、复用CSS与运行示范同步，已随 `v0.2.99-kreeper-20261013-button-layout` 发布。生产套餐页只读核对已显示拖动把手和统一操作轨道，未执行排序、删除或保存写操作。

项目148项测试、类型检查和Vite构建通过；skill18项契约、隔离类型检查/构建、71源文件/50pattern/220哈希审计通过，Wiki16页无断链/孤立页/失效源码引用，git diff --check通过。当前证据为桌面1167px和本地示范页；不据此新增生产手机或触摸实测结论。生产版本以[项目权威](../../agent.md)为准。

## Unified design skill gate

Use `kreeper-first-design-system` through its complete SKILL entry. Run
`scripts/audit.mjs /Users/hinaw/qing-zhou-fork` for source/snapshot coverage,
package hashes, patterns and internal links, then
`scripts/verify-assets.mjs /Users/hinaw/qing-zhou-fork/frontend` for isolated
typecheck, 18 meaningful contracts and build. Rebuild the complete showcase with
`scripts/preview-showcase.mjs`; its 25-topic matrix maps 15 sections and the
50 source component/page contracts. Console, public topbar and complete
login/register/recovery are separate interactive scenes.

Require Chinese semantic comments at template/style/rendering boundaries.
Unknown categories need a proposal and user confirmation. When a project generated
with this system proposes a change that breaks a specification, actively ask
whether to update the corresponding design-system rule; do not silently register
an exception. Responsive behavior is required for every component.

Background levels follow nested module depth: page white, level one #fafafa,
level two white. Typography has four CJK/Latin family roles; AWS typography,
weights, line heights, spacing, numeric/monospace use and chart palettes are read
from the official linked pages when used, not a parallel local AWS snapshot.
Courier Prime is the showcase's named implementation choice. Validate file URLs,
actual weights/axes and browser glyph loading separately from CSS family strings.

Browser gates include 1440/1280, 1024/768, 390x844 and 360x800, no page horizontal
overflow, 264/72px desktop sidebar, 300px mobile Drawer, 64px topbar, menu mutual
exclusion and 8px hit bridge, ordinary selectors/flyouts, hover/focus/pressed/disabled,
selection foreground inheritance, 28px auth feedback slots, form-relative geometry
before/after errors, Canvas rendering, ring refresh and reduced motion. Record
actual evidence and uncovered paths; project-source tests and production checks
remain separate. Current evidence is in [sync state](../_sync-state.md) and the
[integration boundary](../modules/kreeper-first-design-system.md).

## Matrix / skyline and refresh gate

Read the skill refresh/skyline specifications. The public homepage and admin
monitoring overview share the Canvas matrix/isometric scene through
AvailabilityHeatmap; their APIs keep separate permission boundaries and individual
resource trends continue using ECharts. The current API `state_count: 4` consists of
three native severity states (normal/high/critical) plus the offline/no-data
sentinel; it is not four health colors. Verify each of the 48 bucket timestamps
occurs once per server, chronological 16x3 layout (48 buckets, time-major order; do not label the Y axis “bucket index”), only green/orange/red plus a
neutral missing value, legacy three-state offline handling, all-grey and empty
rows. Column height is a state level, not resource percent. Server labels wrap as DOM text; at <=640px they
move above the matrix. Activity counts use the independent AWS sequential
adapter, with missing distinct from zero and no implicit mock data.

Browser acceptance must include 2D/3D reversal, visible Canvas render, orbit and
double-click reset, exact tooltip/keyboard dates, Home/End/Escape, legend filter,
full data table, latest range under request races, refresh loading/disabled and
no page overflow at desktop/390x844/360x800. Reduced-motion and disposal are
executed in a renderer test with controlled frame/media/observer inputs; do not
claim that unit evidence is an OS-level browser setting test. The 21st refresh
reference is 404; record independent implementation instead of fabricated source.

Current local gates: frontend 158/158, typecheck, Vite build, `go test ./...`
and `git diff --check`; skill 18/18 contracts, typecheck/build and 71 source
files/50 patterns/220 hashes. Tests include the actual Canvas lifecycle and
cleanup, not only source matching. Build warnings retain the existing 567.24kB
ECharts async chunk and the full showcase chunk. The initial matrix release was `v0.2.96-kreeper-20261012-heatmap`; the corrected 16x3 source is released as `v0.2.97-kreeper-20261012-heatmap-3row` and deployed. Production acceptance is recorded in [project authority](../../agent.md), while local and production evidence remain separate.

The activity and availability showcase renderers pass real browser checks at
390x844 and 360x800: both canvases render at positive size with readable X/Y
axes and the document has no horizontal overflow. The availability server name
wraps fully above its matrix instead of truncating; keyboard date/status hints
remain available. The refresh sample is busy during its request and increments
its completed count. Existing ECharts ChartSpecimens emitted four initial-size
warnings on the first narrow-screen load, then rendered; no application error
was observed. Keep that warning boundary separate from the new Canvas charts.
The initial authenticated production monitor page was refreshed after deployment and
visibly showed the 3D availability matrix, time/server axes and green/orange/red
plus gray legend. This is a desktop production check; it does not replace the
local 390x844/360x800 responsive evidence. Current admin/homepage shared-component
and production mobile acceptance is recorded in the 2026-10-14 section above.

## Warning and error feedback gate

`frontend/src/App.vue` and the skill reusable theme set `Alert.border`,
`borderInfo`, `borderSuccess`, `borderWarning` and `borderError` to `none`.
All five alert types keep their semantic backgrounds, icons, text and layout. Use the existing
Chinese `提示信息 / 警告信息` comments at the theme and showcase responsibility
boundaries. In Naive 2.44.1, inspect the actual `.n-alert__border` layer: its
computed border width must be 0px and the alert must have no base shadow. A root
border of 0px does not prove this; Alert does not guarantee type classes.

Local browser acceptance covers the showcase and built QingZhou dashboard with
a virtual user API fixture: expiry warning and banned-account error at desktop,
390x844 and 360x800. Warning/error backgrounds are rgb(255,247,235) /
rgb(255,239,238), icons retain Apple orange/red, both have 0px internal borders,
and pages have no horizontal overflow. This earlier rollout passed frontend 133/133 tests, typecheck and
isolated build passed; skill typecheck, 10/10 contracts and build also passed.
This responsive fixture evidence remains local. The Alert theme change shipped
with `v0.2.96-kreeper-20261012-heatmap`; the production acceptance in the
deployment record is separate from these viewport-specific checks.

## Sidebar collapse gate

`frontend/tests/admin-upstreams.test.mjs` executes the actual `toggleSidebar`
and `updateSidebarExpandedKeys` handlers. Collapse must clear every nested key
and the hidden filter, reopening must keep the tree closed, and a group SVG must
expand the sidebar before opening its children. The desktop menu uses controlled
`expanded-keys`; collapsed child containers are immediately hidden, including
closing animations. Static group titles retain no SVG. The mobile Drawer uses
its independent default expansion state.

The 2026-10-12 sidebar gate passed 133/133 frontend tests, typecheck and isolated
Vite build. The skill passed source coverage, isolated typecheck, 10/10 contracts
and build. The later matrix/skyline gate passed 142/142 frontend tests, typecheck
and Vite build; skill coverage passed with 18/18 contracts, typecheck and build. Browser acceptance verified the 72px outer-icon rail, cleared children,
reopen behavior, group activation, keyboard Enter/Space and filter clearing;
390x844/360x800 kept the 300px complete mobile Drawer, working selection/close
buttons and no page horizontal overflow. Icon centering also requires an explicit
collapsed single-column override, symmetric native scrollbar gutters and alignment
with the brand/footer center. Validate with genuine overflow in a 1024x400
viewport, not only an unscrolled screenshot. The showcase quota-state switch
uses the existing 16/12/4 route-switch contract and one moving surface for all
three states; keyboard activation and 390/360px wrapping were verified.
This is local fixture evidence for the detailed menu/keyboard states; the
sidebar implementation shipped with `v0.2.96-kreeper-20261012-heatmap`.
Production was not re-authenticated specifically for collapse interactions.
Existing chunk warnings remain.

## Desktop topbar divider gate

`frontend/tests/header-divider.test.mjs` covers shared height, border-box sizing,
non-shrinking desktop brand, identical divider tokens, and the unchanged mobile
drawer. Browser acceptance checks the actual 64px lower edge and 1px computed
border on both sides, expanded/collapsed desktop states, and 390x844/360x800
viewports with no horizontal overflow. Deployment evidence belongs to
[project authority](../../agent.md).

## Dashboard automatic renewal reminder gate

`frontend/tests/dashboard-alerts.test.mjs` executes the dashboard's actual Vue
computed logic. It covers enabled/disabled/missing preferences, reactive refresh,
nearest-plan selection, mixed simultaneous expiries, ineligible buckets, the
seven-day boundary, and the existing banned/exhausted/no-active warnings.
The complete frontend suite has 132 passing tests; typecheck, Vite build and
`go test ./...` pass with the existing ECharts asynchronous chunk warning.

Browser acceptance checks the information message and `/sub` link with renewal
enabled, the manual-renewal warning with renewal disabled, refresh-driven state
changes, and desktop/390x844/360x800 wrapping without overflow. Validate the
existing subscription control by reading its checked state, never by toggling a
production financial preference. Public dashboard assets must match the isolated
build before claiming deployment. Runtime proof belongs to
[project authority](../../agent.md).

## Homepage resource ring gate

`resource-gauge.test.mjs` executes the component's computed/countup logic with a
controlled frame clock. It covers the reveal gate, synchronized arc/text,
continuous increases/decreases, zero/full/decimal/invalid values, 70/90 status
thresholds, late mounts, reduced motion, background fallback and disposal.
The frontend suite contains 124 passing tests, including neutral percentage
text independent of status-colored arcs, numeric/body price-label roles, and
the annotated ordinary price information badge using soft blue tokens;
typecheck, Vite build,
`go test ./...` and `git diff --check` pass. The existing ECharts async chunk
warning remains non-blocking.

Browser acceptance samples the actual homepage `.gauge-fg` offsets and
`.gauge-val` numbers across reveal and refresh, including delayed metrics.
Check three resource rings per server, zero/full/low-decimal usage,
route re-entry, desktop and real 390x844/360x800 viewport geometry. Source
tests and HTTP 200 alone do not establish visible motion or deployment.
Current release/production proof belongs to [project authority](../../agent.md).

Price badge acceptance checks both zero and nonzero monthly prices, computed
`--info` text and `--info-soft` backgrounds, no border/shadow, unchanged font
roles, refresh persistence and desktop/390px/360px overflow. Public hashed
Monitor assets must match the isolated release build before claiming rollout.

## Dashboard dual usage ring release gate

The motion gate includes `dashboard-motion.test.mjs`: empty progress before the
page reveal, intermediate frames for both rings, synchronized percentages,
continuous updates, reduced-motion snapping, background fallback and disposal.
Rendered acceptance samples the actual `.ring-arc` offsets, not only the
presence of a CSS transition or a successful asset HTTP response. Test normal
and delayed dashboard responses, refreshed data, zero/missing/unlimited quotas,
route re-entry, desktop and 390px/360px layouts before rollout.

Release source is checked against `git archive`; its dashboard assets match
the validated build. Only explicitly staged files enter the release commit.
`go test ./...`, 116 frontend tests, `vue-tsc -b`, Vite build and
`git diff --check` pass. The known ECharts asynchronous chunk warning remains.

Local fixture QA covers desktop, 390px and 360px widths, independent ring
thresholds at 70% and 90%, zero/full usage, missing quota and unlimited quota.
Production acceptance reloads the authenticated dashboard, exercises refresh,
checks the visible Edge label and dual-ring geometry, and verifies downloaded
hashed assets against the release binary. Deployment evidence belongs to the
[project authority](../../agent.md).

## 2026-09-30 Typography contract release gate

The release gate passed `go test ./...`, 108 frontend contract tests,
`vue-tsc -b`, `vite build`, and `git diff --check`. The known 567 KB ECharts
async chunk warning remains non-blocking. Commit `125631a` was released as
`v0.2.87-kreeper-20260930-font-contract` by Actions `36727439609`; the ARM64
asset SHA-256 is
`9feaafc8e0c736ac04a81972015b0aebe2fcdb1e8133d0c8025dae3c229ffc11`.

After deployment, local/public `/api/health` returned the release version;
`qingzhou.service`, `qingzhou-sing-box.service` and `cloudflared.service` were
active; `8081`, `8882` and `18082` were listening; public root, hashed JS/CSS
and `/fonts/inter/Inter-Variable.ttf` returned `200`; and the post-restart
`qingzhou.service` error log was empty. Rollback material is retained at
`/opt/qingzhou/backups/fork-v0.2.87-kreeper-20260930-font-contract-20260930-222853/`.

# Validation Guide

## 玻璃文件夹命中边界与顶栏材质（未部署）

本地源码将玻璃文件夹的监听从根组件移到实际对象舞台：114px顶部展开留白、透明包装层和文件夹组背景空白不承接点击/悬浮/wheel；实际后板、前盖和展开纸页按钮仍可操作。`#folders` 真实浏览器核对确认顶部透明留白点击前后 `aria-expanded` 不变，实际前盖点击可打开；在五件商品文件夹实际区域滚轮后，预览窗口从“标准/轻量/专业/长期”切换为“轻量/专业/长期/跨地区”，页面 `scrollY` 保持0。文件夹外滚轮仍由页面处理。同页 computed style 确认顶栏与`.gf-tint`共享相同的渐层背景图，顶栏与`.gf-front`共享`blur(22px) saturate(1.5)`。

公共顶栏、控制台顶栏、桌面品牌区和手机 Drawer 品牌区均使用玻璃文件夹前盖渐层、64px高度和底部中性分界线；滚动/菜单打开状态没有恢复旧纯色 scrim。代码/skill合同覆盖实际命中边界、滚轮窗口和材质变量；本轮未执行生产写操作、提交、发布或部署。前端179项回归、`vue-tsc --noEmit -p tsconfig.json`、Vite build、skill合同/审计结果以本轮终端输出为准，既有ECharts大chunk warning仍为非阻断警告。

## 2026-09-30 Admin user avatar identity palette (local, not deployed)

Admin user avatars now use a stable six-color Apple identity palette: indigo,
purple, pink, cyan, cyan-blue and mint-cyan. Pure blue and gray-blue were
removed. The avatar palette is separate from online, banned and administrator
status colors; the avatar background is a light mix and the text remains a
darker same-hue color. The contract passed 106 frontend tests, `vue-tsc -b`,
`vite build`, and `git diff --check`; the known 567 KB ECharts async chunk
warning remains non-blocking. Production is unchanged at
`v0.2.86-kreeper-20260929-apple-soft`.

## 2026-09-29 Admin overview status surfaces (local, not deployed)

Admin-overview KPI deltas and user-distribution values now use the shared Apple
semantic status tokens instead of categorical chart colors. Distribution items
are borderless white display-information modules; hover/focus adds only the
neutral display-card shadow and leaves drill-down behavior unchanged. The
contract passed 106 frontend tests, `vue-tsc -b`, `vite build`, and
`git diff --check`; the known 567 KB ECharts async chunk warning remains
non-blocking. Production is unchanged at
`v0.2.86-kreeper-20260929-apple-soft`.

## 2026-09-29 Admin upstream balance surface (local, not deployed)

The OCI and Cloudflare balance panels remain neutral display cards after a
successful usage query: `AdminUpstreams.vue` uses `var(--bg)` for the normal
surface and keeps the danger-tinted surface only for failed queries. The
progress bars still use the Apple success chart token. The contract passed 105
frontend tests, `vue-tsc -b`, `vite build`, and `git diff --check`; the known
567 KB ECharts async chunk warning remains non-blocking. Production is
unchanged at `v0.2.86-kreeper-20260929-apple-soft`.

## 2026-09-29 Help navigation information badge (local, not deployed)

The selected help-document navigation item uses the shared Apple blue
information surface, `var(--info)` / `var(--info-soft)`, with a transparent
border and no shadow. Search, selection geometry, document content and routing
are unchanged. The contract is covered by 104 frontend tests, `vue-tsc -b`,
`vite build`, and `git diff --check`; production remains
`v0.2.86-kreeper-20260929-apple-soft`.

## 2026-09-29 Points status numbers (local, not deployed)

The points page's income, expense, net-change KPI values and transaction
amounts are classified as status-coded numbers and reuse the shared Apple
success/error tokens. Chart category colors remain independent. The contract
is covered by the 103 frontend tests, `vue-tsc -b`, `vite build`, and
`git diff --check`; production remains
`v0.2.86-kreeper-20260929-apple-soft`.

## 2026-09-29 Order status numbers (local, not deployed)

The order page's colored refund KPI, refunded order amount, and returned-points
notice are classified as status-coded numbers. They reuse `var(--success)`,
`var(--danger)`, and `var(--warn)` instead of local hex colors; categorical
chart colors remain independent. The contract is covered by the 102 frontend
tests, `vue-tsc -b`, `vite build`, and `git diff --check`. Production remains
`v0.2.86-kreeper-20260929-apple-soft`.

## 2026-09-29 Shop information badges (local, not deployed)

The shop's `订阅计划` badge and same-renewal-group queue note are classified as
information badges, not success/status badges. They use the shared Apple blue
`var(--info)` text and `var(--info-soft)` surface with a transparent border.
The focused contract passes as part of the 101 frontend tests, plus
`vue-tsc -b`, `vite build`, and `git diff --check`. The production deployment
remains `v0.2.86-kreeper-20260929-apple-soft`.

## 2026-09-29 Apple soft status surface release gate

The local visual revision passed all 100 frontend contract tests, `vue-tsc -b`,
`vite build`, and `git diff --check`. It changes compact status badges to
translucent Apple-tinted surfaces with Apple semantic text/icons while keeping
solid fills for status-coded visualizations. Commit `537e5be` was released by
Actions run `36545227310` as
`v0.2.86-kreeper-20260929-apple-soft`; the ARM64 asset SHA-256 is
`c9f8248dda85e86f60e838dc2ee1f1e411d02098b1200bf0d80ab2f535b26942`.
After deployment, local and public health returned the release version, all
three services were active, ports `8081`, `8882`, `18082` were listening, the
public homepage and hashed JS/CSS returned `200`, the public bundle contained
the five Apple status tokens, and the panel error log was empty. The rollback
directory is
`/opt/qingzhou/backups/fork-v0.2.86-kreeper-20260929-apple-soft-20260929-165909/`.
The host lacks the `sqlite3` CLI, so `PRAGMA integrity_check` was not run; the
database snapshot is retained.

## 2026-09-28 Apple status palette and monitor release gate

The gate passed 100 frontend contract tests, `vue-tsc -b`, `vite build`,
`go test ./...`, and `git diff --check`. The known ECharts async chunk warning
(`567 KB` minified) remains non-blocking. Status-coded charts and ordinary
status surfaces resolve through the Apple status palette; categorical chart
colors remain separate.

Commit `84b9f0e` was released as `v0.2.85-kreeper-20260928-apple-status` by
workflow `36406243452`. The ARM64 panel asset SHA-256 is
`b3347cb2fac549a1cf79e5b405617cd720619461a24c6e13a9bcd3fc4b6cce60`.
Production and public validation returned the release version from
`/api/health`; all three services were active, ports `8081`, `8882`, `18082`
were listening, and the public hashed frontend resources returned `200` with
matching local hashes. The host lacks the `sqlite3` CLI, so `PRAGMA
integrity_check` was not run in this deployment; the database copy is retained
in the rollback directory.

Run from the repository root:

```bash
go test ./...
npm --prefix frontend test
npm --prefix frontend run typecheck
npm --prefix frontend run build
git diff --check
```

## 2026-09-26 Authentik OIDC Issuer fix

The focused OAuth suite and `go test ./... -count=1` passed. The focused source
diff also passed `git diff --check`; an unrelated pre-existing trailing-space
warning remains in `frontend/src/views/AdminSingbox.vue` and was not changed.
The live OCI check confirmed Authentik discovery `200`, local/public health
`200`, and local/public OAuth start `200` with PKCE S256 authorization URLs.

## 2026-09-26 Embedded frontend resource release

`frontend/npx vite build` completed successfully, followed by a Linux ARM64 Go
build from the stable `293613b` source baseline. An isolated binary smoke test
served the embedded home page, its hashed JavaScript and CSS assets, and the
health endpoint with `200`; the public deployment repeated those checks. The
production binary hash is
`8a0570b43f176a8ab9addb9b11936b3e67f565e0fd3eeb770416a9b6f2ffab58`.

## Edge quota and package force-sync release

The release gate passed `go test ./...`, the 23 front-end contract tests,
`npm run typecheck`, `npm run build`, and `git diff --check`. Source
`c0b46be` was deployed as `v0.2.80-kreeper-c0b46be`; the active ARM64 binary
hash is
`71a013cb483e5bcea6cdcf8d2a5d4e5bd8b432e349ceaa2ccbe380ac3068e893`.
The rollback SQLite snapshot at
`/opt/qingzhou/backups/edge-quota-force-sync-c0b46be-20260921-025700/` passed
`PRAGMA integrity_check`. Local/public health, all three services, and ports
`8081`, `8882`, `18082` passed. Public feature chunks were fetched and checked
for the force-sync and Edge-quota markers; the unauthenticated admin route
returned `401` as expected.

## Site branding

Brand icon coverage is exercised by the API and front-end test suites. The API
tests verify save-to-public-config round trips and reject unsupported SVG,
invalid Base64 and MIME/signature mismatches without partially writing other
settings. The front-end test verifies the basic-settings upload entry and the
shared logo/favicon/Apple touch-icon update path.

For an operator check after deployment, sign in as an administrator, open
`系统设置 → 基本设置`, upload a PNG/JPEG/WebP image no larger than 512 KiB, save,
then reload a public page and inspect the header/sidebar/login mark and browser
tab. Use `恢复默认图标` and save to verify the `/qingzhou-mark.svg` fallback.

## Site branding deployment record

On 2026-09-18, source commit `3fd12bb` was built for Linux ARM64 and deployed
as `v0.2.80-kreeper-3fd12bb`. The active binary SHA-256 is
`2339a92e8ce127064eda51634467348ea9fd3a2437e0d0b64a8be8f8402ba22d`; the
pre-release binary, environment, service definitions, sing-box configuration
and a consistent SQLite backup are retained in
`/opt/qingzhou/backups/site-brand-3fd12bb-20260918-040237/`.

After the restart, `qingzhou.service`, `qingzhou-sing-box.service` and
`cloudflared.service` were active. Both local and public `/api/health` returned
the deployed version; `127.0.0.1:8081`, `*:8882` and `127.0.0.1:18082` were
listening while retired `:8881` remained absent. Public `/api/config` contained
`brand_icon_data_uri` with the default empty value. The backup snapshot returned
`ok` from `PRAGMA integrity_check`.

The provider tests cover OCI signing (including PKCS#1 and PKCS#8 keys), OCI transfer-unit parsing, Cloudflare Pages/Workers aggregation, provider error handling, encrypted storage, credential masking, and administrator-only routing. Automatic-renewal tests cover default opt-in, line-wide switching, current-price charge/order/ledger creation, insufficient-funds retry and precedence of an already queued manual renewal. The front-end contract tests verify the page, direct refresh endpoint, sidebar order and automatic-renewal control.

## Production deployment record

On 2026-09-15, `qingzhou:kreeper-7e0f784` was loaded on the OCI host and deployed with a service-only `docker compose ... up -d --no-deps qingzhou`. The existing data volume and production environment file were preserved. Container health plus local and public `/api/health` responses verified version `v0.2.80-kreeper-7e0f784`.

The encrypted OCI profile was exercised directly inside the QingZhou container after deployment: OCI Usage API returned a successful official-usage snapshot. The Cloudflare profile remains unconfigured pending a dedicated Account Analytics Read token; do not use a Wrangler OAuth session or DNS/ACME token for this check.

## Local-node cutover record

On 2026-09-15, the production panel was moved from the Docker center-panel deployment to `/opt/qingzhou/qingzhou` under host `systemd`. The database was copied from the stopped Docker volume without changing `QZ_SECRET_KEY`; the native QingZhou inbound and TLS profile were reassigned to `server_id=0`. `qingzhou.service`, `qingzhou-sing-box.service`, and their local health/listener checks passed, with QingZhou listening on `127.0.0.1:8081`, the QingZhou inbound on `:8882`, and the stats API on `127.0.0.1:18082`.

The older EdgeTunnel-backed `sing-box.service` was stopped and archived during the cutover; `:8881` is no longer listening. The stopped Docker container was removed, while its named volume, image, and cutover backup were retained for rollback.

## Automatic-renewal deployment record

On 2026-09-16, source commit `834cd3e` was built for Linux ARM64 and deployed as `/opt/qingzhou/qingzhou`. The active binary SHA-256 is `bddb30404ce34f3aeab90843aaba49cb33f90d36c83ce1e065bb91c5dfbbe538`; the previous binary, database, environment and service definitions are backed up at `/opt/qingzhou/backups/auto-renew-20260916-105144/`. Local and public `/api/health` both reported `v0.2.80-kreeper-auto-renew-834cd3e`; `qingzhou` and `qingzhou-sing-box` were active on `127.0.0.1:8081` and `:8882`. Startup migration confirmed `user_plans.auto_renew` has SQL default `1` and all existing plan rows remained enabled.

## Draggable cards deployment record

On 2026-09-17, source commit `4b65fec` was built for Linux ARM64 and deployed as `/opt/qingzhou/qingzhou` with version `v0.2.80-kreeper-4b65fec`. The active binary SHA-256 is `9b4dfec76b8523db32ce98c4a8a1fb07c6b9afabdcb489c3de559248135f66ff`; the previous binary, database, environment, service definitions and native sing-box configuration are backed up at `/opt/qingzhou/backups/node-order-4b65fec-20260917-133155/`.

Local and public `/api/health` both returned `v0.2.80-kreeper-4b65fec`. `qingzhou.service` and `qingzhou-sing-box.service` were active and enabled, with the panel on `127.0.0.1:8081`, the native inbound on `:8882`, and the stats API on `127.0.0.1:18082`; the retired EdgeTunnel port `:8881` remained closed. No service errors were emitted during startup.

## Remote backup checks

The remote backup implementation is covered locally by:

```bash
go test ./internal/backup ./internal/api ./internal/store
npm --prefix frontend test
npm --prefix frontend run typecheck
npm --prefix frontend run build
git diff --check
```

The focused backend tests cover encrypted secret storage and redacted reads,
cron validation, successful snapshot upload and digest recording, upload
failure, concurrent-run rejection, retention deletion, recovery archive layout,
missing required source rejection and symlink rejection. The frontend source
contract tests cover the R2/S3 form, secret non-readback, schedule controls,
history actions, authenticated deletion, recovery-mode messaging and format
labels.

The deployed binary is `v0.2.80-kreeper-e75381d` with SHA-256
`d7cbee2e6acdc03a8a9f2b36862919ef2beead38a2bf0a1540aac9aad41d3fb1`.
The rollout backup is
`/opt/qingzhou/backups/disaster-recovery-e75381d-20260917-171516/`. The saved
R2 `HeadBucket` test succeeded after normalizing its Endpoint. A real recovery
archive uploaded successfully; an isolated remote download matched its recorded
SHA-256 and manifest entries, and its extracted SQLite snapshot returned `ok`
from `PRAGMA integrity_check`. Local/public health, the two QingZhou services,
Cloudflare Tunnel and expected listeners were healthy; retired `:8881` remained
absent. Administrator-page rendering was not browser-tested because the stored
administrator password was not available to the deployment process and was not
reset.


## 2026-10-12 compact homepage heatmap release

The regression gate covers all 48 unique chronological timestamps per server in
a 16-column by 3-row matrix, X axis “时间”, Y axis “时间分组” with ticks 1–3,
three native status colors plus neutral missing data, and no explanatory copy in
the Canvas toolbar. The Canvas accessible name still explains the chart and
keyboard navigation. The upstream-balance footer's “余额卡片可拖动排序” copy is
removed, while the visible drag handle, accessible drag affordance and sorting
handler remain.

Release `v0.2.97-kreeper-20261012-heatmap-3row` passed 143 frontend tests,
Vue typecheck, Vite build, `go test ./...` and diff check before release; Actions
`38231175720` succeeded. Production verification is recorded in
[project authority](../../agent.md). The authenticated production page showed the
3-row layout, “时间分组” axis, no visual explanatory copy, and retained both
keyboard-accessible balance drag handles.

## BranchedMenu 视觉合同复核（本轮发布前）

- `AdminSettings.vue` 与 canonical 示例均按用户代码核对：首组默认展开，其他组收起；一级/二级行高 36px，子项缩进 40px，活动分支使用 CSS 弧线和延伸线，无 SVG。
- 最新 `5197/#navigation` 浏览器实测：收起“面板与节点”后其分支 `grid-template-rows` 与裁剪层高度均为 `0px`；展开后恢复 `84px`，活动项和主干位置保持稳定。
- `npm test`：180/180；`npm run typecheck`：通过；`npm run build`：通过（仅保留既有 ECharts 大 chunk warning）。skill `audit.mjs`、`verify-assets.mjs`：通过（77 源文件、53 pattern、238 package hashes；28 项独立合同测试通过）。本轮作为发布前验证记录，发布状态以本页新增的最终记录为准。
