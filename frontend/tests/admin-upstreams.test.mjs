import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../src/views/AdminUpstreams.vue', import.meta.url), 'utf8')
const overview = await readFile(new URL('../src/views/AdminOverview.vue', import.meta.url), 'utf8')
const monitor = await readFile(new URL('../src/views/Monitor.vue', import.meta.url), 'utf8')
const ociLogo = await readFile(new URL('../src/assets/provider-oci.svg', import.meta.url), 'utf8')
const cloudflareLogo = await readFile(new URL('../src/assets/provider-cloudflare.svg', import.meta.url), 'utf8')
const nodes = await readFile(new URL('../src/views/AdminNodes.vue', import.meta.url), 'utf8')
const layout = await readFile(new URL('../src/components/DashboardLayout.vue', import.meta.url), 'utf8')
const router = await readFile(new URL('../src/router/index.ts', import.meta.url), 'utf8')
const globalStyles = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8')

const controlFiles = [
  '../src/components/AdminUsageReport.vue',
  '../src/components/DashboardLayout.vue',
  '../src/views/AuthPage.vue',
  '../src/components/OAuth2Account.vue',
  '../src/components/OAuth2Settings.vue',
  '../src/views/AdminAPITokens.vue',
  '../src/views/AdminAnnouncements.vue',
  '../src/views/AdminCerts.vue',
  '../src/views/AdminHelp.vue',
  '../src/views/AdminManualNotifications.vue',
  '../src/views/AdminMonitor.vue',
  '../src/views/AdminNodes.vue',
  '../src/views/AdminOrders.vue',
  '../src/views/AdminOverview.vue',
  '../src/views/AdminPackages.vue',
  '../src/views/AdminRegCodes.vue',
  '../src/views/AdminServers.vue',
  '../src/views/AdminSettings.vue',
  '../src/views/AdminSingbox.vue',
  '../src/views/AdminUpdate.vue',
  '../src/views/AdminUpstreams.vue',
  '../src/views/AdminUserGroups.vue',
  '../src/views/AdminUsers.vue',
  '../src/views/UserAccount.vue',
  '../src/views/UserHelp.vue',
  '../src/views/UserOrders.vue',
  '../src/views/UserPoints.vue',
  '../src/views/UserSub.vue',
]
const controlSources = await Promise.all(controlFiles.map((file) => readFile(new URL(file, import.meta.url), 'utf8')))

test('upstream management page keeps provider queries separate and exposes no saved credentials', () => {
  assert.match(source, /OCI Usage API/)
  assert.match(source, /fmtBytes\(ociUsage\.remaining\)/)
  assert.match(source, /fmtBytes\(ociForm\.monthly_limit_bytes\)/)
  assert.match(source, /Cloudflare Analytics GraphQL/)
  assert.match(source, /\/api\/admin\/upstreams\/\$\{provider\}\/refresh/)
  assert.match(source, /private_key_set/)
  assert.match(source, /analytics_token_set/)
  assert.doesNotMatch(source, /v-model:value="ociForm\.private_key"[^>]+show-password/)
  assert.match(source, /高亮弧边按钮：供应商配置保存是当前卡片的主动作，悬浮时变深。[\s\S]*?type="primary" class="highlight-arc-button"[^>]*>保存 OCI 配置/)
  assert.match(source, /高亮弧边按钮：供应商配置保存是当前卡片的主动作，悬浮时变深。[\s\S]*?type="primary" class="highlight-arc-button"[^>]*>保存 Cloudflare 配置/)
})

test('provider cards use transparent provider logos in titles and balance items', () => {
  assert.match(source, /provider-oci\.svg/)
  assert.match(source, /provider-cloudflare\.svg/)
  assert.match(source, /class="provider-card-title"[\s\S]*?class="provider-logo"/)
  assert.match(monitor, /class="upstream-provider-logo"/)
  assert.match(source, /\.provider-logo \{ width: 18px; height: 18px;/)
  assert.match(monitor, /\.upstream-provider-logo \{ width: 16px; height: 16px;/)
  assert.doesNotMatch(ociLogo, /<rect\b|background/i)
  assert.doesNotMatch(cloudflareLogo, /<rect\b|background/i)
  assert.doesNotMatch(monitor, /class="upstream-provider-mark"/)
})

test('branding, subscription label, and input focus contract match production', () => {
  assert.match(layout, /label: '订阅套餐'/)
  assert.match(layout, /'\/shop': '订阅套餐'/)
  assert.match(globalStyles, /--focus-ring-soft: none/)
  assert.match(globalStyles, /input, textarea \{ caret-color: var\(--accent\); \}/)
  assert.match(globalStyles, /\.n-input, \.n-input-number, \.n-base-selection \{[\s\S]*?transition: color \.25s var\(--ease-standard\), background-color \.25s var\(--ease-standard\), border-color \.25s var\(--ease-standard\), box-shadow \.25s var\(--ease-standard\) !important;/)
  assert.match(globalStyles, /\.n-base-selection \.n-base-selection__state-border \{[\s\S]*?border: 1px solid #d1cfc5 !important;[\s\S]*?box-shadow: none !important;[\s\S]*?transition: border-color \.25s var\(--ease-standard\), box-shadow \.25s var\(--ease-standard\) !important;/)
  assert.match(globalStyles, /\.n-input:not\(\.n-input--disabled\):hover \.n-input__border,[\s\S]*?border: 1px solid #d1cfc5 !important;[\s\S]*?box-shadow: none !important;/)
  assert.match(globalStyles, /\.n-input:not\(\.n-input--disabled\)\.n-input--focus \.n-input__state-border[\s\S]*?\{[\s\S]*?border: 1px solid var\(--accent\) !important;[\s\S]*?box-shadow: inset 0 0 0 1px var\(--accent\) !important;/)
  assert.match(globalStyles, /\.n-base-selection:not\(\.n-base-selection--disabled\)\.n-base-selection--active \.n-base-selection__state-border[\s\S]*?\{[\s\S]*?border: 1px solid var\(--accent\) !important;[\s\S]*?box-shadow: inset 0 0 0 1px var\(--accent\) !important;/)
  assert.match(layout, /\.sidebar-filter input:focus-visible \{ border-color: var\(--accent\);[\s\S]*?box-shadow: inset 0 0 0 1px var\(--accent\); \}/)
  assert.match(layout, /\.sidebar-filter input \{[\s\S]*?transition: color \.25s var\(--ease-standard\), background-color \.25s var\(--ease-standard\), border-color \.25s var\(--ease-standard\), box-shadow \.25s var\(--ease-standard\);/)
  assert.doesNotMatch(layout, /\.sidebar-filter input:hover:not\(:focus-visible\)/)
  assert.match(layout, /\.header-search :deep\(\.n-input\)[\s\S]*?transition: color \.25s var\(--ease-standard\), background-color \.25s var\(--ease-standard\), border-color \.25s var\(--ease-standard\), box-shadow \.25s var\(--ease-standard\) !important;/)
  assert.ok(controlSources.slice(0, -1).every((source) => source.includes('<!-- 填写框 -->')))
  assert.match(controlSources.at(-1), /<!-- 下拉选择菜单：原生配置代理范围使用与顶栏菜单一致的选项悬浮圆角。 -->/)
  assert.match(controlSources.at(-1), /<!-- 复制栏：订阅地址仅用于查看和复制，不使用填写框的点击焦点高亮或过渡特效。 -->/)
})

test('admin overview range switch uses the Sub2 route-switch geometry without changing colors', () => {
  assert.match(overview, /class="overview-range-tabs"/)
  assert.match(overview, /class="ov-tabs route-switch-2"/)
  assert.match(overview, /二级切换路由（切换路由2）/)
  assert.match(globalStyles, /\.n-tabs\.route-switch-2 \.n-tabs-nav-scroll-wrapper[\s\S]*?overflow-x: auto !important;/)
  assert.match(globalStyles, /\.n-tabs\.route-switch-2 \.n-tabs-bar[\s\S]*?display: none !important;/)
  assert.match(globalStyles, /\.n-tabs\.route-switch-2 \.n-tabs-tab \{[\s\S]*?border-radius: 0 !important;[\s\S]*?background: transparent !important;/)
  assert.match(globalStyles, /\.n-tabs\.route-switch-2 \.n-tabs-tab--active::after[\s\S]*?height: 2px;[\s\S]*?border-radius: 0(?: !important)?;[\s\S]*?background: var\(--accent\);/)
  assert.match(overview, /\/\* 路由切换组件 \*\//)
  assert.match(overview, /@mouseover="moveRangeIndicatorFromEvent"/)
  assert.match(overview, /@mouseleave="moveRangeIndicatorToSelected"/)
  assert.match(overview, /--range-indicator-x/)
  assert.match(overview, /\.overview-range-tabs::before[\s\S]*?transform: translateX\(var\(--range-indicator-x\)\)/)
  assert.match(overview, /\.overview-range-tabs[\s\S]*?height: auto !important;[\s\S]*?min-height: 40px;[\s\S]*?padding: 4px;[\s\S]*?border-radius: 16px !important;[\s\S]*?background: var\(--bg-subtle\);[\s\S]*?box-shadow: none;/)
  assert.match(overview, /\.overview-range-tabs \.n-radio-button[\s\S]*?min-height: 32px;[\s\S]*?border-radius: 12px !important;/)
  assert.match(overview, /\.overview-range-tabs::before[\s\S]*?border-radius: 12px !important;[\s\S]*?background: var\(--card\);[\s\S]*?transition: transform \.24s/)
  assert.match(overview, /\.overview-range-tabs \.n-radio-button--checked[\s\S]*?background: transparent !important;[\s\S]*?color: var\(--text\) !important;/)
})

test('upstream management is above admin overview in operations navigation', () => {
  assert.ok(layout.indexOf("{ label: '上游管理'") < layout.indexOf("{ label: '管理概览'"))
  assert.match(router, /path: 'admin\/upstreams'/)
})

test('upstream cards persist drag order and the public monitor keeps balance data admin-only', () => {
  assert.match(source, /admin_upstream_balance_order/)
  assert.match(source, /draggable="true"/)
  assert.match(source, /handleProviderDrop/)
  assert.match(monitor, /auth\.isAdmin \? apiList<any>\('\/api\/admin\/monitor\/servers'\)/)
  assert.match(monitor, /\/api\/admin\/upstreams\/\$\{provider\}\/refresh/)
  assert.match(monitor, /handleUpstreamDrop/)
  assert.match(monitor, /fmtBytes\(item\.usage\?\.remaining \|\| 0\)/)
  assert.match(monitor, /fmtBytes\(item\.usage\.limit\)/)
  assert.match(monitor, /fmtBytes\(item\.usage\.used\)/)
})

test('node cards use drag-and-drop for the shared subscription order', () => {
  assert.match(nodes, /class="list-card node-sort-card"/)
  assert.match(nodes, /handleNodeDrop/)
  assert.match(nodes, /\/api\/admin\/nodes\/reorder/)
  assert.doesNotMatch(nodes, /前移（订阅\/列表更靠前）/)
  assert.doesNotMatch(nodes, /@click="moveNodeInGroup/)
})

test('sidebar uses the Cloudflare documentation sidebar treatment', () => {
  assert.match(layout, /\/\* 侧边栏 \*\//)
  assert.match(layout, /class="app-sider sidebar-surface"/)
  assert.match(layout, /class="sidebar-surface mobile-sidebar"/)
  assert.match(layout, /class="mobile-sidebar-drawer-root" content-class="mobile-sidebar-drawer"/)
  assert.match(layout, /\.sidebar-surface \{[\s\S]*?--sidebar-bg: var\(--bg\);[\s\S]*?--sidebar-card: var\(--bg\);[\s\S]*?--sidebar-hover: #f0f0f0;[\s\S]*?--sidebar-content-gap: 20px;[\s\S]*?background: var\(--sidebar-bg\);[\s\S]*?display: flex; flex-direction: column;/)
  assert.match(layout, /\.mobile-sidebar \{[\s\S]*?width: 100%; height: 100%; min-height: 100%;/)
  assert.match(layout, /\.app-sider \{[\s\S]*?width: 16\.5rem;[\s\S]*?border-right: 1px solid var\(--sidebar-border\);/)
  assert.match(layout, /\.layout-header \{[\s\S]*?background: var\(--topbar-background\);[\s\S]*?border-bottom: 1px solid var\(--topbar-divider\);[\s\S]*?backdrop-filter: var\(--topbar-backdrop-filter\);/)
  assert.match(layout, /\.sidebar-filter input \{[\s\S]*?border-radius: 8px;[\s\S]*?background: var\(--sidebar-card\);/)
  assert.match(layout, /筛选框不显示浏览器原生的搜索清除叉号[\s\S]*?\.sidebar-filter input\[type="search"\]\:\:-webkit-search-cancel-button,[\s\S]*?display: none;/)
  assert.match(layout, /\.sidebar-filter \{[\s\S]*?margin: 20px 0;/)
  assert.match(layout, /\.sidebar-menu \{[\s\S]*?flex: 1 1 auto;[\s\S]*?overflow-y: auto; scrollbar-gutter: stable; contain: inline-size; padding: 0 0 var\(--sidebar-content-gap\) 16px;/)
  assert.match(layout, /\.mobile-sidebar \.sidebar-menu \{ flex: 1 1 auto; \}/)
  assert.match(layout, /\.app-sider\.is-collapsed \.sidebar-menu \{ padding: 8px 8px var\(--sidebar-content-gap\); \}/)
  assert.match(layout, /\.sidebar-footer \{ flex: 0 0 64px; box-sizing: border-box; height: 64px; min-height: 64px; max-height: 64px; padding: calc\(var\(--sidebar-content-gap\) - 1px\) 16px 12px; border-top: 1px solid var\(--sidebar-border\); \}/)
  assert.match(layout, /\.app-sider\.is-collapsed \.sidebar-footer \{ padding: calc\(var\(--sidebar-content-gap\) - 1px\) 8px 12px; \}/)
  assert.match(layout, /\.sidebar-menu \{[\s\S]*?contain: inline-size;/)
  assert.match(layout, /\.sidebar-menu::\-webkit-scrollbar-thumb \{[\s\S]*?background: revert;/)
  assert.match(layout, /:deep\(\.n-menu-item-content__arrow\) \{[\s\S]*?display: inline-flex; align-items: center; justify-content: center; align-self: center; justify-self: center;[\s\S]*?rotate\(-90deg\)/)
  assert.match(layout, /:deep\(\.n-submenu\[aria-expanded="true"\] > \.n-menu-item > \.n-menu-item-content \.n-menu-item-content__arrow\)/)
  assert.doesNotMatch(layout, /:deep\(\.n-menu-item\), :deep\(\.n-submenu\) \{ height: 32px;/)
  assert.match(layout, /:deep\(\.n-menu-item-content\) \{[\s\S]*?box-sizing: border-box;[\s\S]*?min-height: 32px !important;[\s\S]*?height: 32px !important;[\s\S]*?padding: 6px 12px !important;/)
  assert.match(layout, /:deep\(\.n-menu-item-content:hover::before\) \{ background: var\(--sidebar-hover\) !important; \}/)
  assert.match(layout, /:deep\(\.n-menu-item-content--selected::before\), :deep\(\.n-menu-item-content--child-active::before\) \{ background: var\(--sidebar-selected\) !important; \}/)
  assert.match(layout, /:deep\(\.menu-group-label\) \{[\s\S]*?font-weight: 600; color: var\(--sidebar-muted\);[\s\S]*?opacity: 1;/)
  assert.match(layout, /:deep\(\.n-menu-item-content--selected \.n-menu-item-content__icon\),[\s\S]*?:deep\(\.n-menu-item-content--child-active \.n-menu-item-content__icon\) \{ color: var\(--accent\) !important; \}/)
  assert.match(globalStyles, /\.sidebar-menu \.n-submenu \{[\s\S]*?--n-item-height: 32px;[\s\S]*?min-height: 32px !important;[\s\S]*?margin: 0 0 2px !important;/)
  assert.match(globalStyles, /\.sidebar-menu \.n-submenu-children \.n-menu-item \{[\s\S]*?height: 32px !important;[\s\S]*?margin: 0 0 1px !important;\s*\}/)
  assert.match(globalStyles, /\.sidebar-menu \.n-submenu-children \.n-menu-item-content \{[\s\S]*?padding-left: 12px !important;\s*\}/)
  assert.match(layout, /\.app-sider \{[\s\S]*?width: 16\.5rem; min-width: 16\.5rem; max-width: 16\.5rem; flex: 0 0 16\.5rem;[\s\S]*?overflow: hidden;/)
  assert.match(layout, /:deep\(\.n-menu\) \{ width: 100%; min-width: 0; max-width: 100%; overflow: hidden;/)
  assert.match(layout, /:deep\(\.n-menu-item-content\) \{[\s\S]*?position: relative; z-index: 0; overflow: hidden;[\s\S]*?border-radius: 8px !important;/)
  assert.match(layout, /:deep\(\.n-menu-item-content::before\) \{[\s\S]*?left: 0 !important; right: 0 !important; top: 0 !important; bottom: 0 !important; border-radius: 8px !important;/)
  assert.match(layout, /:deep\(\.n-menu-item-content--selected::before\), :deep\(\.n-menu-item-content--child-active::before\) \{ background: var\(--sidebar-selected\) !important; \}/)
  assert.match(layout, /:deep\(\.n-menu-item-content--selected \.n-menu-item-content__icon \.n-icon svg\),[\s\S]*?color: var\(--accent\) !important;/)
  assert.match(layout, /:deep\(\.n-menu\) \{[\s\S]*?contain: inline-size;/)
  assert.doesNotMatch(layout, /:deep\(\.n-submenu(?:-children)?(?: \.n-menu-item(?:-content)?)?\) \{/)
  assert.match(layout, /:deep\(\.n-menu-item-content--selected::after\) \{ display: none; \}/)
  assert.match(globalStyles, /侧边栏例外：全局 \[class\*="-item"\] 圆角兜底会匹配 Naive UI 的/)
  assert.match(globalStyles, /\.sidebar-menu \.n-menu-item-content,[\s\S]*?border-radius: 8px !important;/)
  assert.match(globalStyles, /\.sidebar-menu \.n-submenu-children \{[\s\S]*?position: relative !important;[\s\S]*?width: auto !important;[\s\S]*?margin: 2px 0 2px 12px !important;[\s\S]*?padding-left: 16px !important;[\s\S]*?border-left: 0 !important;/)
  assert.match(globalStyles, /\.sidebar-menu \.n-submenu-children::before \{[\s\S]*?left: 8px;[\s\S]*?width: 1px;[\s\S]*?background: var\(--sidebar-border\);/)
  assert.match(globalStyles, /\.sidebar-menu \.n-submenu-children \{[\s\S]*?overflow-x: clip !important;[\s\S]*?overflow-y: visible !important;/)
  assert.doesNotMatch(layout, /:global\(\.sidebar-menu \.n-menu(?:-item|\-item-content|\-submenu)/)
  assert.match(layout, /:deep\(\.n-drawer\) \{[\s\S]*?border-radius: 0 !important;[\s\S]*?box-shadow: none !important;/)
  assert.match(layout, /:global\(\.mobile-sidebar-drawer \.n-drawer-body-content-wrapper\) \{[\s\S]*?overflow: hidden !important;/)
})

test('desktop sidebar collapses to an accessible icon rail and keeps the mobile drawer unchanged', () => {
  assert.match(layout, /class="app-sider sidebar-surface" :class="\{ 'is-collapsed': sidebarCollapsed \}"/)
  assert.match(layout, /侧边栏折叠按钮：桌面切换完整导航与图标轨道，移动端继续使用抽屉；桌面与移动 Drawer 共用同一 footer 样式。[\s\S]*?aria-label="sidebarCollapsed \? '展开侧栏' : '收起侧栏'"[\s\S]*?aria-expanded="!sidebarCollapsed"[\s\S]*?aria-controls="desktop-sidebar-nav"[\s\S]*?@click="toggleSidebar"/)
  assert.match(layout, /function toggleSidebar\(\) \{\s*sidebarCollapsed\.value = !sidebarCollapsed\.value\s*\}/)
  assert.match(layout, /function menuNodeProps\(option: MenuOption \| MenuGroupOption\)[\s\S]*?return sidebarCollapsed\.value && label \? \{ title: label \} : \{\}/)
  assert.match(layout, /\.app-sider\.is-collapsed \{ width: 72px; min-width: 72px; max-width: 72px; flex-basis: 72px; \}/)
  assert.match(layout, /\.app-sider\.is-collapsed :deep\(\.n-menu-item-content-header\)[\s\S]*?clip: rect\(0, 0, 0, 0\) !important;/)
  assert.match(layout, /:global\(\.mobile-sidebar-drawer\) \{\s*width: 300px !important;/)
})

test('mobile menu trigger copies the Sub2 portrait sidebar toggle contract', () => {
  assert.match(layout, /悬浮菜单按钮：复用 Sub2 竖屏侧栏按钮的路径、尺寸与透明状态。/)
  assert.match(layout, /<button v-if="isMobile" class="icon-btn app-header-menu-toggle"[^>]*aria-label="菜单">[\s\S]*?class="app-header-menu-toggle-icon"[^>]*viewBox="0 0 32 32"[^>]*stroke-width="2\.5"[\s\S]*?stroke-dasharray="12 63" d="M27 10 13 10C10\.8 10 9 8\.2 9 6 9 3\.5 10\.8 2 13 2 15\.2 2 17 3\.8 17 6L17 26C17 28\.2 18\.8 30 21 30 23\.2 30 25 28\.2 25 26 25 23\.8 23\.2 22 21 22L7 22"[\s\S]*?<path d="M7 16 27 16" \/>/)
  assert.match(layout, /\.icon-btn \{[\s\S]*?width: 42px; height: 42px; flex: 0 0 42px; padding: 10px;[\s\S]*?border: 0; border-radius: 8px; background: transparent;/)
  assert.match(layout, /\.app-header-menu-toggle-icon \{ display: block; width: 22px; height: 22px; flex: 0 0 22px; \}/)
})

test('sidebar categories use static level-one groups and nest account/admin under information', () => {
  assert.match(layout, /侧边栏菜单归类级别：一级归类只作为静态分组标题/)
  assert.match(layout, /return \{ type: 'group', key, label: groupLabel\(label\), children, sidebarLabel: label \}/)
  assert.match(layout, /const infoLeafItems: MenuOption\[\] = \[[\s\S]*?key: '\/account'/)
  assert.match(layout, /const infoItems = computed<MenuOption\[\]>\(\(\) => \[[\s\S]*?\.\.\.infoLeafItems,[\s\S]*?key: 'admin-root'/)
  assert.match(layout, /侧边栏菜单归类级别：三级归类，保留 SVG 图标和展开箭头/)
  assert.match(layout, /key: 'ag-ops', icon: renderIcon\(PulseOutline\)/)
  assert.match(layout, /key: 'ag-node', icon: renderIcon\(ServerOutline\)/)
  assert.match(layout, /key: 'ag-sys', icon: renderIcon\(DocumentTextOutline\)/)
  assert.doesNotMatch(layout, /menuSection\('admin-root'/)
})

test('sidebar search suggestions contain navigable routes only', () => {
  assert.match(layout, /\.filter\(item => item\.key !== 'admin-root'\)/)
})
