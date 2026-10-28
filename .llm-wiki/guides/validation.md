---
title: Validation Guide
updated: 2026-10-29
---

## 生产前端部署验收（2026-10-29）

源码提交 `2103dbce9d373e60150d54153c7ba3cf6eb58eeb` 的 Ionicons 前端已部署到原生 QingZhou 和 Console 的 Kreeproxy MFE。CI `40742462521` 全部通过；原生 `/opt/qingzhou/qingzhou` 与 `/proc` 运行文件 SHA-256 均为 `28f9b173ac7f0155d75f7a753b321fbceb83939a0d3d57bdd518ce37ee370bc2`，版本 `v0.2.80`，健康 `ok`，307 项静态资源逐项匹配。Console 当前 release 为 `console-20261029-qingzhou-design-c`，基于部署前实际指针 `console-20261029-marketing-scrollbar-a` 保留其他应用源；本机9条路由/19项资源、公网健康和79项资源精确哈希通过。

生产匿名浏览器检查覆盖独立 QingZhou 与 Console 桌面/390px页面；Console 390px `scrollWidth===innerWidth`，两页未记录脚本错误，Ionicons SVG实际出现。浏览器截图及机器可读结果位于 `output/design-release-20261029/production-console-desktop.png`、`production-console-mobile.png`、`production-native-desktop.png`、`public-browser.json` 与 `public-verification.json`。真实账号登录、业务写入、物理触摸和所有受保护页面仍是未测边界。

## 替代图标候选核验

隔离候选 `output/design-release-20261029/ionicons-candidate/` 使用原有MIT Ionicons的47个语义映射、46组真实轮廓/实心配对，用户确认后已应用到工作区，SF图形数据和专属组件已移除。候选238项测试、standalone和MFE类型/构建/产物检查通过；实际编译浏览器31条路由×8宽度共248个样本无根文档/body横溢出，8组交互保持真实选中/展开切换、悬停只变色、圆点复选框/复制/日期/确认/触摸及低动态行为。合成Host的6个MFE样本通过作用域、菜单和卸载检查，无错误记录。预期匿名与拒绝登录401按夹具记录，不将其当作脚本异常。

候选与本地SF版的截图、导出来源、完整日志及方案说明集中于 `output/design-release-20261029/`。用户已确认图标替代；产物检查与实际上线回执分开记录。生产只读核对、发布门槛及授权边界归[Deployment](deployment.md#图标发布门槛)和[项目权威](../../agent.md#前端设计系统发布2026-10-29已部署)。

## 设计系统前端核对（2026-10-29）

当前本地前端通过 `npm test` 的238项测试，以及包含 `vue-tsc` 的standalone和MFE构建、MFE产物校验。构建保留现有ECharts大chunk提示，不以构建成功替代视觉检查。实现责任及来源见[设计模块](../modules/kreeper-first-design-system.md#当前前端接入合同)，本地/生产边界见[项目权威](../../agent.md#前端设计系统核对2026-10-29本地)。

浏览器使用实际编译产物、合成管理员/匿名API数据，不连接业务后端。31条路由在1920、1440、1280、1167、1024、768、390、360px下共248个稳定样本，根文档与body均无横向溢出。认证路由每次从空白页重新加载以核验真实匿名表单。8组交互覆盖：完整侧栏与264/72px收放、默认/强调按钮状态、复制栏接缝和圆点复选框含半选/按压、六点排序柄与原生确认框、日期取消、表单错误持续显示、模拟coarse pointer的44px命中与300px Drawer、模拟低动态终态。MFE在合成Host中覆盖订阅、用户和设置3条路由×1167/390px，6个样本通过作用域隔离、顶栏SVG、菜单发布及卸载清理检查。

路由矩阵的3条401控制台记录来自匿名 `/api/auth/me`；交互检查的2条401来自匿名身份和故意拒绝的登录夹具。这些是预期HTTP响应，不能写成控制台零消息；无其他脚本异常。MFE浏览器无错误记录。比较基线为当前HEAD的独立只读导出，4条代表路由×1440/390px共8个样本，前后均等待加载和有限入场动画完成。

可复查脚本、JSON结果、截图及构建日志位于项目 `output/design-review-20261029/`，人工入口为同目录 `review.md`。宽表保留自身横滚与完整列。上述结果不覆盖真实账号业务写入、物理触摸、操作系统动态设置或生产视觉验收；没有后端、依赖版本、数据库、产品版本或部署变化，也未将技能来源快照宣称为本轮零漂移审计。

## Native feedback design sync 2026-10-22

`frontend/tests/feedback-provider.test.mjs` runs compiled Vue setup with real Vue injection/reactivity and a minimal renderer. Six focused tests cover native delegation/default primary/explicit overrides, absent-provider behavior, embedded teleport and non-centered stack, timer hover pause and leave retirement, notification content/actions/close veto/lifecycle, destroyAll isolation and the optional animation contract. The full frontend suite is 238/238 passing; fresh logs supersede the earlier session-only reports.

`npm run typecheck`, `npm run build` and `npm run build:microfrontend` pass. The versioned MFE uses `/releases/console-20261022-design-sync-a/apps/kreeproxy/microfrontend/` and is located at `/Users/hinaw/console-kreeper/output/design-sync-20261022/qz-microfrontend`; its 99-file manifest is `qz-microfrontend-files.json` (SHA-256 `b90ca1f63c728f16fdb9c60fe826cffe634b3d3f9850f22f73fdcfeae824451b`). Standalone has 135 files and manifest SHA-256 `0c92ea19d5b7374598fb454e27926c76e27ab429f12cb2dc791f4f26a062088c`. Logs, commands and hashes are in the same absolute output directory under `qz-validation-result.json`.

The native candidate exports backend commit `b48cb4a2e70058ff881b4c000dc9a4014d76dda6` with `git archive`, ignores document symlinks, and replaces only `frontend/dist`. Non-dist export SHA-256 remains `9b3dab7a538653ffe6b779f21869d7d3c880f9d123f0a273dcae92e0166f2df1`; archived baseline Go tests/vet pass. Linux ARM64, CGO=0 and product version `v0.2.80` are verified through Go build metadata; all 292 retained native assets are verified in the candidate. Candidate SHA-256 is `24f6e1b700927ef19232900d1644f2bf7c4aefb7b45ac73244137191f9e0cd8e` at `/Users/hinaw/console-kreeper/output/design-sync-20261022/qz-native-20261021T164802Z/qingzhou-linux-arm64`.

Browser evidence is maintained separately in `qz-browser-result.json` by `qz-browser-check.mjs`: compiled standalone and versioned MFE, desktop/mobile, actual Naive injections and synthetic anonymous API fixtures. Production auth/business writes are not exercised, and this does not claim an authenticated production visual review. Native activation completed after candidate preparation; installed and running binary digests, service health, retained assets, protected state and the database backup integrity are recorded in `/Users/hinaw/console-kreeper/output/design-sync-20261022/qz-activation.json` and [project authority](../../agent.md). Source publication alone is not activation evidence.

## 首页进入控制台与订阅页窄屏本地验收（2026-10-17）

- 5211 使用当前 Vite build 的只读 fixture：首页到控制台慢响应采到 227 个 DotMatrix 显示帧，顶栏/侧栏可见帧均为 0；加载器移除到 overlay 接管有 1 个采样帧，根壳 `fullShellTransitionPending` 仍生效、导航可见帧为 0。嵌套布局挂载期间跳过由父级整壳转换接管的初始 route key。控制台内部 `/sub` 到 `/shop` 延迟请求实测 150 个加载帧，顶栏与侧栏 150 帧始终可见。真实生产站点未写入/未部署。
- 394×816 下 `documentElement.scrollWidth === innerWidth === 394`；桌面表格 `display:none`、移动卡片 `display:grid`，两个节点卡片右缘均为 366px，长节点名和完整线路/延迟/状态/操作均在卡片内。自动续订方框与 label 中心 Y 均为 809.8px。状态牌 computed radius 为 6px、font-size 为 13px、实际高度约 24px。
- 打开本地订阅计划后，`#shop-package-1 .sc-queue-note` 是 `InfoNotice` 的 `div[role=status]`，无成功勾；非 GET fixture 操作仅本地模拟。页面未产生横向溢出。
- 门禁：青舟前端 `220/220` 测试、typecheck/build；canonical `46/46` contracts、独立 typecheck/build、coverage audit `101/55/263` 均通过。构建保留已有 ECharts 大 chunk 与 React `use client` bundler 提示。
- 已提交青舟 `81cf535d330f094e617504a606b52a7c95595b22` 与 canonical `3f66efab0dcd15fcfcae55b27339bc2e83f1c342`；Release [v0.2.121-kreeper-20261017-console-subscription-ui](https://github.com/hanyunsushi/qing-zhou/releases/tag/v0.2.121-kreeper-20261017-console-subscription-ui)，CI `39044777099` 和 Release `39044777727` 均成功。
- 已部署，Release ARM64/安装/proc 二进制 SHA-256 为 `cbfa96c1b9e70ba3f286822b14ef0d6770d87adc262a34ea4dfd146b10bbf9e2`。在线 SQLite Backup API 回滚快照 integrity_check=ok；本机/公网 health 新版本一致，首页 HTTP 200，三个服务 active/NRestarts=0，节点/Tunnel PID、端口和配置哈希未变，启动 error journal 为空。9 个核心 JS/CSS 与精确本地构建匹配。Release 未签名，因为签名未配置。
- 无 API/数据库迁移或节点/订阅业务改动。完整部署与回滚位置见[项目权威](../../agent.md)。

## 危险按钮语义校正（2026-10-17）

- UserSub 凭据重置保持 disabled=!credsResetEnabled、真实 loading 与原确认/请求，仅将按钮映射到 type=primary + highlight-arc-button；订阅节点的批量启停统一采用高亮弧边。API Token 吊销语义不可逆，使用 type=error + quaternary + delete-button 红字透明删除外观。真正删除按钮不变。
- 设计系统规范明确不设独立红色警告按钮：非删除风险动作使用高亮弧边，删除/不可逆吊销使用删除外观。Controls 示范增加禁用高亮弧边，展示禁用仍继承所属类别语义。
- QingZhou 前端 221/221 测试通过，vue-tsc/Vite 生产构建通过；canonical 契约 47/47、独立 typecheck/build 通过，audit 101 source / 55 patterns / 263 hashes 通过。
- 本地 5191 浏览器 1280×720 截图中，普通/强调/弧边/高亮/删除/禁用样例无重叠。禁用高亮的 computed style 为 disabled=true、opacity 0.5、白字/Apple 蓝底、18px 圆角、32px 高、transform none；AX 同样标记 disabled。覆盖导航已显示“默认弧边、高亮弧边、删除、禁用”，不再列警告按钮。
- 仅生产构建的既有 Framer Motion use-client 与大 chunk 警告，以及前端测试中的本地 HMR 24678 端口占用诊断；均未导致门禁失败。5191 控制台唯一 error 是现存 favicon.ico 404，与本次按钮无关。
- 已纳入 v0.2.121 并部署。生产运行态与资源校验见上方发布验收；按钮权限、禁用、确认与业务回调不变。

## v0.2.120分页裁切发布验收

青舟`99a3c9f8cab0673519c484006fa49ae2675342d8`、canonical`83c9ccf72150979cde60f053e2a5b67eb41df880`已推送main；[v0.2.120-kreeper-20261017-pagination-clip](https://github.com/hanyunsushi/qing-zhou/releases/tag/v0.2.120-kreeper-20261017-pagination-clip)与CI39024651689/Release39024653950成功。214前端/46复用契约、三套类型检查/Vite、Go CI race、101源/55pattern/262hash与Wiki16页通过。没有后端/API/数据库变更，v0.2.119的CPU/内存规则保持。

SQLite在线快照/运行库integrity_check=ok，ARM64Release/安装/proc摘要一致；本机/公网health一致，三服务active/NRestarts0、节点/Tunnel PID/配置哈希、四端口与启动error journal0通过。摘要/回滚点归[权威](../../agent.md)。公网/admin资源引用及6项相关JS/CSS与精确源码独立构建匹配。生产浏览器：生产账户页1280×720同一分页按钮，部署前右下三个采样点均命中n-card-content；部署后同位置三点全部命中禁用下一页按钮自身。根overflow visible、内部wrapper overflow hidden/radius18，加载index-8IpwDQcW.css，console error为空；只读检查未操作业务。1167/394/360px示范首末页及启用/禁用角点另在本地验证。 本地首末页/手机角点与截图见[裁切复现](#分页角落裁切2026-10-17)。

## v0.2.119完整发布验收

青舟`ccbbf1a62fdb05ca6a1143b9071df53fd4ad1979`、canonical`09f54b3e2378c9c9608329f7c9dfc1b7c7df280a`均已推送main；[v0.2.119-kreeper-20261017-table-heatmap](https://github.com/hanyunsushi/qing-zhou/releases/tag/v0.2.119-kreeper-20261017-table-heatmap)及CI39023621437/Release39023623887成功。214前端/46复用契约、三套类型检查/Vite、Go全量tests/vet和CI race、101源/55pattern/262hash与Wiki16页通过。按用户要求纳入全部青舟本地改动，含CPU/内存后端、维护文档及.claude预览配置；未执行缓存清理。

在线SQLite Backup API快照/运行库integrity_check=ok，ARM64Release/安装/proc摘要相同；面板原子替换后本机/公网health一致，三服务active/NRestarts0，节点/Tunnel PID与受保护配置哈希不变，四端口及启动error journal0通过。精确摘要/回滚点归[权威](../../agent.md)。公网/admin资源引用及6项相关JS/CSS与精确提交独立构建匹配。

公开热力图1h/6h/24h/7d四范围共188个已完成历史桶与运行库只读CPU/内存重算结果逐项一致，97个桶相对旧磁盘分类变化；最后实时桶排除，避免HTTP/SQL采样期间新指标产生假差异。双接口/四范围/11阈值用例由Go回归覆盖，生产抽样不冒称穷尽所有服务器条件。浏览器：生产订阅页加载index-BAOFWNi-.css，15个Checkbox已渲染，未选样本计算为中性1px rgb(213,219,219)、4px角、shadow none，选中样本保持蓝底勾选；console error为空。未点击或修改自动续订等业务值。项目CSS和示范资产逐字节匹配，1167/394/360px本地表格查看、内部横滚与Checkbox点击/hover/focus终态均通过。 示范表格完整列与手机横滚证据见[本地验收](#表格完整显示与复选框边线2026-10-17)。

## v0.2.118表单选择与分页发布验收

青舟`caa7615c9e61a5e2cfda10ac3fea2673e4d1196b`、canonical`916d8cc5c3dbeb07100564c9c3c63380c2170806`已推送main；[v0.2.118-kreeper-20261017-form-controls](https://github.com/hanyunsushi/qing-zhou/releases/tag/v0.2.118-kreeper-20261017-form-controls)及CI39022255878/Release39022258456成功。214前端/46复用契约、三套类型检查/Vite、Go CI race、101源/55pattern/262hash与Wiki16页通过。部署只包含已提交UI及其许可，单独的CPU/内存后端仍为本地未提交状态。

SQLite在线一致性快照/运行库完整性ok；ARM64Release、安装/proc摘要一致，面板原子替换后本机/公网health一致；三服务active/NRestarts0，节点/Tunnel PID、配置哈希、8081/8882/18082/19000及启动error journal0通过。精确摘要/回滚点见[权威](../../agent.md)。公网/admin资源引用及6项相关JS/CSS与精确提交的独立构建匹配。浏览器：生产新资源index-BR38n723.css已加载；未保存的新增TLS抽屉只读核对普通Radio16px/8px圆形、选中Apple蓝/白点且组透明无边框，随后Esc关闭。订阅页15个复选框计算4px角、边线shadow none，未切换业务值；账户页3个分页控件8px角，活动页蓝底白字，两侧禁用状态保留。生产console error为空，未保存/提交表单。 本地交互范围见[本项验收](#表单选择与分页2026-10-17)，不将本地测试冒称全部生产表单验收。

## 负载矩阵仅 CPU/内存（2026-10-17）

`TestHeatmapLoadUsesOnlyCPUAndMemory` 在改动前复现磁盘 70%/90%/100% 导致错误升级；改动后 11 组场景 × 公开/管理员两接口 × 1h/6h/24h/7d 四范围（88 次接口响应）通过。验证 CPU/内存 70%/90% 边界、低于临界值、满盘不升级、缺少内存总量、桶内安静新样本不覆盖最严重分类和无样本桶保留 3。

专项 `go test ./internal/api -run 'TestHeatmap|TestMonitorOverviewDeduplicatesEnabledLoopbackAsset' -count=1`、全量 `go test ./...`、`go vet ./...` 及 `git diff --check` 通过。前端源码、图表状态/颜色与数据库结构未改；没有执行前端视觉验收或生产部署。新分类查询原始历史指标，部署后历史桶自动按同口径重算；生产生效边界由[项目权威](../../agent.md)维护。

## v0.2.117点阵发布验收

- 青舟`48c4f84953e0079640bc352b09ed6deb623d2ab9`、canonical`5a0098c137bb3c6476537284c54aa193de334644`已推送，[v0.2.117-kreeper-20261017-dot-matrix-origin](https://github.com/hanyunsushi/qing-zhou/releases/tag/v0.2.117-kreeper-20261017-dot-matrix-origin)及CI39006294082/Release39006296823成功；214前端/46canonical、类型检查/构建、示范构建、Go CI race与audit101/55/259通过。三处loading.css逐字相同，业务/定位/字体/AWS不变，沿用加载反馈分类。
- 原子替换宿主面板前保存在线SQLite一致性快照，快照/运行库完整性ok；Release/安装/proc摘要相同，本机/公网health为v0.2.117。三服务active/NRestarts0，节点/Tunnel PID与配置哈希保持，四监听和启动error journal0行通过。精确摘要/回滚点由[权威](../../agent.md)维护。
- 公网/admin入口引用与6项index/Monitor/DashboardLayout相关JS/CSS匹配精确源码构建；公共入口CSS包含原点radial-gradient和低动态currentColor背景。只核对HTML引用，不以Cloudflare附加脚本推断源码漂移。
- 生产浏览器：生产加载当前index-CfPeV3em.css，CSSOM解析出共享原点radial-gradient规则；由控制台原生键盘选择监控管理，在真实路由等待期观察到20px全局DotMatrix，diagonal-0=.203895、背景半径1.68351px/透明度.203895，证明生产实际加载节点已采用修复。本次只读导航，未修改数据。 无console error，未操作业务写入。逐相位像素与连续动画来自[本地实际组件对照](#dotmatrix左上角绘制2026-10-17)，不以生产短暂加载状态冒称已采完整循环。对照动图output/dot-matrix-origin-fix.gif；临时本地验收标签关闭并恢复视口。

## DotMatrix左上角绘制2026-10-17

- 同一浏览器把修复前/后CSS放在8个固定相位0/.125/.25/.375/.5/.625/.75/.875秒对照。原左上角8次采样RGB均≥254，接近白底；修复后由约(201,228,255)过渡至(5,123,246)再变暗。64px放大/20px蓝色/16px继承白色的24种相位与尺寸组合，共216个圆心像素全部有实际绘制。
- 实际DotMatrix组件采257帧，diagonal-0范围.2→1、210个不同数值，径向背景随相位连续改变半径/透明度；实际NSpin20px与NButton行内16px均使用修复背景。低动态CSS分支在隔离fixture强制启用后使用currentColor实心原点及1.4s呼吸，并未声称修改/测试操作系统设置。
- 394×816实际独立/Naive加载器尺寸20/20/16px、无横向溢出。5191运行示范重启并刷新，反馈区真实NSpin的::before为动画径向背景，未用旧缓存当作新实现。截图output/dot-matrix-origin-fix.png、dot-matrix-394.png和dot-matrix-showcase-fixed.png。
- 214项前端测试、vue-tsc/Vite、46项canonical及独立类型检查/构建、示范构建通过。青舟/CSS资产/源快照/5191逐字一致，audit101源/55patterns/259hashes通过。沿用加载反馈分类，无业务请求/路由/定位/字体/AWS变化；上线与运行态另按发布记录验收。

## v0.2.116实际侧栏发布与生产验收

- 青舟`a0772d7e2b7fb219e43bfff5a9c740b13b0db1e2`和canonical`50a5df747d029a18f3d689ca38b6ae70b741c914`均推送；[v0.2.116-kreeper-20261017-sidebar-sync](https://github.com/hanyunsushi/qing-zhou/releases/tag/v0.2.116-kreeper-20261017-sidebar-sync)与CI39001783028/Release39001785424成功。214前端/46canonical、两套类型检查/构建、Go tests/vet、CI race、101源/55patterns/259hashes通过，4份动画运行资产三处字节一致。
- 原子部署只更新宿主面板，Release/安装/proc摘要一致；本机/公网health均v0.2.116，在线SQLite快照及运行库完整性ok，三服务active/NRestarts0，节点/Tunnel进程及保护配置保持，四监听和启动无error日志通过。精确摘要/回滚点由[权威](../../agent.md)维护。
- 公网/admin入口引用当前资源；6项index/Monitor/DashboardLayout相关JS/CSS与本地精确源码构建逐字节一致，实际DashboardLayout chunk包含桥接及原Motion。HTML仅核验引用，不把Cloudflare附加检测脚本计为源码漂移。
- 生产浏览器：生产1167×816实际侧栏存在React Motion根，264/72px收放和图标中心35.5px正确；图标打开指定分组、子菜单开合/退出无残留且filter=none；筛选显示匹配父级、无结果在原结果区；滚动后共享hover与目标行差0px、路由进入/admin/monitor并正确选中，无多项目层或横向溢出。394×816手机Drawer300px/直角、nav无滚动条/gutter:auto，同源动效根；筛选控制台并选择后回/dashboard且抽屉关闭。 无新的console error；只读菜单操作/导航，无保存、购买、退款或安装。截图output/sidebar-production-116-desktop.png及output/sidebar-production-116-mobile.png。本地原生操作逐帧数据与手机/普通角色边界见[实际侧栏接入](#青舟实际侧栏接入2026-10-17)；不把本地插值帧扩大为未知原附件环境逐帧完全相同。
- 沿用侧边栏/组件绘制动画分类，没有新增类型、字体或AWS规则变更；页面内部二级BranchedMenu保留、青舟无多项目最高层。来源及React/Motion运行许可保留。Wiki16页链接/孤立页/权威软链和diff检查通过；生产验证标签结束后关闭并恢复视口；本地采样fixture标签在结束后崩溃为data URL，清理被浏览器URL策略拦截，采样脚本已移除并停止本地服务。

## 青舟实际侧栏接入2026-10-17

- 实际DashboardLayout只读fixture直接挂载生产组件与菜单/路由处理，未重造侧栏；桌面1167px、手机394px覆盖整栏折叠、从图标展开指定组、筛选自动展示父级/无结果、管理员/普通用户权限、叶子跳转与帮助回调、手机选后关闭Drawer。
- 原生操作rAF记录整栏宽72↔264的中间值、94帧文字插值和28帧子项opacity/y/blur插值；子菜单终态filter=none，无退出子树残留。实际nav滚动402px后共享hover与目标行顶部差0px，文字位于命中堆栈顶层；不存在额外最高项目层，横向溢出0。
- 手机Drawer宽300px、圆角0，nav scrollbar-width:none/gutter:auto；普通用户无管理员入口，帮助选择后路由/help且Drawer退出完成。未调用生产写入API。
- 前端214项、canonical46项、两套类型检查/构建、Go tests/vet通过；来源函数AST/variants契约仍保持，4份桥接/动画/CSS资产与canonical及5191相同。审计101源/55patterns/259hashes：source总数改为按实际条目计算，并新增tsx覆盖/计数一致性门禁；既有80数字为旧计数，不代表本轮新增21个业务文件。
- 本地验收已纳入v0.2.116，运行态范围由上方发布验收维护。

## v0.2.115发布与生产验收

- 青舟`af9b00b92df2f9a5b8bfc5c5c09281f847ca1a58`、canonical`dc7b0e5e273204f32ff5b86a46f3c89086b8f048`均已推送，Release[v0.2.115-kreeper-20261017-navigation-contracts](https://github.com/hanyunsushi/qing-zhou/releases/tag/v0.2.115-kreeper-20261017-navigation-contracts)与CI39000120903/Release39000123367成功。211前端/46canonical、两套类型检查/构建、Go tests/vet、CI race和80/54/253审计通过。
- 原生面板原子部署：Release/安装/proc摘要一致，本机/公网health均为v0.2.115。数据库在线一致性快照和运行库完整性ok；三服务active/NRestarts0，节点/Tunnel PID及受保护配置哈希未变，四监听保持，启动error journal0行。运行时精确SHA/回滚位置归项目权威，不在此重复。
- 公网/admin入口200且引用当前入口资源；6项index/Monitor/DashboardLayout相关JS/CSS与本地构建逐字节一致。只核验HTML资源引用，不把Cloudflare追加检测脚本当作源码漂移。
- 生产浏览器验收：820×1180公共三入口均32px SVG、文字/用户名/箭头隐藏、图标中心误差0；同尺寸控制台“管理”无SVG保留13px文字/66px宽、账户只显示32px SVG。360×800控制台两类入口仍并存、无横向溢出，管理Enter展开/Esc关闭。 截图output/playwright/release115-public-portrait.jpg和release115-dashboard-portrait.jpg。只读导航/展开菜单，没有购买、保存、退款、安装等业务写入。指针仍fine，44px coarse命中只属源码证据。
- canonical/源码/源快照/pattern/5191运行副本、分类注释、规范和Wiki同步；多项目/React侧栏为复用包和示范能力，青舟生产未接入，不用上线结论扩大该边界。临时验证标签关闭、视口复原，Wiki16页链接/孤立页/权威软链及diff-check通过。

## 顶栏按内容显示（2026-10-17）

用户明确这是通用响应规则：有功能SVG才收敛为图标，纯文字保留文字。公共与控制台header-right共用实际:has(svg)判定；移除PublicHeader/AppHeader的局部强制入口规则，不为纯文字入口增加SVG。DashboardLayout/Shell管理入口取消手机隐藏但保留管理员权限，账户补aria-label/title。下拉方向箭头由CSS绘制，不算功能SVG，保持文字按钮原交互。

5191实际Shell在820×1180同一顶栏：管理无SVG、13px文字可见、宽66px；账户有SVG、文字display:none/content字号0、宽32px，根横向溢出0。360×800仍同时显示管理文字和账户图标，管理Enter打开菜单/Esc关闭；未因收窄删除纯文字入口。截图output/playwright/topbar-content-rule-portrait.jpg。公共#public在360px匿名“登录”无SVG、字号13px可见；切到已登录，三入口实际含SVG，均32px、文字/姓名/箭头隐藏，溢出0；恢复横屏后原文字显示。

源码、canonical复用、源快照/pattern/中文语义注释、规范/coverage和5191运行副本同步，无新类别、字体或AWS规则变更。指针仍fine，coarse44px只作源码验证。项目与canonical检查、审计和Wiki lint结果由同步状态维护；未提交部署。前项按公共已登录入口枚举的规则被本内容判定合同取代。

## 公共顶栏竖屏图标入口（2026-10-17）

AppHeader和canonical PublicHeader将控制台/管理文字包装为topbar-action-label，并补齐三个入口aria-label/title。orientation:portrait或max-width768px隐藏文字、账户名和箭头；空Naive content不占位，图标/账户内容间距归零。fine32px方形、coarse44px方形命中。权限、导航回调和菜单状态不改。样式与语义注释/规范/源快照/pattern/5191同步，无新类别或AWS颜色/排版变化。

实际业务AppHeader以原Vue组件、真实Naive/全局CSS/TopbarHoverMenu/路由运行，本地fixture仅提供确定的已登录store，不连接生产或业务API。1280×720横屏三入口文字可见。820×1180竖屏三按钮32×32、文字/姓名/箭头全display:none，SVG中心偏差x/y均0，根横向溢出0；管理Enter可打开原菜单，Esc关闭，控制台点击后路由变/dashboard。360×800仍三SVG方形/无横向溢出。截图output/playwright/public-header-portrait-820.jpg、public-header-mobile-360.jpg。指针仍fine，44px触摸媒体仅源码确认，不声称真机触摸测量。

5191#public切到已登录状态，820×1180同为三SVG/文字隐藏/32px方形/无溢出，恢复横屏后文字恢复；截图output/playwright/public-demo-portrait-820.jpg。业务构建含类型检查、canonical46/46契约与独立类型检查/构建通过。生产未部署，本地fixture与临时浏览器验证页验收后清理；运行状态及文档/快照检查见当前同步状态。

## 项目首字笔画裁切（2026-10-17）

1167×816实际测量：SVG范围x33–51，图标位x26–54，文字框x64–212；首字区域elementsFromPoint最上层是STRONG，其下为copy和按钮，没有SVG覆盖。放大实际截图确认首字左侧笔画被裁切；撤去文字区/strong/small的紧贴overflow:hidden，改为overflow:clip加4px overflow-clip-margin后，“设/基/页/认”的左侧笔画恢复。原文字框和SVG仍保持13px净间距；48px行、36px文字区、字号/行高、单行省略及两套Motion动效不改。只测Range/排版框未能发现这一字形绘制问题，前项“未越界”证据不应当作首字完整的证明。

修正前后同范围原始截图output/playwright/project-glyph-{before,after}.jpg；无font/transform补偿、无修改SVG位置。canonical样式、规范、分类注释、coverage、5191运行副本与项目权威/Wiki同步，沿用多项目路由导航类别；无新类型或AWS规则变化，未提交部署。当前检查结果由同步状态维护。

## 整栏文字错峰与项目文字边界回归（2026-10-17）

上一轮给项目内label显式animate，绕过了原RAIL_STAGGER_VARIANTS共同父级，导致整栏展开的30ms错峰丢失。RailVariantScope现在捕获该父级的公开MotionContext，仅对项目内动作label用Provider回接；无新motion祖先、无逐项delay或自控animate，原RAIL_LABEL_VARIANTS与源码父级负责调度。项目行的SUBMENU variants保持独立，披露时label initial=false且不横移。项目行仍48px，内距6px10px；文字限高36px网格，14/20标题与11/16副标题、min-width0/单行省略，保留完整汉字行盒。

1167×816“页面示范”5项：整栏展开108帧，文字先后出现且存在不同x/opacity中间态，约102ms首三项x=-13.12/-16.02/-19.15、后两项x=-20；整行上移/模糊/淡入采样0帧。终值x0/opacity1，收起终值x=-20/opacity0；标题文字在整栏展开108帧中越过按钮上下边界0帧。独立项目展开133帧，整行初始y=-6/blur3/opacity0，前五项非零采样47/89/140/181/231ms，文字横移0帧，终态filter none。项目关闭132帧后子树卸载。采样不充当精确计时，动画参数由原源码直接调度。证据output/playwright/project-{rail,disclosure}-context-{open,close}.json。

桌面文字区148×36px、标题20px/说明16px，文字没有横向溢出；394×816和360×800手机文字区184×36px、Drawer300px、根横向溢出0。viewport仍fine指针，不声称真机触摸验证。截图output/playwright/project-copy-context-mobile-360.png与project-copy-context-desktop.png。

46/46canonical契约、独立类型检查和Vite构建通过，新增回归检查验证label接回原祖先/没有显式animate/单项目继承保持。设计系统规范、分类注释、coverage/运行5191副本与项目权威/Wiki同步；无新分类或AWS token变更，字幕行高为该项目行的本地几何修正。实际QingZhou业务导航未改，未提交部署。临时采样清理及审计结果由当前同步状态维护。

## 项目披露与整栏折叠分离（2026-10-17）

整栏收起只保留精确的project:<key>展开key，清空其内原导航可展开组与隐藏筛选。项目body不再受整栏collapsed门禁/CSS隐藏；项目图标可在72px轨道独立开合，普通深层组仍先展开整栏再打开。最高层披露的动作行复用原SUBMENU_ITEM_VARIANTS及入场filter释放；文字initial=false、单独响应整栏状态，避免由项目open/closed触发整栏横移。原单项目树与路由不变。

1167×816实际浏览器：展开图表子菜单后收起整栏，侧栏72px、设计系统项目保持expanded=true、15个原导航图标显示，行40px/x15.5px，深层菜单0；在窄轨道打开页面示范后两项目同时展开、宽度仍72px。关闭页面示范后点击图表组，侧栏264px并显示原子项；收回再展开后两项目各自状态保留，深层菜单仍0。单项目模式0项目行/4原分组/15导航入口，收起仍72px且无深层菜单。

逐帧采样：展开121帧，整行初值y=-6/blur3/opacity0；前六项首次非零采样为47/102/139/189/231/272ms，跨静态分组持续错峰，文字横移采样0帧。终值opacity1/transform none/filter none。收回120帧，popLayout原位absolute退出、反向逐项淡出/模糊并卸载；记录output/playwright/project-tier-motion-{open,close}.json。采样为实际运行证据，不把帧采样误称精确计时或所有动画的完整来源一致性证明。

394×816手机独立关闭设计系统、打开页面示范保持Drawer；项目行48px、抽屉300px/0圆角、scrollbar none，根横向溢出0。360×800仍300px抽屉/隐藏滚动条/溢出0，截图output/playwright/project-tier-mobile-360.png。手机指针仍fine，仅声明viewport/键盘验证，不声称真机触摸验收。最终桌面截图output/playwright/project-tier-collapsed.png。

规范、中文分类注释、canonical组件/示范/coverage与运行5191副本同步；沿用“多项目路由导航 / 侧边栏 / 组件绘制动画”，无新类型、字体或AWS规则变动。实际QingZhou DashboardLayout/router/BranchedMenu未改，本项未提交或部署。45/45canonical契约、独立类型检查/Vite构建通过；设计系统审计80源/54pattern/253哈希通过。Wiki16页无断链/孤立页，权威软链有效，diff --check通过；临时采样代码已移除，最终运行warn/error为空。

## 项目最高层折叠分组（2026-10-17）

用户要求把最高层变为各自菜单的折叠父级。原独立卡片切换区/字母Logo/蓝底/侧标撤掉，每个项目各自包含options，48px行、18px描边SVG/28px图标位、16px原Motion箭头与中性共享hover/active面。项目披露彼此独立、只显示所属菜单，项目内key按父项目隔离，叶子发送原route key。项目头只更新上下文/开合，手机不关Drawer；叶子关闭。单项目无任何最高层。

1167×816浏览器测量项目父行/按钮均232×48px，收回后相邻两行y138/188、无重叠；图标轨道40×40、图标中心x35.5px，箭头不占位。项目body入场clip/opacity有中间帧，收回保留absolute原位退出、下方项目行连续spring回位，证据output/playwright/project-accordion-{open,close}.json。方向键独立开合、双项目同开、筛选未打开项目并清空恢复、单项目0最高层/4原分组均核对。394×816与360×800手机项目行48px、Drawer300px/0圆角/scrollbar none/横向溢出0；开项目保持抽屉、选叶子关闭。运行warn/error为空。

43/43契约通过，包括跨项目相同route key的内部namespace/原路由保留，以及项目结构/几何/独立菜单/生命周期边界；独立Vue/TSX类型检查/构建通过，原use-client和大chunk非阻塞提示保留。规范/注释/5191与权威/Wiki同步，无新视觉分类、字体/AWS颜色/排版变动。无提交/发布/部署，实际青舟单项目业务入口未接入。

## 侧栏动画完整源码复核（2026-10-17）

子菜单闪烁修正：原open终态blur(0px)仍创建行级层叠上下文，跨行共享背景会覆盖相邻行文字。保留源variant对象，以局部SUBMENU_SHARED_ITEM_VARIANTS追加transitionEnd.filter=none；不改入场/退出时序或取消退出blur3。重复子项切换采集282帧，子项filter全部none、opacity最小1，243帧共享背景仍有运动；收回模糊正常、退出后节点归零。证据output/playwright/submenu-flicker-{before,after}.json；源码契约增加保留原对象/仅释放终态滤镜的断言。

用户补充指出子菜单缺少动效：定位为nested分支仍使用静态hover/active面，仅有展开/退出。子树现在独立复用原SharedLayoutBg，选中投影ID按父路径隔离；源码函数保持，原45ms入场/25ms反向退出不变。实际浏览器证据output/playwright/submenu-{open,close,hover-selection}.json：33px子项间悬浮位移由-29.216→-12.0275→-3.31983→0，选中面由-32.9155→-16.2779→-4.63064→0；父面仍在父入口。入场y-6/opacity0/blur3依次恢复，退出层x28/y518保持，最终移除。394×816手机两个子项可见、0横向溢出、nav scrollbar none。42/42canonical与类型检查/构建通过，规范/注释/示范同步；未提交或部署。

本轮实际发现：Motion Vue适配缺少兄弟布局联动，展开后的相邻菜单第一帧直接跳到终点；额外group动画控制改变传播层级，源SharedLayoutBg的入口/子树包装拆开；旧CSS还覆盖箭头及popLayout定位。长导航的滚动偏移未进入投影，导致收回时上方入口和退出层错移。旧版“variants相同/局部片段出现中间帧”不能作为效果一致的验收。

已改为Vue桥接直接执行来源React Motion；SharedLayoutBg源函数AST与完整fixture核对，仅补项目CSS包装class。单一父级错峰、整项子variants/popLayout、原弹簧箭头和直接motion.li孩子保留。真实nav由layoutScroll测量，关闭overflow-anchor，静态定位规则只作用于非退出子树，退出保留padding并撤重复margin。

本地真实浏览器对照运行完整第一份组件/示范和完整第二份SessionNavBar（Next/UI宿主依赖为无动画占位），不是缩写几行动画。1167×816记录：悬浮面在34px行距内连续共享投影；子树展开/收回时相邻行执行67px原弹簧，收回期间退出层x28/y516保持不变、下方行67→34.45→9.86→2.31→0.53→0连续回位。200ms rail收放至264/72，原标签按序x/opacity联动；两来源依赖版本未知、端点/控制方式按项目保留，不声称整组件逐帧完全相同。桌面帧证据位于output/playwright/sidebar-final-{open,close,hover,rail}.json，来源对照为sidebar-full-original-*.json。394×816与360×800抽屉为300px、0圆角、scrollbar none、无横向溢出；手机子菜单可开合。

42/42 canonical契约、独立Vue/TSX类型检查/Vite构建，211/211青舟前端与类型检查/构建通过。React use-client指令被Vite忽略及既有大chunk提示不阻塞构建。分类注释、source-reference依赖快照、来源许可、侧栏/动效/复用/示范/coverage及项目文档同步。没有生产运行态检查、提交或部署；青舟业务入口不接入本扩展。

## 多项目路由导航（2026-10-16）

- 只修改canonical复用Shell/Gallery及规范/契约/覆盖，不把项目层接到青舟DashboardLayout。项目源码快照80项仍逐字一致；0/1项目guard、受控选择、当前项目不重复触发、失效key显示回退、手机关闭抽屉及桌面折叠边界加入契约。
- 39/39设计契约、独立vue-tsc/Vite build通过；QingZhou前端211/211通过。80源/54pattern/247包哈希审计通过；现有大chunk警告保留。字体/数字/AWS色板未改变，本轮不声称重新验证外部AWS规范。
- 1167×816实际浏览器：两个项目行48px；切换到页面示范仅显示其“页面示范/接入指南”菜单，顶栏/内容落点一起变化。搜索无结果替换原菜单结果轨道而保留项目入口；切换回设计系统清空搜索并恢复基础/交互/数据等分组。单项目模式项目层DOM数0，原筛选top84px及侧栏264px保持。
- 折叠后侧栏72px、两个项目按钮40×40px且x15.5px，与40px菜单共用中心；Enter激活项目切换实测。394×816和360×816抽屉300px，项目行268×48px，scrollbar-width:none、gutter:auto，页面横向溢出0；选另一项目后抽屉关闭。是浏览器窄屏验证，不冒称触摸硬件实测。
- 本地截图：output/playwright/project-routing-desktop.png、project-routing-collapsed.png、project-routing-mobile.png。示范提供多项目/单项目开关；默认零项目或单项目的guard另由运行源码单测验证。模板/样式均按用户授权新分类“多项目路由导航”标注，未套用二级侧边栏分类。
- Wiki断链/孤立页/源码引用/权威软链与git diff-check通过。本轮没有提交、发布或部署，生产状态不由本地示范推断；保留先前下拉独立菜单修正与无关launch/registry改动。

## 双区下拉独立菜单（2026-10-16）

- 修正原两侧共用options与保持模式的误解。hoverOptions/原options分别供给左/右菜单，独立aria-expanded、右箭头仅右菜单展开时旋转；面板单一渲染，按各自触发区定位并在数据或当前侧变化后重测。组件、分类注释、canonical引用/源快照/pattern及5191同步，不改CSS几何/颜色。
- 新增/调整脚本回归先失败（menuOptions不存在），后8项通过，覆盖两份选项双向切换、父级关闭、普通顶栏兼容、左右定位、状态与原焦点/触摸/Esc/清理；前端211/211、canonical36/36、两套类型检查/Vite通过，audit80/54/247无漂移，已有大chunk提示保持。
- 实际1167×816浏览器：左计算/存储/网络服务，右新建项目/导入配置/导出配置，左→右→左直接替换，开放菜单数恒1。相应按钮expanded交替为true，左开时箭头不旋转；左右各自菜单中心误差0，按钮126.5px保持，右箭头二维中心误差0。
- 394×816与360×816两种菜单均实测，单菜单/无横向溢出/右面板处于视口8px边界内，箭头中心误差0。Enter/Space、Shift+Tab到左菜单、Esc/Tab到右区不重开、Popover互斥、右菜单选择后关闭且旁边弹出选择文字不变均通过。触摸硬件未实测，保留单测的点击替代边界。
- 真实pointerdown观察：左区按下前为hover+三项服务，右区按下前仍hover+三项服务、右点击后为click+三项操作，证明不是左点击才展开或右悬浮就切换。仅本地临时观察器，未合成事件，验收后已移除。截图output/playwright/dual-menu-left.png、dual-menu-right.png、dual-menu-mobile.png，原生输入记录dual-menu-native-input.json。
- Wiki链接/孤立页/源引用/权威软链及diff-check通过；本地未提交未部署，线上仍是已验证的v0.2.114，本轮无生产写入。

## v0.2.114发布与生产验收

- 发布源码`34c3d3bf93570d61e6eb2d6b7605d0a9f3bf78da`、canonical`7d42361b50db392ac56b6070c156a345117de353`；CI38887258501与Release38887263135成功，209前端/35canonical、两套类型检查/构建、Go tests/vet及脚本语法通过。audit80源/54pattern/247哈希无漂移，字体OFL保留原字节，gitattributes仅对该上游许可原始行尾空格豁免diff-check。
- 2026-10-16T18:36:30.893589+08:00原生面板原子更新；Release/安装/proc实际运行文件SHA-256一致，本机/公网health均为v0.2.114-kreeper-20261016-ui-contract-sync。SQLite快照和当前运行库integrity_check均ok；三服务active/NRestarts0，sing-box/Tunnel PID及保护配置哈希不变；四个监听保持、面板本次启动error journal行数0。回滚精确位置与哈希由[项目权威](../../agent.md)维护。
- 公网首页200且引用当前构建的入口JS/CSS；12个相关JS/CSS/两个Courier Prime字体资源均200，与本地精确源码构建逐字节一致。Cloudflare附加检测脚本，因此不声称公网HTML整体逐字节相同。完整公开资源校验保存在本地验收JSON，不在Wiki内堆叠长日志。urllib直取曾返回403，curl与真实认证浏览器均成功，未修改WAF或访问控制。
- 认证生产订单4个success/refund状态牌实际为6px角、3px10px、13px/600；Courier Prime字体加载成功。设置页原SVG分支5组/菜单按钮图标0、普通管理菜单正常打开；1167px和394px均无横向溢出，手机账户方向箭头display:none。截图见output/playwright/release114-orders-desktop.png与release114-settings-mobile.png。未触发购买/退款/保存/备份/安装等业务写入。此前双区下拉桌面/394/360px和键盘/真鼠标事件验收属于5191示范；普通生产顶栏未传splitLabel，不把示范专用双区入口冒称已在每个业务页面启用。
- Wiki链接/孤立页/源引用及权威软链、diff-check通过。未纳入无关launch/registry改动；保留既有大chunk、依赖/Actions弃用和未签名资产边界。

## 双区组合下拉（2026-10-16）

- 项目与canonical共用TopbarHoverMenu的splitLabel可选模式与共享CSS，5191替换原单按钮Naive Dropdown示范；原顶栏调用不传此prop，不改变整体hover行为。已有两枚方向箭头总数保持，Popover/Tooltip仍无SVG/箭头。新增六项运行脚本/模板回归覆盖左右触发、hover→click保持、父级互斥重置、命中桥、触摸/键盘替代、外部/焦点/Esc关闭和监听释放。
- 1167×816、394×816、360×816实际浏览器测得整体126.5×32px、左88/右36、分割.5px贯穿30px内缘（32px外框去上下1px边界）；箭头与右区水平/垂直中心误差均0，页面横向溢出0。触摸44px命中区由媒体查询与契约覆盖，未声称实测触摸硬件。
- 仅本地临时只读事件观察器记录真正鼠标输入，不合成事件：左区pointerdown前aria-expanded=true，证明pointerenter已打开；右区pointerdown前=false、点击后=true。离开hover到外部标题时pointerdown前=false；点击保持模式离开到标题时pointerdown前=true，再由外部点击关闭。观察器已从5191移除并重新加载确认。
- 右区重复点击开/关、Enter/Space、Esc、左区键盘聚焦打开、Tab到右区不重开、Popover互斥和计算服务选择关闭均实测。菜单面板保持一个，运行错误日志为空。桌面与手机截图：output/playwright/split-dropdown-desktop.png、split-dropdown-mobile.png；原生输入记录split-dropdown-native-input.json。
- 前端209/209、canonical35/35、两套类型检查/Vite和audit80源/54pattern/247哈希通过，保留既有大chunk提示。Wiki链接/孤立页/源引用和权威软链检查通过。分类注释、规范、组件和示范同步，无新增视觉类型或字体/AWS色板变更；代码已随v0.2.114发布部署；本节保留本地交互证据，生产验收见上方发布记录。

## 加载区域内居中（2026-10-16）

- 原因：App的.page-loading-indicator固定50%/50dvh，将保持不变的侧栏/顶栏也算入了中心。现由当前加载root计算可见区域中心，保留原20px点阵、配色、请求等待、取消/重试及Shift5先后顺序。
- loading-position测试覆盖整屏、带264px侧栏/64px顶栏的内容、设置分区、滚动后裁切、目标离屏、手机visualViewport偏移；实际composable测试覆盖首次Vue移动布局、侧栏变宽、scroll/viewport resize及所有listener/observer/rAF清理。旧请求/token测试保持，前端202/202、canonical34/34、两套vue-tsc/Vite及80源/54pattern/247哈希audit通过，保留既有大chunk非阻断提示。
- 实际构建只读fixture：1167×816展开侧栏时中心(707.5,440)，不再是整屏(583.5,408)；侧栏折叠72px后为(611.5,440)，均与实际内容区坐标一致。1280×720同样验得展开(764,392)、折叠(668,392)。侧栏动画采用ResizeObserver绘制前重算；终态精确验收，不用rAF在ResizeObserver之前的采样冒称每个绘制阶段均误差0。
- 394×816最终版本手机首次723个有效加载采样，全部(197,440)、误差0，未先使用桌面侧栏几何；保留64px顶栏而非整屏y408。手机可见视口/软键盘偏移由单元测试覆盖，未冒称真实移动硬件或真实软键盘验收。
- 设置分区切换6个有效样本均以settings-main中心定位，x误差0、y亚像素取整误差0.00390625px；标题/二级侧栏不进入范围。5191模块重播点阵实际(707.5,566.703125)，与模块可见区域中心完全相同，外部顶栏与触发行未纳入。
- 截图output/playwright/loading-region-desktop-fixed.png、loading-region-collapsed.png、loading-region-mobile-fixed.png、loading-region-demo.png；只读fixture只模拟GET、非GET405且无生产转发。源码/注释/canonical loading/motion/reuse规范及示范同步，无新类别、无业务写入；代码已纳入v0.2.114，生产验收由上方发布记录维护。

## 六项视觉复核（2026-10-16）

- 文件夹问题的根因是Shift5的fill-both终帧clip仍为零outset，动画播放完到finish清理前裁断blur22px外投影。实际构建的只读fixture，旧/新各记录41个持有终帧：旧计算clip为inset(0px 0px 0%)；新为inset(-96px -96px calc(0% - 96px))，原动画时长/纸页/翻盖/阴影未减弱。截图记录最终表面，不冒称这些截图本身捕获了持有帧；时序证据来自真实rAF动画采样与关键帧回归。
- 用户与管理员订单实际DOM验证：成功/已退款均6px角、13px/600、padding3px10px，文字分别rgb(18,166,82)/rgb(227,113,0)。管理员列表及卡片均已替换旧pill；type同时显式映射class，避免Naive只写type但全局选择器无法命中。筛选/退款逻辑不改。
- 二级页签桌面采得30个不同横坐标；最后bar与活动tab的x/width相同，线高2px、底部对齐。1167/394/360×816分别采28/30/30个横移值，360px原生横滚16px后仍准确同位；三视口横向溢出0。标题显示“切换路由”，单一跟随面仅为行为而非独立类型。
- 四浮层按钮实测常态到悬浮前后尺寸分别112×32、97×32、73.6484×32、64.3828×32不变；均12px角、1px边框、无shadow/transform，悬浮背景rgb(240,240,240)。示范四按钮SVG0，箭头总数仍2（仅原两个下拉）；Popover打开再点点击下拉后四者aria-expanded只有点击下拉为true，互斥未改。
- ResourceGauge实际1167/394/360视口中，0.0/42.5/75.0/94.0/100.0%全部完整。76px圈的内圆直径55.3714px，最大文本宽53.09375px；三视口每个值均未进入内圆外，网格自然换行而非压缩五列。计算字号12.16px，%按比例；颜色、单值一位小数和圆弧绘制不变。
- 前端200/200、canonical33/33、两套vue-tsc/Vite、source/pattern/package audit80/54/247、diff-check通过；保留既有大chunk非阻断提示。回归覆盖普通/文件夹clip终帧分流、状态类型class、原生bar及资源数字适配。规范/示范/注释/权威文档同步，无新增分类、全局字体或AWS色变更。
- 浏览器用本地实际构建只读fixture（GET模拟，非GET405，未转发生产）与5191实际示范。截图与JSON证据位于output/playwright/visual-six-*.png及本地临时验收记录；本节为本地fixture证据，代码已纳入v0.2.114；未作业务写入，也未冒称真实移动硬件验收。

## 设置页首次入场与分区切换（2026-10-16）

- 根因：DashboardLayout对admin-settings禁用整页hook，而AdminSettings在mount只隐藏settings-main；二级侧栏/标题不在加载门控范围内。修复将首次入口归属整页routeShell，分区切换才归属settingsMain，内部enterOnMount=false避免双重运行。
- 新增settings-entry-motion实际hook回归，验证首屏、section变更、离开/重新进入的唯一目标壳；同步旧静态期望。前端196/196、canonical32/32、两套类型检查与Vite构建通过；沿用既有大chunk非阻断提示。source/package audit80/54/247通过，业务请求、权限、数据、保存/备份及BranchedMenu组件不改。
- 浏览器使用实际生产构建的本地只读HTTP fixture，GET设置接口延迟3秒，非GET返回405；无生产API转发或写入。requestAnimationFrame记录DOM可见性/点阵/遮罩阶段：旧构建373个加载帧中341帧侧栏可见、正文0帧；修复桌面367加载帧侧栏/正文/遮罩均0，第一次揭示时侧栏与正文同时可见。
- 394px设置页直达377个加载帧，侧栏/正文/遮罩均0；从其他页进入368个加载帧也均0。后续section切换219帧侧栏隐藏0、整页门控0、遮罩198帧，加载与遮罩重叠0，页面横向溢出0；离开重进及每次分区完成事件各一次。没有用构建通过代替时序证据，不声称真实移动硬件或线上验收。
- 截图保存在output/playwright/settings-entry-fixed-ready.png、settings-entry-fixed-loading-mobile.png、settings-entry-fixed-query-mobile.png；逐帧JSON在本地临时验收记录中。canonical规范/示范说明/注释同步，无新增类型、字体、颜色或几何变更。已随v0.2.114发布部署，按钮/字体修改一并纳入。

## 数字混排基线（2026-10-16）

- 根因：Courier Prime仅做size-adjust字面校准，升降部仍使用放大后的原字体度量；13px/18.2px的居中混排中，数字与单位基线相差1px。仅改flex baseline会使信息牌由24.1953px长高为25.1953px，不采用该局部补丁。
- 两个数字face统一ascent-override77.1728%、descent-override19.2154%、line-gap-override0%，将Inter hhea1984/2048、494/2048分别除以1.2553。字号、原组件行高、字体资产、字面高度、颜色、业务与购买逻辑不变；这是项目适配，不冒称AWS参数。
- 实际浏览器0尺寸inline baseline标记：旧度量对照差1px；11/13/28px × 400/600/700 × inline/flex共18组新度量差0px。实际5191金额牌在1167/394/360×816中，数字与单位range上下边完全一致，计算字号13px/行高18.2px/牌高24.1953125px，横向溢出0。已查看实际桌面画面并保存桌面/手机截图，不冒称真实移动硬件验收。
- 回归新增字体行度量数学断言，前端195/195、canonical31/31、两套类型检查/Vite和80源/54pattern/247哈希audit通过；保留既有大chunk提示。分类注释为数字展示与信息牌，未新增视觉类型；权威文档、Wiki和canonical同步，已随v0.2.114发布部署。


## 二级侧边栏项目颜色与无菜单图标（2026-10-16）

- 前端187/187、vue-tsc/Vite，canonical28/28与独立typecheck/Vite、audit80/54/247通过，既有大chunk提示仍为非阻断。
- 回归以项目内原附件fixture为独立基线，明确仅允许默认颜色token和默认图标字段/导入变化；其余script与整个template逐字一致。没有删除原SVG分支路径或重写动画，没有增加inert/焦点外观/组件v-model。
- 真实浏览器示范桌面、390×844、360×844：按钮内菜单SVG0，原分支SVG2，活动字/路径rgb(0,122,255)，正文oklch(.21 0 0)，中性线oklch(.92 0 0)；页面横向溢出0。点击Quick start后原stroke-dashoffset动画43个不同中间值、终值0px，已查看截图。
- 实际设置页仍用原组件只读fixture（模拟GET、禁止写入），检查backup直达、update切换、Telegram搜索/无结果、折叠与Enter/Tab/Space、390/360px；不将本地fixture等同认证生产。
- 未提交、未发布、未部署；没有验证真实移动硬件或生产写操作。原版直接运行A/B证据属于本轮颜色/无默认图标调整前的已测基线，不用旧截图证明新颜色。

## 二级侧边栏视觉修复（已发布部署）

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

本项已同步：`AdminSettings.vue` 源码、静态测试文件；源码提交为 `11f2b579d6ee4bb319e44779f7dc603d019fc366`，canonical skill 提交为 `9e3eb2a`。Release `v0.2.112-kreeper-20261015-secondary-sidebar-final` 的 ARM64 资产、生产宿主二进制与运行文件哈希一致；本机/公网 health、三项服务、监听端口、保护配置哈希和 SQLite Backup API `integrity_check=ok` 均已核验。生产仅替换面板二进制并重启 `qingzhou.service`，未改数据库、sing-box/Tunnel 或其配置。真实认证业务页的交互仍需在有权限的浏览器会话中检查，不以未认证跳转冒充视觉验收。


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

## 文件夹滚轮与数字字面（2026-10-16）

- 根因：wheelPreview只检查商品数，未检查open；数字与单位计算字号同为13px，但Courier Prime capHeight1187/2048、Inter1490/2048，字面天然约小20%。前端此前声明无实际文件的Ember回退，而示范自托管Courier Prime，字体来源也不一致。
- 新增真实处理函数回归覆盖closed5/open5/open4，分别验证preventDefault/stopPropagation/预览位置；字体回归读取原TTF OS/2和head表验证125.53%比例、字体文件/OFL及不覆盖组件字号。全部前端194/194、canonical30/30、两套vue-tsc/Vite通过，保留既有ECharts大chunk警告。
- 5191真实滚轮（闭合且焦点预展开、未点击）：页面scrollTop2687.5→2932.5，位移245px，仍closed且前四个商品不变；实际点击展开后scrollTop2684→2684，位移0，窗口从标准/轻量/专业/长期切到轻量/专业/长期/跨地区。收起后open=false。透明留白命中边界维持原规则。
- 同源隔离字体测量页加载真实字体后，Canvas 13px“29”的可见字高：未校准Courier Prime7.8203125px；当前共享face9.8114853px；Inter9.7309570px，差<1%。同时测得字宽15.5898→19.5592px；不声称字体宽度未变。TTF/OFL字节与canonical固定来源一致，构建产物含两份字体文件。
- 1440/1167/768/394/360×816逐次刷新DOM确认实际视口后验收：页面横向溢出0；价格数字与相邻正文均13px、原line-height18.2px、数值盒18.1953px、信息牌高24.1953px。已查看桌面效果，并保存桌面及360px截图；未冒称真实移动硬件验收。
- 已读取AWS官方Typography的Typeface/Monospace/Type styles/Fallback/General guidelines；保持官方等宽使用场景与正文角色边界，125.53%是本地光学校准，不是官方字号token。未改独立Go HTML模板、认证/计费/购买业务、数据库或生产；保留上一轮未提交视觉改动。

## 高亮弧边统一与状态牌几何（2026-10-16）

- 修复前实测：inactive标签18px角、0px 7px内距；购买示范为原生button而共享高亮规则只匹配Naive按钮，导致类名正确但外观错误。新增两项项目回归在修复前失败，修复后通过。
- 全部前端192/192、vue-tsc与Vite通过；canonical29/29、独立vue-tsc/Vite通过。保留既有ECharts大chunk提示；前端集成fixture仍可能打印既有HMR端口占用诊断，测试全数通过，不作为视觉证据。
- 以修改前脚本逐文件比对，剔除分类注释及新增positiveButtonProps.type=primary后完全一致；模板只改按钮类型/类名/注释。确认原风险文案、回调、权限、loading和禁用未改；warning状态标签、提示和弹窗类型仍保留。
- 5191真实浏览器1167×816、394×816、360×816均无页面横向溢出；购买按钮为NButton primary，32px高、72px宽、18px角、13px字/左右10px、蓝底白字；点击后背景为统一提亮色且transform=none，无尺寸变化。窄屏仍是fine指针，仅验证几何与CSS触摸44px合同，不冒称真实coarse硬件验收。
- 五种状态牌均6px角、3px 10px内距，内部--n-border-radius也为6px；状态示范仍正常显示橙色警告牌。Controls按钮为普通/强调/默认弧边/高亮弧边/删除/禁用，页面warning按钮数量0。
- 打开示范warning Dialog确认：取消透明中性默认弧边、确定蓝色高亮弧边，动画结束后两者均32px高/18px角；positive pressed token为统一accent84%+white。仅打开并取消本地示范，没有执行生产写操作。
- 已查看并保存购买/状态牌桌面截图、控件分类和360px状态牌截图。源码、规范、快照、pattern及运行示范同轮同步；本轮已随v0.2.114发布部署。

## v0.2.113导航同步发布验收

- 发布源码`caa239c63a1a9bc28f838703238c22529773fa82`、设计系统`c1713f58b47999855d4df95491639f753f96da3c`；CI/Release全部成功，前端190/190、canonical28/28、两套类型检查与构建、Go tests/vet、80源/54pattern/247哈希审计通过，保留既有ECharts大chunk警告。
- ARM64 Release资产、宿主安装文件、`/proc`实际运行文件哈希一致；本机/公网health为v0.2.113-kreeper-20261016-navigation-sync。数据库Backup API快照和当前运行库integrity_check均ok；三服务active/NRestarts0，节点/Tunnel PID及配置哈希不变，8081/8882/18082/19000监听保持，面板本次启动error journal行数0。
- origin首页SHA-256为`f54f9bac8d1ad088767150c227d06158e74a3bfcaefda285cb461f97122ee312`，与本地构建一致；公网HTML资源引用相同，Cloudflare追加自己的检测脚本，因此不声称公网HTML逐字节相同。公网index、DashboardLayout、AdminSettings共6个JS/CSS资源全部200且与本地构建逐字节一致。
- 认证生产设置页backup直达、基本设置切换只读验收：原SVG分支5组、菜单按钮内SVG0、活动文字rgb(0,122,255)，桌面搜索与操作列间距16px、无横向溢出。生产管理箭头开合采得6种transform中间值，中心误差<0.001px。394×816下箭头display:none、无菜单图标、无页面横向溢出。未保存表单或触发安装/备份/配置写操作；未冒称真实手机硬件验收。
- Wiki文件链接、孤立页、authority软链接和diff-check通过；本地`.claude/launch.json`及registry无关变更未纳入提交。资产未签名；既有npm依赖告警未宣称清零。

## 下拉箭头、顶栏与竖屏页签（2026-10-16）

- 原始复现：7px L形边框旋转45/225度，绘图重心偏移；示范顶栏搜索480px且操作列小于按钮内容；竖屏实际页签41px被40px滚动层裁切，基线bottom7与活动线bottom0不共面。
- 新增`frontend/tests/navigation-geometry.test.mjs`三项回归，修复前均失败，修复后通过；全部前端190/190、vue-tsc/Vite通过。canonical28/28、独立vue-tsc/Vite通过；保留既有ECharts >500kB chunk警告。
- 真实浏览器5191：点击下拉、弹出选择、管理、设计体验四个入口开/关测量；每个采集18次状态，含8/9/11/10个不同transform中间值，中心偏移最大0.000004px（浮点误差），按钮宽高变化0。
- 宽度1440/1280/1167/1080/1024/900/769/768/394/390/360，均无页面横向溢出；桌面搜索与操作按钮保留16/12px间距；<=768搜索不渲染、头像旁箭头display:none。各宽度活动线与实际页签行bottom差0且没有裁切。
- 360px逐一点击四页签，并触发最后一项横向滚动scrollLeft16，活动线仍对齐且选中项完整可见。最终394px确认组件重复底边为0px、滚动层与实际页签行均41px，活动底线不再丢失。已查看桌面下拉和394px截图。
- 源/资产审计80源文件、54组件/页面pattern、247包哈希通过；Wiki 16页无断链和孤立页，权威软链接有效，项目/skill diff-check通过。
- 以上是本地示范浏览器与两套源码构建证据，不是生产或真实手机硬件验收；未提交、未发布、未部署。

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

## 表单选择与分页（2026-10-17）

本轮共享CSS：Checkbox16px/4px、点击box与border的计算shadow均none；禁用/选中禁用保留Naive处理。普通Radio按官方HeroUI3.2.6源码适配：16px圆形蓝底/白点、14px内部×.4286、200ms指示点/100ms按压控件、原三层field-shadow；API/name/value及原生键盘互斥保持。普通组去胶囊，route-switch按钮组仍为16/12/4。分页四个页码/左右控件计算角均8px，选中Apple蓝/白字，悬浮/按下同提亮；全局-item18px覆盖已显式消除。

浏览器1167×816、394×816、360×800验证无横向溢出：点击标签选择完整、Up键切回紧凑且有静态2px键盘焦点；分页2显示QZ-04行、下一页禁用，上一页回1；route-switch近30天选择与240底/16px角保持。Checkbox鼠标点击无外晕。截图在本地ignored output/controls/desktop.png、mobile.png、pagination.png。尺寸模拟不等于真实手机硬件验收；未声称Naive原生非焦点分页项目具有新增键盘能力。

214前端测试、46canonical契约测试、生产/复用/示范三套类型检查与Vite构建通过；审计101源/55pattern/262包哈希、Wiki16页和diff空白检查通过。沿用用户指定现有复选框/单选框/分页细则，模板/CSS分类责任注释、canonical forms/content/foundations/semantics/sources/许可及5191同步；本轮未改AWS字体或图表规则。未提交的CPU/内存热力图后端及其文档修改不纳入此发布，生产证据另补。

## 表格完整显示与复选框边线（2026-10-17）

1167×816：实际表格/滚动容器743px，scrollWidth743、scrollLeft0，右侧查看按钮边界1030.84小于表格右边1079；点击查看正常打开原信息浮层。394×816：表格310px、内容700px，可横滚到scrollLeft390（最大值），查看按钮完整可见且原动作有效；360×800页面无横向溢出，表格276px，所有列仍在内部横滚。Naive横轨display:block/opacity1。截图output/table-checkbox/table-desktop.png、table-mobile.png。

接受条款取消选中后鼠标仍hover、根仍focus：计算border为1px rgb(213,219,219)，box-shadow none，无点击蓝边；4px角/勾选填充/禁用和独立键盘焦点保持，未改表单事件。CSS/模板责任注释沿用复选框/展示信息模块/分页，无新增类型；未改AWS字体/图表规则。

214前端/46canonical、生产/复用/示范类型检查与构建、Go全量测试/vet、audit101源/55pattern/262hash通过；既有CPU/内存热力图11例×双接口×四范围随全量Go测试复核。用户授权青舟全部本地改动一起发布，包含该后端、维护文档及.claude/launch.json；没有触发OCI缓存清理。生产验收另补。

## 分页角落裁切（2026-10-17）

1167×816原末页下一页button矩形与根容器右/下边相等，根overflow:hidden/radius18导致按钮右下三个点（right-4/bottom-4、right-2/bottom-8、right-8/bottom-2）elementFromPoint均命中外层spec-depth-2而非按钮。改为根visible、内部wrapper hidden并继承18px后，三点全部命中禁用下一页button；切回首页的启用下一页同样命中。不是单纯宽度溢出，不以矩形相等宣称未裁切。

394/360px末页按钮角点均命中，页面横向溢出0；内部内容仍700px且只在表内横滚。首/末页与启用/禁用几何保持；业务分页模型不变。截图output/pagination-clip/before.png、after.png、mobile.png。214前端测试及生产类型检查/Vite通过；canonical46测试、复用/示范构建、101源/55pattern/262hash与Wiki检查通过。模板使用原分页责任边界，新增CSS展示信息模块/分页注释；无新类型或AWS修改。生产验收另补。

## 共享反馈与预载设置切换（2026-10-20）

验证：Host37项测试/类型，AI5文件52项弹窗/设置定向回归、修改源lint、类型/独立构建；青舟230项/类型/独立构建；四根密封Console构建通过。canonical121源/59组件patterns/311包hash审计零漂移，50契约/复用类型/隔离构建通过。真实浏览器验证原31个中间动效姿态、360/390/768/1167/1920宽度无横溢出、18px角、无按钮消息与Dialog、自动关闭、异步false仅回调一次、返回焦点、双层Esc2→1→0、低动态无旋转/缩放/模糊及44px触摸关闭。实际青舟合成登录成功0按钮、Inter/Resource Han Rounded CN与18px表面，设置basic→cert无矩阵/入场/溢出；AI独立与编译Console均无自动Driver/账户重放入口、插件浅蓝无边框18px、复选框16px/4px及原512px创建用户弹窗；AI实际错误消息在Console overlay scope中为白面18px/4px16px阴影，只有原关闭入口。合成浏览器未访问生产API。

Canonical/QZ shared source matched; AI excludes the Naive provider and maps its existing LoadingSpinner import. QZ useMessage real synthetic login has0 new action buttons; settings group expansion and basic→cert navigation create no page loading/reveal. Source guard regression verifies that a later actual page route still starts its normal content gate. Evidence and native rollout belong to [authority](../../agent.md#共享反馈表面与设置即时切换2026-10-20当前已部署).

## 共享消息绘制与图标（2026-10-20）

FeedbackMessages复用现有Apple语义圆形状态图标与白色符号，滚动消息栈增加16px绘制留白；无新增动作，原面板Motion与计时不变。230前端测试、类型/native构建、canonical121源/59patterns/311hash及50契约/隔离构建通过。本地实际合成登录的成功反馈仍0按钮、18px/白面，预载设置切换无加载/横溢出。独立生产binary/SQLite备份/配置与212旧静态核验归[权威](../../agent.md#共享消息图标与阴影绘制修正2026-10-20当前已部署)，不以合成UI声称生产认证完成。
