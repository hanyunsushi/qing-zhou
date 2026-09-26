import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const frontendRoot = new URL('..', import.meta.url)
const read = (path) => readFileSync(new URL(path, frontendRoot), 'utf8')

test('Cloudscape visual tokens keep the existing Vue component system', () => {
  const globalCss = read('src/styles/global.css')
  const app = read('src/App.vue')

  for (const token of ['--accent: #007aff', '--accent-button-hover: color-mix(in srgb, var(--accent) 84%, white)', '--success: #037f0c', '--danger: #d91515', '--chart-1: #688ae8', '--chart-8: #096f64']) {
    assert.match(globalCss, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
  assert.match(app, /primaryColor: '#007aff'/)
  assert.match(app, /primaryColorHover: '#298fff'/)
  assert.match(globalCss, /--ff-heading: "Fraunces", "Source Han Serif SC", serif;/)
  assert.match(globalCss, /--ff-body: "Inter", "Resource Han Rounded CN", sans-serif;/)
  assert.match(globalCss, /--ff-mono: "Amazon Ember Mono"/)
  assert.match(globalCss, /--font-size-body: 14px;[\s\S]*?--line-height-body: 20px;/)
  assert.match(globalCss, /--r: 18px;[\s\S]*?--r-sm: 18px;[\s\S]*?--r-control: 18px;[\s\S]*?--r-overlay: 18px;[\s\S]*?--r-logo: 18px;[\s\S]*?--r-pill: 18px;/)
  assert.match(globalCss, /\.n-card \{\s*background: var\(--card\) !important;/)
  assert.match(read('src/components/BrandMark.vue'), /\/\* Logo \*\/[\s\S]*?border-radius: 8px !important;/)
  assert.match(app, /fontFamily: '"Inter", "Resource Han Rounded CN", sans-serif'/)
  assert.match(app, /borderRadius: '18px'/)
  assert.doesNotMatch(app, /@cloudscape-design\/components/)
  assert.match(globalCss, /\.n-button\.n-button--primary-type:not\(\.n-button--secondary\):not\(\.n-button--ghost\):not\(\.n-button--disabled\):hover \{\s*background: var\(--accent-button-hover\) !important;/)
})

test('custom scrollbar geometry keeps one stable centered slot across platforms', () => {
  const globalCss = read('src/styles/global.css')
  const app = read('src/App.vue')
  const scrollbar = read('src/components/PageScrollbar.vue')
  assert.match(globalCss, /--scrollbar-track-width: 16px;[\s\S]*?--scrollbar-thumb-width: 8px;/)
  assert.match(globalCss, /body \{[\s\S]*?padding-right: var\(--scrollbar-track-width\);[\s\S]*?scrollbar-width: none;[\s\S]*?\}/)
  assert.doesNotMatch(globalCss, /body \{[^}]*scrollbar-gutter: stable;/)
  assert.doesNotMatch(globalCss, /html\s*\{[^}]*scrollbar-gutter\s*:/)
  assert.match(globalCss, /body::-webkit-scrollbar \{ display: none; \}/)
  assert.match(globalCss, /html \{ scrollbar-width: none; \}[\s\S]*?html::-webkit-scrollbar \{ display: none; \}/)
  assert.match(app, /<PageScrollbar \/>/)
  assert.match(scrollbar, /position: fixed;[\s\S]*?width: var\(--scrollbar-track-width\);[\s\S]*?border-left: 1px solid var\(--border-strong\);/)
  assert.match(scrollbar, /left: 0;[\s\S]*?right: 0;[\s\S]*?width: var\(--scrollbar-thumb-width\);[\s\S]*?margin-inline: auto;/)
  assert.match(scrollbar, /:style="\{ height: `\$\{thumbHeight\}px`, transform: `translateY\(\$\{thumbTop\}px\)` \}"/)
  assert.match(scrollbar, /document\.body\.scrollTop \|\| document\.documentElement\.scrollTop \|\| window\.scrollY/)
  assert.match(scrollbar, /document\.body\.addEventListener\('scroll', scheduleSync/)
  assert.match(scrollbar, /document\.body\.scrollTo\(/)
  assert.match(scrollbar, /background: #c7c7c7;[\s\S]*?background: #a8a8a8;/)
  assert.match(scrollbar, /appearance: none;[\s\S]*?-webkit-appearance: none;[\s\S]*?touch-action: none;/)
  assert.match(globalCss, /#app \{[\s\S]*?isolation: isolate;[\s\S]*?min-height: 100vh;/)
  assert.match(read('src/components/AppHeader.vue'), /width: 100%;[\s\S]*?max-width: 100%;[\s\S]*?transition: background-color[\s\S]*?backdrop-filter: var\(--topbar-backdrop-filter\);/)
  assert.match(read('src/components/DashboardLayout.vue'), /width: 100%; max-width: 100%;[\s\S]*?transition: background-color[\s\S]*?backdrop-filter: var\(--topbar-backdrop-filter\);/)
  assert.match(read('src/components/AppHeader.vue'), /z-index: 130;/)
  assert.match(read('src/components/DashboardLayout.vue'), /position: sticky; top: 0; z-index: 130;/)
  assert.match(globalCss, /\.n-tooltip\.n-popover,[\s\S]*?--n-color: var\(--text\) !important;[\s\S]*?--n-text-color: #fff !important;[\s\S]*?z-index: 2000 !important;[\s\S]*?background: var\(--text\) !important;/)
})

test('Shift5 owns page lifecycle motion while dashboard child routes keep the chrome mounted', () => {
  const shift5 = read('src/utils/shift5.ts')
  const router = read('src/router/index.ts')
  const app = read('src/App.vue')
  const layout = read('src/components/DashboardLayout.vue')
  const globalCss = read('src/styles/global.css')
  assert.match(shift5, /clipPath: 'inset\(0 0 100% 0\)'[\s\S]*duration: 1008/)
  assert.match(shift5, /\.page-title, \.hero-title, \.page-sub, \.hero-sub, \.settings-section-head > h3, \.settings-section-head > p/)
  assert.match(shift5, /const titleSet = new Set\(titleNodes\)/)
  assert.match(shift5, /const blocks = collectBlocks\(root\)[\s\S]*document\.documentElement\.classList\.remove\(PENDING_CLASS\)[\s\S]*root\.classList\.remove\('qz-shift5-enter-pending'\)[\s\S]*const titleNodes = collectShift5TitleNodes\(root\)/)
  assert.match(shift5, /titleNodes\.forEach\(\(node, titleIndex\) => \{[\s\S]*delay: 176 \+ titleIndex \* 16/)
  assert.match(shift5, /function prepareEnter\(root: HTMLElement \| null\)[\s\S]*qz-shift5-enter-pending/)
  assert.match(shift5, /function lockScope\(scope: 'full' \| 'content' \| 'settings', host: HTMLElement \| null\)[\s\S]*host\.classList\.add\('qz-shift5-enter-pending'\)/)
  assert.match(shift5, /const host = scope === 'content'[\s\S]*lockScope\(scope, host\)[\s\S]*ensureOverlay\('leaving', host\)/)
  assert.match(globalCss, /\.qz-shift5-enter-pending \{ visibility: hidden !important; \}/)
  assert.match(shift5, /startShift5Leave\(scope: 'full' \| 'content' \| 'settings' = 'full'\)/)
  assert.match(shift5, /\['content', 'settings'\]\.includes\(activeScope\) \? root : null/)
  assert.match(router, /startShift5Leave\(settingsSectionChange \? 'settings' : sameDashboardShell \? 'content' : 'full'\)/)
  assert.match(layout, /<aside v-if="!isMobile" class="app-sider sidebar-surface"/)
  assert.match(layout, /<header class="layout-header" :class="\{ 'is-scrolled': isScrolled, 'is-menu-open': openMenu !== null \}"/)
  assert.match(layout, /<div ref="routeShell" :key="viewRoute\.path" class="route-page-shell">/)
  assert.match(layout, /useShift5PageTransition\(routeShell, \(\) => route\.fullPath, \(\) => route\.name !== 'admin-settings'\)/)
  const settings = read('src/views/AdminSettings.vue')
  assert.match(settings, /<main ref="settingsMain" class="settings-main">/)
  assert.match(settings, /useShift5PageTransition\(settingsMain, \(\) => route\.fullPath, \(\) => route\.name === 'admin-settings'\)/)
  assert.match(app, /useShift5PageTransition\([\s\S]*route\.matched\[0\]\?\.name === 'monitor'/)
  assert.match(app, /const authRouteNames = new Set\(\['login', 'register', 'forgot-password'\]\)/)
  assert.match(app, /return authRouteNames\.has\(name\) \? 'auth' : name/)
  assert.match(router, /const sameAuthShell = authRouteNames\.has\(String\(from\.name\)\)[\s\S]*?&& !sameAuthShell/)
  assert.match(globalCss, /\.qz-shift5-route-transition\.is-content\s*\{[\s\S]*inset: auto !important;/)
  assert.doesNotMatch(layout, /route-page-shell \{ animation: route-page-in/)
  assert.doesNotMatch(read('src/views/Monitor.vue'), /animation: heroIn|animation: summaryIn|animation: panelIn|animation: cardIn/)
  assert.doesNotMatch(read('src/views/UserOrders.vue'), /animation: riseIn/)
  assert.doesNotMatch(read('src/views/UserPoints.vue'), /animation: riseIn/)
})

test('dashboard trend range uses the route-switch contract and brand uses display typography', () => {
  const dashboard = read('src/views/UserDashboard.vue')
  const layout = read('src/components/DashboardLayout.vue')
  assert.match(dashboard, /<!-- 路由切换组件：趋势范围使用独立指示面，不复用全局胶囊覆盖。 -->/)
  assert.match(dashboard, /class="trend-range-tabs route-switch"/)
  assert.match(dashboard, /--trend-indicator-x/)
  assert.match(dashboard, /moveTrendIndicatorFromEvent/)
  assert.match(dashboard, /\.trend-range-tabs::before[\s\S]*?transform:translateX\(var\(--trend-indicator-x\)\)/)
  assert.match(layout, /\.brand-text \{[\s\S]*?font-family: var\(--ff-heading\);[\s\S]*?font-size: 16px;[\s\S]*?line-height: 20px;[\s\S]*?letter-spacing: 0;/)
  const globalCss = read('src/styles/global.css')
  assert.match(globalCss, /\.page-title \{[\s\S]*?font-size: 24px;[\s\S]*?letter-spacing: 0;[\s\S]*?line-height: 1\.25;/)
  assert.match(globalCss, /\.n-card > \.n-card-header \.n-card-header__main \{[\s\S]*?letter-spacing: 0;/)
  assert.match(dashboard, /\.page-title\{font-size:24px;line-height:30px;font-weight:500;margin-bottom:4px\}/)
  assert.match(dashboard, /\.sec-title\{font-weight:650;font-size:16px;line-height:20px;letter-spacing:0\}/)
})

test('dashboard and subscription actions share the same Sub2 button contract', () => {
  const dashboard = read('src/views/UserDashboard.vue')
  const subscription = read('src/views/UserSub.vue')
  const globalCss = read('src/styles/global.css')
  assert.match(dashboard, /class="action-button action-button--normal"/)
  assert.match(dashboard, /class="action-button action-button--emphasis"/)
  assert.match(subscription, /普通按钮：复用控制台“订阅管理”的尺寸、文字和中性 ring。[\s\S]*?class="action-button action-button--normal"[^>]*>订单记录/)
  assert.match(subscription, /强调按钮：复用控制台“去商城”的蓝色与提亮悬浮状态。[\s\S]*?class="action-button action-button--emphasis"[^>]*>去商城/)
  assert.match(globalCss, /\.n-button\.action-button \{[\s\S]*?min-height:32px !important;[\s\S]*?height:32px;[\s\S]*?border-radius:8px !important;[\s\S]*?font-size:13px/)
  assert.match(globalCss, /\.n-button\.action-button--normal \{[\s\S]*?--action-button-fg: var\(--text-3\);[\s\S]*?--action-button-fg-hover: var\(--text-2\);[\s\S]*?box-shadow:0 0 0 1px var\(--action-button-border\) !important;/)
  assert.match(globalCss, /\.n-button\.action-button--normal \{[^}]*--n-border: 0 solid transparent !important;[^}]*--n-border-hover: 0 solid transparent !important;[^}]*--n-border-focus: 0 solid transparent !important;/)
  assert.match(globalCss, /\.n-button\.action-button--normal:hover:not\(\.n-button--disabled\), \.n-button\.action-button--normal:focus-visible:not\(\.n-button--disabled\) \{[\s\S]*?box-shadow:0 0 0 2px var\(--action-button-border-hover\) !important;/)
  assert.match(globalCss, /\.n-button\.action-button--emphasis \{[\s\S]*?--action-button-bg: var\(--accent\);[\s\S]*?--action-button-bg-hover: var\(--accent-button-hover\);/)
  assert.match(globalCss, /\.n-button\.n-button--primary-type\.action-button--emphasis[^{}]*:hover, \.n-button\.n-button--primary-type\.action-button--emphasis[^{}]*:focus-visible \{[\s\S]*?background:var\(--action-button-bg-hover\) !important;/)
  assert.match(globalCss, /\.n-button\.action-button:active:not\(\.n-button--disabled\) \{ transform:translateY\(1px\) !important;/)
  assert.match(dashboard, /\/\* 普通按钮悬浮效果：复用控制台“订阅管理”的文字加深与中性 ring。 \*\//)
  assert.match(dashboard, /\.onboarding-strip button\{[\s\S]*?color:var\(--text-3\)/)
  assert.match(dashboard, /\.onboarding-strip button:hover,\.onboarding-strip button:focus-visible\{background:var\(--card\);color:var\(--text-2\);box-shadow:0 0 0 1px transparent,0 0 0 2px var\(--border-strong\) !important\}/)
  assert.match(dashboard, /\.onboarding-strip button:hover small,\.onboarding-strip button:focus-visible small\{color:var\(--text-2\)\}/)
  assert.match(dashboard, /\.trend-range-tabs\{--trend-indicator-x:4px;[\s\S]*?border-radius:16px!important;[\s\S]*?box-shadow:none/)
  assert.match(dashboard, /\.trend-range-tabs\{[\s\S]*?margin-left:16px;/)
  assert.match(dashboard, /\.trend-range-tabs::before\{[\s\S]*?top:4px;bottom:4px;[\s\S]*?border-radius:12px;[\s\S]*?transition:transform \.24s/)
  assert.match(dashboard, /\.trend-range-tabs :deep\(\.n-radio-button\)\{[\s\S]*?min-height:32px;[\s\S]*?border-radius:12px!important;/)
})

test('shop empty-state reload uses the shared normal button contract', () => {
  const shop = read('src/views/UserShop.vue')
  assert.match(shop, /普通按钮：复用全局 action-button 普通按钮样式。[\s\S]*?class="action-button action-button--normal"[^>]*>重新加载/)
  assert.match(shop, /\.balance-pill \{[\s\S]*?border:0;[\s\S]*?box-shadow:none;/)
  assert.match(shop, /\.shop-empty \{[\s\S]*?border:0;[\s\S]*?box-shadow:none;/)
  assert.match(shop, /\.shop-card \{[\s\S]*?border: 0;/)
  assert.match(shop, /\.shop-card:hover \{[\s\S]*?box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\)[\s\S]*?border-color: transparent;[\s\S]*?background: var\(--card\);/)
})

test('page-level primary actions use the shared highlighted arc button contract', () => {
  assert.match(read('src/views/UserOrders.vue'), /class="action-button action-button--emphasis"/)
  assert.match(read('src/views/UserOrders.vue'), />\s*去商城\s*<\/n-button>/)
  assert.match(read('src/views/AdminAnnouncements.vue'), /class="action-button action-button--emphasis"[^>]*>发布公告/)
  assert.match(read('src/views/AdminHelp.vue'), /class="action-button action-button--emphasis"[^>]*>\s*[\s\S]*新建文档/)
  assert.match(read('src/views/AdminPackages.vue'), /class="action-button action-button--emphasis"[^>]*>创建套餐/)
  assert.match(read('src/views/AdminUserGroups.vue'), /class="action-button action-button--emphasis"[^>]*>创建用户组/)
  assert.match(read('src/views/AdminServers.vue'), /class="action-button action-button--emphasis"[^>]*>添加服务器/)
  assert.match(read('src/views/AdminUsers.vue'), /class="action-button action-button--emphasis"[^>]*>[\s\S]*创建用户/)
})

test('help document toolbar joins its panel with a straight divider', () => {
  const source = read('src/views/AdminHelp.vue')
  assert.match(source, /\.document-panel \{[\s\S]*?overflow: hidden;/)
  assert.match(source, /\.document-toolbar \{[\s\S]*?border: 0;[\s\S]*?border-bottom: 1px solid var\(--border\);[\s\S]*?border-radius: 0 !important;/)
})

test('highlight arc buttons preserve native geometry and use the design blue', () => {
  const orders = read('src/views/UserOrders.vue')
  const update = read('src/views/AdminUpdate.vue')
  const sub = read('src/views/UserSub.vue')
  const globalCss = read('src/styles/global.css')

  assert.match(orders, /高亮弧边按钮：固定使用实心 Apple 蓝，悬浮\/聚焦时变深。[\s\S]*?type="primary" class="highlight-arc-button"[^>]*>去商城看看/)
  assert.match(sub, /高亮弧边按钮：固定使用实心 Apple 蓝，悬浮\/聚焦时变深。[\s\S]*?type="primary" class="highlight-arc-button"/)
  assert.match(update, /type="primary"[\s\S]*?class="highlight-arc-button"[\s\S]*?立即更新/)
  assert.doesNotMatch(orders, /class="[^"]*action-button--normal[^"]*"[^>]*>去商城看看/)
  assert.match(globalCss, /--accent: #007aff/)
  assert.match(globalCss, /固定实心 Apple 蓝/)
  assert.match(globalCss, /\.n-button\.n-button--primary-type\.highlight-arc-button \{[\s\S]*?background: var\(--accent\) !important;[\s\S]*?color: #fff !important;/)
  assert.doesNotMatch(globalCss, /\.n-button\.n-button--primary-type\.highlight-arc-button\.n-button--disabled \{/)
  assert.match(globalCss, /\.n-button\.action-button--normal \{[^}]*--n-border-hover: 0 solid transparent !important;[^}]*--n-border-focus: 0 solid transparent !important;/)
})

test('global selection treatment removes mouse blue borders but keeps keyboard focus', () => {
  const source = read('src/styles/global.css')
  assert.match(source, /--selection-bg: rgba\(0, 122, 255, \.2\)/)
  assert.match(source, /::selection \{ background: var\(--selection-bg\); color: inherit; \}/)
  assert.match(source, /::-moz-selection \{ background: var\(--selection-bg\); color: inherit; \}/)
  assert.match(source, /\.n-button\.n-button--primary-type\.n-button--secondary \{ box-shadow: inset 0 0 0 1px var\(--border-strong\); \}/)
  assert.match(source, /\.n-button:not\(\.n-button--disabled\):focus-visible \{ box-shadow: var\(--focus-ring\); \}/)
  assert.match(source, /\.n-button:not\(\.n-button--disabled\):focus:not\(:focus-visible\) \{ box-shadow: none !important; \}/)
  assert.doesNotMatch(source, /\.n-button:not\(\.n-button--disabled\):hover,\s*\.n-button:not\(\.n-button--disabled\):focus-visible \{ box-shadow: var\(--focus-ring\); \}/)
})

test('Sub2 font assets are bundled for the global typography roles', () => {
  for (const path of [
    'public/fonts/brand/Fraunces-Variable.ttf',
    'public/fonts/source-han/SourceHanSerifCN-VF.woff2',
    'public/fonts/brand/ResourceHanRoundedCN-Regular.woff2',
    'public/fonts/inter/Inter-18pt-Light.ttf',
  ]) assert.ok(readFileSync(new URL(`../${path}`, import.meta.url)).length > 0, path)
})

test('standalone auth pages keep the Cloudscape form contract and brand typography', () => {
  const globalCss = read('src/styles/global.css')
  const authPage = read('src/views/AuthPage.vue')
  const router = read('src/router/index.ts')
  const header = read('src/components/AppHeader.vue')
  assert.match(router, /path: '\/login'[\s\S]*?path: '\/register'[\s\S]*?path: '\/forgot-password'/)
  assert.match(authPage, /class="auth-page-shell"[\s\S]*?class="auth-aside"[\s\S]*?class="auth-main"/)
  assert.match(authPage, /本站服务条款与隐私说明/)
  assert.match(authPage, /config\.config\.registration_open/)
  assert.match(authPage, /config\.config\.email_enabled/)
  assert.match(authPage, /class="auth-fields"[\s\S]*?class="highlight-arc-button auth-submit"/)
  assert.match(authPage, /forgotFormRef[\s\S]*?forgotRules/)
  assert.match(authPage, /<router-link to="\/register" :class="\{ active: isRegister \}"/)
  assert.match(authPage, /height:28px;min-height:28px;margin-bottom:0;padding:6px 0/)
  assert.match(authPage, /<div v-if="isRegister && !config\.config\.registration_open" class="auth-notice"/)
  assert.match(authPage, /register_mode === 'code'/)
  assert.match(authPage, /watch\(\(\) => route\.name, resetAuthForms\)/)
  assert.match(authPage, /async function submit\(\)[\s\S]*?formRef\.value\?\.validate\(\)[\s\S]*?catch \{ return \}/)
  assert.doesNotMatch(authPage, /<n-modal|LoginDialog/)
  assert.match(authPage, /\.auth-page-shell\{[\s\S]*?min-height:100dvh;/)
  assert.match(authPage, /\.auth-fields :deep\(\.n-form-item-feedback-wrapper\)\{box-sizing:border-box;height:28px;min-height:28px;margin-bottom:0;padding:6px 0;/)
  assert.match(header, /品牌标识：公共顶栏与其他页面侧栏复用同一品牌层级，保留顶栏原有位置。/)
  assert.match(header, /class="logo"><BrandMark :size="40" \/><\/div>[\s\S]*?class="brand-copy"[\s\S]*?class="brand-text"[\s\S]*?class="brand-caption">服务控制台/)
  assert.match(header, /\.brand-text \{[\s\S]*?font-family: var\(--ff-heading\);[\s\S]*?font-size: 16px;[\s\S]*?line-height: 20px;[\s\S]*?letter-spacing: 0;/)
  assert.match(header, /\.brand-caption \{[\s\S]*?color: var\(--text-3\);[\s\S]*?font-size: 12px;[\s\S]*?line-height: 16px;/)
})

test('highlight arc primary buttons use the darker hover contract', () => {
  const globalCss = read('src/styles/global.css')
  assert.match(globalCss, /--accent-arc-hover: #0068d7/)
  assert.match(globalCss, /\.n-button\.n-button--primary-type\.highlight-arc-button \{[\s\S]*?--n-color-hover: var\(--accent-arc-hover\) !important;[\s\S]*?background: var\(--accent\) !important;/)
  assert.match(globalCss, /\.n-button\.n-button--primary-type\.highlight-arc-button:not\(\.n-button--secondary\):not\(\.n-button--ghost\):not\(\.n-button--disabled\):hover,[\s\S]*?background: var\(--accent-arc-hover\) !important;[\s\S]*?border-color: var\(--accent-arc-hover\) !important;/)
})

test('online update keeps disabled buttons on the component default template', () => {
  const update = read('src/views/AdminUpdate.vue')
  const globalCss = read('src/styles/global.css')
  assert.match(update, /仅调整正常态；禁用态保留 Naive UI 默认样式，作为禁用态模板。/)
  assert.doesNotMatch(globalCss, /--highlight-arc-disabled-bg/)
})

test('switch controls keep state colors without a focus highlight border', () => {
  const settings = read('src/views/AdminSettings.vue')
  const globalCss = read('src/styles/global.css')
  assert.match(settings, /切换开关：邮箱验证仅使用开关自身状态色，不绘制额外高亮边框。[\s\S]*?<n-switch v-model:value="emailVerify" \/>/)
  assert.match(globalCss, /\/\* 切换开关：保留启用\/停用状态色，去掉 Naive UI rail 的焦点高亮边框。 \*\/[\s\S]*?\.n-switch:focus \.n-switch__rail,[\s\S]*?\.n-switch:focus-visible \.n-switch__rail \{\s*box-shadow: none !important;/)
})

test('select menus keep a neutral active border instead of the input focus highlight', () => {
  const settings = read('src/views/AdminSettings.vue')
  const globalCss = read('src/styles/global.css')
  assert.match(settings, /选择下拉菜单：点击时保持中性边框，不绘制填写框式高亮。[\s\S]*?<n-select v-model:value="freeGroupId"[^>]*placeholder="无计划用户可用的节点分组"/)
  assert.match(globalCss, /\/\* 选择下拉菜单：点击\/展开保持中性边框，不套用填写框的 Apple 蓝高亮。 \*\/[\s\S]*?\.n-base-selection:not\(\.n-base-selection--disabled\)\.n-base-selection--active \.n-base-selection__border,[\s\S]*?border: 1px solid #d1cfc5 !important;[\s\S]*?box-shadow: none !important;/)
})

test('copy fields stay neutral when a readonly value receives focus', () => {
  const globalCss = read('src/styles/global.css')
  const subscription = read('src/views/UserSub.vue')
  assert.match(subscription, /<n-input-group class="subscription-link-group copy-field">[\s\S]*?<n-input :value="selectedSubscriptionURL" readonly/)
  assert.match(globalCss, /\/\* 复制栏：只读内容不是填写框[\s\S]*?--n-border-focus: 1px solid #d1cfc5 !important;[\s\S]*?--n-color-focus: #ffffff !important;[\s\S]*?--n-box-shadow-focus: none !important;[\s\S]*?transition: none !important;/)
  assert.match(globalCss, /\.copy-field \.n-input \.n-input__border,[\s\S]*?border-color: #d1cfc5 !important;[\s\S]*?box-shadow: none !important;/)
  assert.match(globalCss, /\.copy-field \.n-input:focus-within \.n-input__border,[\s\S]*?border: 1px solid #d1cfc5 !important;[\s\S]*?box-shadow: none !important;/)
})

test('settings navigation reuses the sidebar internal surface without an outer frame', () => {
  const settings = read('src/views/AdminSettings.vue')
  const globalCss = read('src/styles/global.css')
  assert.match(settings, /\.settings-nav \{[\s\S]*?padding:0; border:0; border-radius:0; background:transparent; box-shadow:none;/)
  assert.match(settings, /\.settings-nav button:hover \{ color:var\(--text\); background:var\(--card-hover\); \}/)
  assert.match(settings, /\.settings-nav button\.active \{ color:var\(--text\); background:var\(--card-hover\); \}/)
  assert.doesNotMatch(settings, /\.settings-nav button\.active::before/)
  assert.match(globalCss, /\.sidebar-menu \.n-menu-item-content:hover::before \{[\s\S]*?box-shadow: none !important;/)
  assert.match(globalCss, /\.sidebar-menu \.n-submenu-children \{[\s\S]*?position: relative !important;[\s\S]*?margin: 2px 0 2px 12px !important;[\s\S]*?padding-left: 16px !important;[\s\S]*?border-left: 0 !important;/)
  assert.match(globalCss, /\.sidebar-menu \.n-submenu-children::before \{[\s\S]*?left: 8px;[\s\S]*?width: 1px;[\s\S]*?background: var\(--sidebar-border\);/)
})

test('account page primary actions share the highlighted arc button contract', () => {
  const account = read('src/views/UserAccount.vue')
  const oauthAccount = read('src/components/OAuth2Account.vue')
  for (const label of ['绑定邮箱', '生成绑定链接', '修改密码']) {
    assert.match(account, new RegExp(`高亮弧边按钮：账户页主动作统一使用实心 Apple 蓝及深蓝悬浮态。[\\s\\S]*?class="highlight-arc-button"[^>]*>${label}`))
  }
  assert.match(oauthAccount, /高亮弧边按钮：账户页认证中心绑定主动作复用统一主按钮样式。[\s\S]*?class="highlight-arc-button"[^>]*>前往认证中心绑定/)
  assert.match(account, /<n-button v-if="auth\.user\?\.email && !auth\.user\?\.email_verified" :loading="resending" @click="handleResendVerify">发送验证邮件<\/n-button>/)
  assert.match(account, /<n-button size="small" @click="handleUnbindTg">解除绑定<\/n-button>/)
})

test('settings save uses the highlighted arc button contract', () => {
  const settings = read('src/views/AdminSettings.vue')
  assert.match(settings, /高亮弧边按钮：保存设置是当前设置面板的主动作，复用统一实心 Apple 蓝样式。[\s\S]*?<n-button type="primary" class="highlight-arc-button"[^>]*>保存设置<\/n-button>/)
  assert.match(settings, /<n-button :disabled="saving" @click="confirmDiscardChanges">放弃更改<\/n-button>/)
})

test('discard settings dialog does not autofocus its continue action', () => {
  const settings = read('src/views/AdminSettings.vue')
  assert.match(settings, /function confirmDiscardChanges\(\) \{[\s\S]*?negativeText: '继续编辑',[\s\S]*?autoFocus: false,[\s\S]*?onPositiveClick: discardChanges/)
})

test('settings dirty action bar stays flat without an outer shadow', () => {
  const settings = read('src/views/AdminSettings.vue')
  assert.match(settings, /\.settings-actions \{[\s\S]*?border:1px solid var\(--border-strong\);[\s\S]*?background:var\(--card\); box-shadow:none;/)
})

test('SMTP and Telegram unavailable notices use the shared info surface', () => {
  const settings = read('src/views/AdminSettings.vue')
  assert.match(settings, /<InfoNotice v-if="!smtpConfigured" class="info-notice--settings">/)
  assert.match(settings, /<InfoNotice v-if="!telegramConfigured" class="info-notice--settings">/)
  assert.doesNotMatch(settings, /\.warn-box\s*\{|class="warn-box"/)
})

test('project hyperlinks use the shared Apple blue contract', () => {
  const globalCss = read('src/styles/global.css')
  const update = read('src/views/AdminUpdate.vue')
  const settings = read('src/views/AdminSettings.vue')
  const dashboard = read('src/views/UserDashboard.vue')
  const account = read('src/views/UserAccount.vue')
  const certs = read('src/views/AdminCerts.vue')
  assert.match(globalCss, /项目超链接：所有可导航文本链接统一使用 Apple 蓝[，,]悬浮沿用全局交互蓝。[\s\S]*?a \{ color: var\(--accent\);/)
  assert.match(globalCss, /项目超链接：Markdown 正文链接同样固定为 Apple 蓝。[\s\S]*?\.md a \{ color: var\(--accent\);/)
  assert.match(globalCss, /项目超链接：组件化 router-link \/ tag="a" 也复用同一 Apple 蓝。[\s\S]*?\.project-link \{ color: var\(--accent\) !important; \}/)
  assert.match(update, /项目超链接：发布页入口使用全局 Apple 蓝链接合同。[\s\S]*?<a[^>]*class="release-link"/)
  assert.match(update, /项目超链接：更新发布页链接常态 Apple 蓝[，,]悬浮使用交互态蓝。[\s\S]*?\.release-link \{[^}]*color: var\(--accent\);/)
  assert.match(settings, /项目超链接：设置说明中的外部服务链接统一使用 Apple 蓝。/)
  assert.match(settings, /项目超链接：Cloudflare 文档入口统一使用 Apple 蓝。/)
  assert.match(settings, /项目超链接：GitHub 令牌入口统一使用 Apple 蓝。/)
  assert.match(settings, /\.form-hint a \{ color: var\(--accent\); \}/)
  assert.match(settings, /\.cf-guide a \{ color: var\(--accent\); \}/)
  assert.match(dashboard, /项目超链接：用户控制台内的导航链接统一使用 Apple 蓝。[\s\S]*?a\{color:var\(--accent\)\}/)
  assert.match(account, /项目超链接：账户页外部 Telegram 入口使用统一 Apple 蓝链接合同。[\s\S]*?tag="a" class="project-link"/)
  assert.match(certs, /项目超链接：证书配置入口使用统一 Apple 蓝链接合同。[\s\S]*?<router-link[^>]*class="project-link"/)
  assert.doesNotMatch(certs, /router-link[^>]*style="color:var\(--primary\)/)
})

test('data table headers match module surfaces and rows use the shared neutral hover', () => {
  const globalCss = read('src/styles/global.css')
  assert.match(globalCss, /\.n-data-table \.n-data-table-th \{ background: var\(--card\) !important; font-weight: 600; \}/)
  assert.match(globalCss, /\.n-data-table \.n-data-table-tr:hover \.n-data-table-td \{ background: var\(--card-hover\) !important; \}/)
  assert.doesNotMatch(globalCss, /\.n-data-table \.n-data-table-tr:hover \.n-data-table-td \{ background: var\(--accent-subtle\)/)
})

test('all secondary route switches share the non-clipping tab contract', () => {
  const globalCss = read('src/styles/global.css')
  assert.match(globalCss, /\/\* 二级切换路由：活动线由活动页签自身绘制，避免导航滚动层裁切边缘。 \*\//)
  assert.match(globalCss, /\.n-tabs\.route-switch-2 \{[\s\S]*?background: var\(--card\);/)
  assert.match(globalCss, /二级切换路由：导航文字与活动线保留独立水平留白，避免首个页签贴住外轨左边。[\s\S]*?\.n-tabs\.route-switch-2 \.n-tabs-nav-scroll-content \{[\s\S]*?padding-inline: 8px;/)
  assert.match(globalCss, /二级切换路由：窄屏页签保留原生横向滚动，不把超出内容直接绘制到视口外。[\s\S]*?\.n-tabs\.route-switch-2 \.n-tabs-nav-scroll-wrapper \{[\s\S]*?width: 100%;[\s\S]*?overflow-x: auto !important;[\s\S]*?overflow-y: hidden !important;/)
  assert.match(globalCss, /\.n-tabs\.route-switch-2 \.n-tabs-nav-scroll-wrapper \{[\s\S]*?border-radius: 0 !important;/)
  assert.match(globalCss, /二级切换路由：竖屏页签使用类似系统设置的独立横向滚动轨道。[\s\S]*?@media \(max-width: 768px\)[\s\S]*?scrollbar-width: thin;[\s\S]*?::-webkit-scrollbar \{[\s\S]*?height: 4px;/)
  assert.match(globalCss, /Naive UI 的 shadow-start\/end 是浮层渐变，不属于二级页签的独立滚动轨道。[\s\S]*?\.n-tabs\.route-switch-2 \.n-tabs-nav-scroll-wrapper::before,[\s\S]*?box-shadow: none !important;/)
  assert.match(globalCss, /二级切换路由：整条所属模块轨道先绘制中性基线，活动蓝线覆盖对应页签区段。[\s\S]*?\.n-tabs\.route-switch-2 \.n-tabs-nav::after \{[\s\S]*?right: 8px;[\s\S]*?left: 8px;[\s\S]*?height: 1px;[\s\S]*?background: var\(--border\);/)
  assert.match(globalCss, /\.n-tabs\.route-switch-2 \.n-tabs-tab--active::after \{[\s\S]*?z-index: 2;/)
  assert.match(globalCss, /\.n-tabs\.route-switch-2 \.n-tabs-tab--active::after \{[\s\S]*?border: 0;[\s\S]*?border-radius: 0 !important;[\s\S]*?clip-path: none;[\s\S]*?transform: none;/)
  assert.match(globalCss, /\.n-tabs\.route-switch-2 \.n-tabs-tab--active::after \{[\s\S]*?width: 100%;[\s\S]*?box-sizing: border-box;/)
  assert.match(globalCss, /二级切换路由：活动态只有底部指示线，禁止组件默认的侧边伪元素\/阴影。[\s\S]*?\.n-tabs\.route-switch-2 \.n-tabs-tab::before,[\s\S]*?border-inline-start: 0 !important;[\s\S]*?box-shadow: none !important;/)
  assert.match(read('src/views/AuthPage.vue'), /\.auth-mode-nav a\{[\s\S]*?border-inline-start:0;[\s\S]*?\.auth-mode-nav a::before\{display:none;content:none\}/)
  assert.match(globalCss, /滚动条占用 wrapper 底部空间时，基线仍与 33px 页签内容底边重合。[\s\S]*?\.n-tabs\.route-switch-2 \.n-tabs-nav::after \{[\s\S]*?bottom: 7px;/)
  assert.doesNotMatch(globalCss, /\.n-tabs\.route-switch-2\.auth-tabs \.n-tabs-nav::after \{ display: none; \}/)
  for (const path of ['src/views/AdminNodes.vue', 'src/views/AdminSingbox.vue']) {
    assert.match(read(path), /二级切换路由：活动线由活动页签自身绘制/)
    assert.match(read(path), /class="route-switch-2"/)
  }
  assert.match(read('src/views/AuthPage.vue'), /class="auth-mode-nav"/)
  assert.match(globalCss, /\.n-tabs\.route-switch-2 \.n-tabs-nav::after \{[\s\S]*?background: var\(--border\);/)
})

test('public and dashboard topbar navigation copy the Sub2 language-control geometry', () => {
  const header = read('src/components/AppHeader.vue')
  const dashboardLayout = read('src/components/DashboardLayout.vue')
  const hoverMenu = read('src/components/TopbarHoverMenu.vue')
  assert.equal((header.match(/TopbarHoverMenu/g) || []).length, 6)
  assert.equal((header.match(/header-dropdown-trigger/g) || []).length, 2)
  assert.equal((header.match(/class="header-nav-trigger/g) || []).length, 3)
  assert.match(header, /悬浮下拉菜单：管理入口与账户入口共用同一菜单圆角合同。/)
  assert.match(header, /悬浮下拉菜单：账户入口与管理入口共用同一菜单圆角合同。/)
  assert.match(header, /:open="openMenu === 'admin'"[^>]*@open="setMenuOpen\('admin', true\)"[^>]*@close="setMenuOpen\('admin', false\)"/)
  assert.match(header, /:open="openMenu === 'account'"[^>]*@open="setMenuOpen\('account', true\)"[^>]*@close="setMenuOpen\('account', false\)"/)
  assert.match(header, /悬浮下拉菜单：共享一个打开状态，忽略旧菜单迟到的关闭事件，避免切换闪烁。/)
  assert.match(header, /type HeaderMenu = 'admin' \| 'account'[\s\S]*?useMutualHoverMenu<HeaderMenu>\(\)/)
  assert.match(read('src/utils/topbar-menu.ts'), /const openMenu = ref<T \| null>\(null\)[\s\S]*?function setMenuOpen\(menu: T, show: boolean\)[\s\S]*?if \(show\) \{[\s\S]*?openMenu\.value = menu[\s\S]*?\} else if \(openMenu\.value === menu\)/)
  assert.equal((header.match(/topbar-language-reference-trigger/g) || []).length, 3)
  assert.match(header, /class="header-nav-trigger header-dropdown-trigger topbar-language-reference-trigger topbar-account-trigger"/)
  assert.equal((dashboardLayout.match(/TopbarHoverMenu/g) || []).length, 6)
  assert.equal((dashboardLayout.match(/topbar-language-reference-trigger/g) || []).length, 2)
  assert.match(dashboardLayout, /TopbarHoverMenu[\s\S]*?<template #trigger>[\s\S]*?dashboard-dropdown-trigger topbar-language-reference-trigger[\s\S]*?<\/template>/)
  assert.match(dashboardLayout, /TopbarHoverMenu[\s\S]*?<template #trigger>[\s\S]*?topbar-account-trigger[\s\S]*?<\/template>/)
  assert.match(dashboardLayout, /class="account-button dashboard-dropdown-trigger topbar-language-reference-trigger topbar-account-trigger"/)
  const globalCss = read('src/styles/global.css')
  assert.match(globalCss, /\.n-button\.topbar-language-reference-trigger \{[\s\S]*?min-height: 32px !important;[\s\S]*?padding: 0 10px !important;[\s\S]*?border: 1px solid var\(--border\) !important;[\s\S]*?border-radius: 12px !important;[\s\S]*?font-size: 13px !important;[\s\S]*?font-weight: 500 !important;[\s\S]*?line-height: 20px !important;/)
  assert.match(globalCss, /\.n-button\.topbar-language-reference-trigger \.n-button__border,[\s\S]*?border: 1px solid var\(--border\) !important;/)
  assert.match(globalCss, /\.n-button\.n-button--quaternary-type\.topbar-language-reference-trigger \{[\s\S]*?--n-color: var\(--topbar-background\) !important;[\s\S]*?--n-color-hover: var\(--card-hover\) !important;[\s\S]*?--n-color-focus: var\(--card-hover\) !important;/)
  assert.match(globalCss, /\.n-button\.n-button--quaternary-type\.topbar-language-reference-trigger \{[\s\S]*?background-color: var\(--topbar-background\) !important;/)
  assert.match(globalCss, /\.n-button\.n-button--quaternary-type\.topbar-language-reference-trigger:hover,[\s\S]*?background-color: var\(--card-hover\) !important;/)
  assert.match(read('src/components/AppHeader.vue'), /class="app-header" :class="\{ 'is-scrolled': isScrolled, 'is-menu-open': openMenu !== null \}"/)
  assert.match(read('src/components/AppHeader.vue'), /background: var\(--topbar-background\);[\s\S]*?border-bottom: 1px solid var\(--topbar-divider\);[\s\S]*?\.app-header\.is-scrolled \{[\s\S]*?backdrop-filter: var\(--topbar-backdrop-filter\);/)
  assert.match(read('src/components/DashboardLayout.vue'), /<header class="layout-header" :class="\{ 'is-scrolled': isScrolled, 'is-menu-open': openMenu !== null \}"[\s\S]*?\.layout-header \{[\s\S]*?background: var\(--topbar-background\);[\s\S]*?border-bottom: 1px solid var\(--topbar-divider\);[\s\S]*?\.layout-header\.is-scrolled \{[\s\S]*?backdrop-filter: var\(--topbar-backdrop-filter\);/)
  assert.match(globalCss, /--topbar-background: rgba\(250, 250, 252, \.8\);[\s\S]*?--topbar-scrim-background: rgba\(250, 250, 252, \.8\);[\s\S]*?--topbar-scrim-background-fallback: rgba\(250, 250, 252, \.92\);[\s\S]*?--topbar-backdrop-filter: saturate\(180%\) blur\(20px\);[\s\S]*?--topbar-divider: rgba\(0, 0, 0, \.12\);/)
  assert.match(globalCss, /\.n-button\.topbar-language-reference-trigger \.n-button__content \{[\s\S]*?align-items: center !important;[\s\S]*?justify-content: center !important;/)
  assert.match(globalCss, /\.n-button\.topbar-account-trigger \{[\s\S]*?padding: 0 10px !important;/)
  assert.match(globalCss, /\.topbar-account-icon \{[\s\S]*?width: 18px;[\s\S]*?height: 18px;[\s\S]*?display: block;/)
  assert.match(globalCss, /\.topbar-account-trigger \.account-name \{[\s\S]*?font-family: var\(--ff-body\) !important;[\s\S]*?font-size: 13px !important;[\s\S]*?font-weight: 500 !important;[\s\S]*?line-height: 20px !important;[\s\S]*?letter-spacing: 0 !important;/)
  assert.doesNotMatch(dashboardLayout, /\.account-name \{[^}]*font-weight: 600/)
  assert.match(globalCss, /\.n-button\.topbar-language-reference-trigger \{[\s\S]*?background: var\(--topbar-background\) !important;/)
  assert.match(globalCss, /\.n-button\.topbar-language-reference-trigger \.n-button__icon \{ margin: 0 !important; \}/)
  assert.doesNotMatch(globalCss.match(/\.n-button\.topbar-language-reference-trigger \{([^}]*)\}/)?.[1] || '', /background:\s*var\(--card\)/)
  assert.match(globalCss, /\.topbar-hover-menu-panel \{[\s\S]*?left: 50%;[\s\S]*?border: 1px solid var\(--border\) !important;[\s\S]*?border-radius: 16px !important;[\s\S]*?background: var\(--bg\);[\s\S]*?transform: translateX\(-50%\);/)
  assert.match(globalCss, /\.topbar-hover-menu-option \{[\s\S]*?min-height: 40px;[\s\S]*?border-radius: 8px;[\s\S]*?padding: 8px 12px;/)
  assert.match(globalCss, /\.topbar-hover-menu-option:hover,[\s\S]*?background: var\(--card-hover\);/)
  assert.match(dashboardLayout, /\/\* 账户头像图标：保留独立的方形底，不参与触发器背景切换。 \*\//)
  assert.match(header, /class="topbar-account-icon"/)
  assert.match(dashboardLayout, /class="topbar-account-icon"/)
  assert.equal((dashboardLayout.match(/class="dashboard-dropdown-trigger/g) || []).length, 1)
  assert.equal((dashboardLayout.match(/class="account-button dashboard-dropdown-trigger topbar-language-reference-trigger topbar-account-trigger"/g) || []).length, 1)
  assert.match(dashboardLayout, /悬浮下拉菜单：管理入口复制 Sub2 语言切换的控件几何。/)
  assert.match(dashboardLayout, /:open="openMenu === 'admin'"[^>]*@open="setMenuOpen\('admin', true\)"[^>]*@close="setMenuOpen\('admin', false\)"/)
  assert.match(dashboardLayout, /:open="openMenu === 'account'"[^>]*@open="setMenuOpen\('account', true\)"[^>]*@close="setMenuOpen\('account', false\)"/)
  assert.match(globalCss, /顶栏悬浮菜单：复用 Anthropic Learn 的渐入与内容展开节奏；父级持有唯一 open 状态。/)
  assert.match(globalCss, /--topbar-menu-open-duration: 400ms;/)
  assert.match(globalCss, /--topbar-menu-dropdown-duration: 200ms;/)
  assert.match(globalCss, /\/\* 悬浮下拉菜单命中桥：面板与按钮保留 8px 视觉间距，经过空隙时仍留在同一悬浮区域。 \*\/[\s\S]*?\.topbar-hover-menu-hit-bridge \{[\s\S]*?top: 100%;[\s\S]*?width: var\(--topbar-menu-bridge-width, max\(100%, 160px\)\);[\s\S]*?height: 8px;/)
  assert.match(globalCss, /\.topbar-menu-enter-active \{[\s\S]*?transition: opacity var\(--topbar-menu-open-duration\)[\s\S]*?grid-template-rows var\(--topbar-menu-dropdown-duration\)/)
  assert.match(globalCss, /\.topbar-menu-leave-active \{[\s\S]*?transition: none;/)
  assert.match(hoverMenu, /<Transition name="topbar-menu"/)
  assert.match(hoverMenu, /:duration="\{ enter: 400, leave: 0 \}"/)
  assert.match(hoverMenu, /watch\(\(\) => props\.open/)
  assert.match(hoverMenu, /window\.innerWidth[\s\S]*?Math\.min\(Math\.max\(centeredLeft, gutter\), maxLeft\)/)
  assert.match(hoverMenu, /'--topbar-menu-top': `\$\{rootRect\.height \+ 8\}px`/)
  assert.match(globalCss, /\.topbar-hover-menu-panel\.is-positioned \{[\s\S]*?left: var\(--topbar-menu-left\);[\s\S]*?transform: none;/)
  assert.match(hoverMenu, /class="topbar-hover-menu-hit-bridge"[\s\S]*?aria-hidden="true"/)
  assert.match(globalCss, /\.topbar-hover-menu-hit-bridge \{[\s\S]*?height: 8px;[\s\S]*?pointer-events: auto;/)
  assert.match(globalCss, /\.topbar-hover-menu-hit-bridge\.is-positioned \{[\s\S]*?left: var\(--topbar-menu-left\);[\s\S]*?transform: none;/)
  assert.match(header, /TopbarHoverMenu v-if="auth\.isAdmin" :open="openMenu === 'admin'"/)
  assert.match(dashboardLayout, /TopbarHoverMenu :open="openMenu === 'admin'"/)
  assert.match(hoverMenu, /@pointerenter="openMenu"[\s\S]*?@pointerleave="scheduleClose"/)
  assert.match(hoverMenu, /function scheduleClose\(\) \{\s*closeMenu\(\)\s*\}/)
  assert.doesNotMatch(hoverMenu, /setTimeout\(closeMenu/)
  assert.match(dashboardLayout, /悬浮下拉菜单：共享一个打开状态，忽略旧菜单迟到的关闭事件，避免切换闪烁。/)
  assert.match(dashboardLayout, /type HeaderMenu = 'admin' \| 'account'[\s\S]*?useMutualHoverMenu<HeaderMenu>\(\)/)
  assert.match(read('src/utils/topbar-menu.ts'), /const openMenu = ref<T \| null>\(null\)[\s\S]*?function setMenuOpen\(menu: T, show: boolean\)/)
})

test('public header brand aligns to the sidebar left content rail', () => {
  const header = read('src/components/AppHeader.vue')
  assert.match(header, /\.app-header \{[\s\S]*?padding: 0 clamp\(16px, 4vw, 48px\) 0 16px;/)
  assert.match(header, /@media \(max-width: 640px\) \{[\s\S]*?\.app-header \{ width: 100%; max-width: 100%; padding: 0 12px 0 16px; \}/)
})

test('monitor summary SVGs are neutral and heatmap range uses the route-switch contract', () => {
  const monitor = read('src/views/Monitor.vue')
  assert.match(monitor, /\.summary-icon \{[^}]*background: var\(--bg-subtle\); color: var\(--text-2\);/)
  assert.match(monitor, /图标底框：42px 方形容器使用 12px 圆角[\s\S]*?\.summary-icon \{[^}]*border-radius: 12px !important;/)
  assert.doesNotMatch(monitor, /\.summary-icon\.i-(?:server|cpu|mem|disk|up|down)\s*\{[^}]*var\(--(?:accent|success)/)
  assert.match(monitor, /<!-- 路由切换组件：热力图时间范围使用跟随指示面，不包含状态图例。 -->/)
  assert.match(monitor, /class="heat-range route-switch"/)
  assert.match(monitor, /\.heat-range\.route-switch \{[^}]*border-radius: 16px !important;/)
  assert.match(monitor, /--heat-indicator-x/)
  assert.match(monitor, /moveHeatIndicatorFromEvent/)
  assert.match(monitor, /\.heat-range\.route-switch::before[\s\S]*?transform: translateX\(var\(--heat-indicator-x\)\)/)
  assert.match(monitor, /<span class="heat-legend">/)
  assert.match(monitor, /\.heat-range-btn:hover, \.heat-range-btn:focus-visible \{[\s\S]*?color: var\(--text\); background: transparent; box-shadow: none; outline: none; \}/)
  assert.match(monitor, /\.refresh-btn:hover:not\(:disabled\) \{[\s\S]*?color: var\(--text\); border-color: var\(--border-strong\); background: var\(--card\); box-shadow: 0 0 0 1px var\(--border-strong\); \}/)
  assert.match(monitor, /\.clock \{[\s\S]*?background: transparent; border: 0; border-radius: 0; box-shadow: none;/)
})

test('admin help metric SVGs use the neutral summary icon treatment', () => {
  const source = read('src/views/AdminHelp.vue')
  assert.match(source, /卡片 SVG：复用首页摘要图标的中性前景与灰色底框[\s\S]*?\.metric-icon \{[\s\S]*?color: var\(--text-2\) !important;[\s\S]*?background: var\(--bg-subtle\);/)
  assert.doesNotMatch(source, /\.metric-card\.success \.metric-icon/)
  assert.doesNotMatch(source, /\.metric-card\.draft \.metric-icon/)
})

test('admin monitor summary SVGs use the same neutral icon treatment', () => {
  const source = read('src/views/AdminMonitor.vue')
  assert.match(source, /卡片 SVG：与首页摘要图标及帮助文档统计卡统一使用中性前景和灰色底框[\s\S]*?\.sum-ic \{[\s\S]*?background: var\(--bg-subtle\); color: var\(--text-2\);/)
  assert.doesNotMatch(source, /class="sum-ic" style=/)
})

test('admin monitor heatmap header wraps controls below the title on narrow screens', () => {
  const source = read('src/views/AdminMonitor.vue')
  assert.match(source, /<n-card class="heatmap-card"[\s\S]*?<div class="heatmap-header-controls">/)
  assert.match(source, /\.heatmap-header-controls \{[\s\S]*?display: flex;[\s\S]*?flex-wrap: wrap;/)
  assert.match(source, /\.heatmap-card :deep\(\.n-card-header\) \{[\s\S]*?display: grid;[\s\S]*?grid-template-columns: minmax\(0, 1fr\);/)
  assert.match(source, /\.heatmap-card :deep\(\.n-card-header__main\),[\s\S]*?\.heatmap-card :deep\(\.n-card-header__extra\) \{[\s\S]*?width: 100%;[\s\S]*?min-width: 0;/)
})

test('admin users use neutral selected cards, semantic identity badges, and arc plan actions', () => {
  const source = read('src/views/AdminUsers.vue')
  assert.match(source, /区分-身份牌：使用 AWS 语义警告色底与白色文字[\s\S]*?class="identity-badge"[^>]*>管理员/)
  assert.match(source, /\.identity-badge \{ background: var\(--warn\) !important; color: #fff !important;/)
  assert.match(source, /\.ss-item \{[\s\S]*?background: var\(--card\); border: 0;[\s\S]*?\}/)
  assert.match(source, /\.ss-item\.on \{ border-color: transparent; background: var\(--card-hover\); box-shadow: none; \}/)
  assert.doesNotMatch(source, /\.ss-item\.on \{[^}]*var\(--accent\)/)
  assert.match(source, /可跳转展示卡片：进入该用户的套餐分配\/明细面板。[\s\S]*?class="uc-block uc-plans"/)
  assert.match(source, /可跳转套餐块：悬浮复用中性卡片悬浮面，不使用蓝色业务状态底。[\s\S]*?\.uc-plans:hover \{ background: var\(--card-hover\); border-color: transparent; \}/)
  assert.match(source, /高亮弧边按钮：固定实心 Apple 蓝，保留用户卡片原有 tiny 尺寸[\s\S]*?class="highlight-arc-button"[^>]*>套餐/)
})

test('sing-box machine groups use the page surface and neutral identity badges', () => {
  const source = read('src/views/AdminSingbox.vue')
  assert.equal((source.match(/class="identity-badge"/g) || []).length, 3)
  assert.match(source, /区分-身份牌：本机\/远程是位置身份，不使用状态色。/)
  assert.match(source, /\.identity-badge \{ background:var\(--card-hover\) !important; color:var\(--text-2\) !important; border-color:transparent !important;/)
  assert.match(source, /\.machine-list :deep\(\.n-collapse-item\) \{[\s\S]*?border: 0 !important;[\s\S]*?background: var\(--bg\);/)
  assert.match(source, /\.machine-list :deep\(\.n-collapse-item__content-inner\) \{[\s\S]*?background: var\(--bg\);/)
  assert.match(source, /\.machine-list \{ width: auto; margin-inline: 12px; \}/)
  assert.doesNotMatch(source, /\.machine-list :deep\(\.n-collapse-item--active > \.n-collapse-item__header\)/)
})

test('server version cards use dark status badges for missing traffic statistics', () => {
  const source = read('src/views/AdminServers.vue')
  assert.match(source, /<!-- 卡片-状态牌：无流量统计是能力状态，使用原文本次级色底与白字。 -->[\s\S]*?<n-tag v-if="n\.version && !n\.has_v2ray_api" size="tiny" :bordered="false" class="card-status-badge">无流量统计<\/n-tag>/)
  assert.match(source, /\.card-status-badge \{ background:var\(--text-2\) !important; color:#fff !important; border-color:transparent !important; font-weight:600; \}/)
  assert.doesNotMatch(source, /n\.version && !n\.has_v2ray_api" type="warning"/)
})

test('sing-box overview cards use neutral SVG icons instead of text glyphs', () => {
  const source = read('src/views/AdminSingbox.vue')
  assert.match(source, /展示卡片；卡片 SVG 统一使用中性前景与灰色底框/)
  assert.equal((source.match(/class="sb-icon"/g) || []).length, 5)
  assert.equal((source.match(/<svg aria-hidden="true"/g) || []).length, 5)
  assert.match(source, /卡片 SVG：统一中性前景与首页摘要卡同款灰色底框[\s\S]*?background:var\(--bg-subtle\); color:var\(--text-2\);/)
  assert.doesNotMatch(source, /class="sb-icon (?:mint|amber|violet|danger|ok)"/)
  assert.doesNotMatch(source, /<span class="sb-icon">(?:机|盾|入|出|同步)<\/span>/)
})

test('manual notification uses the shared info notice component', () => {
  const source = read('src/views/AdminManualNotifications.vue')
  const component = read('src/components/InfoNotice.vue')
  assert.match(source, /<InfoNotice class="info-notice--manual">[\s\S]*?非管理员用户/)
  assert.match(component, /class="info-notice" role="status"/)
  assert.match(component, /class="info-notice-icon" aria-hidden="true">!<\/span>/)
  assert.match(component, /border: 0;[\s\S]*?background: var\(--accent-soft\);[\s\S]*?box-shadow: none;/)
  assert.match(component, /background: var\(--accent\);[\s\S]*?color: #fff;/)
})

test('header login uses the shared emphasis button contract', () => {
  const header = read('src/components/AppHeader.vue')
  assert.match(header, /强调按钮：登录入口复用全局 action-button 强调按钮样式。[\s\S]*?class="action-button action-button--emphasis"[^>]*>[\s\S]*?登录/)
})

test('page-dimension switches are marked and share the route-switch geometry', () => {
  const globalCss = read('src/styles/global.css')
  const main = read('src/main.ts')
  assert.match(globalCss, /\/\* 路由切换组件：页面维度筛选与范围切换复用统一的 16px 外轨和 12px 选项几何。 \*\//)
  assert.match(globalCss, /\.n-radio-group\.route-switch \{[\s\S]*?border-radius: 16px !important;/)
  assert.match(globalCss, /\.n-radio-group\.route-switch::before[\s\S]*?transform: translateX\(var\(--route-indicator-x, 4px\)\)/)
  assert.match(globalCss, /\.n-radio-group\.route-switch \.n-radio-button \{[\s\S]*?display: inline-flex;[\s\S]*?align-items: center;[\s\S]*?min-height: 32px;[\s\S]*?line-height: 20px;[\s\S]*?border-radius: 12px !important;/)
  assert.match(main, /closest<HTMLElement>\('\.n-radio-group\.route-switch'\)/)
  assert.match(main, /document\.querySelectorAll<HTMLElement>\('\.n-radio-group\.route-switch'\)/)
  assert.doesNotMatch(main, /overview-range-tabs/)
  assert.match(main, /document\.addEventListener\('mouseover', moveRouteFromEvent\)/)
  for (const [path, marker] of [
    ['src/views/UserOrders.vue', '订单状态筛选改变当前列表维度'],
    ['src/views/UserPoints.vue', '积分收支筛选改变当前列表维度'],
    ['src/views/AdminUsers.vue', '套餐状态筛选改变当前用户套餐列表维度'],
    ['src/views/AdminMonitorDetail.vue', '监控详情时间范围改变图表查询维度'],
    ['src/components/AdminUsageReport.vue', '用量报表时间范围改变查询维度'],
  ]) {
    const source = read(path)
    assert.match(source, new RegExp(`路由切换组件：${marker}`), path)
    assert.match(source, /class="[^"]*route-switch/, path)
  }
  for (const [path, marker, className] of [
    ['src/views/AdminOverview.vue', '管理概览时间范围驱动整页统计查询', 'overview-range-tabs'],
    ['src/views/AdminMonitor.vue', '热力图时间范围改变监控查询维度', 'range-switch route-switch'],
    ['src/views/AdminHelp.vue', '帮助文档发布状态改变当前列表维度', 'status-switch route-switch'],
    ['src/views/AdminSettings.vue', 'Telegram 设置子分区切换当前配置面板', 'tg-subnav route-switch'],
  ]) {
    const source = read(path)
    assert.match(source, new RegExp(`路由切换组件：${marker}`), path)
    assert.match(source, new RegExp(`class="${className}"`), path)
  }
})

test('route switches avoid accent hover outlines and center button labels', () => {
  const globalCss = read('src/styles/global.css')
  const overview = read('src/views/AdminOverview.vue')
  const orders = read('src/views/AdminOrders.vue')
  const dashboard = read('src/views/UserDashboard.vue')
  assert.match(globalCss, /\.n-radio-group\.route-switch \.n-radio-button:hover \{\s*background: var\(--card\) !important;\s*color: var\(--text\) !important;/)
  assert.match(globalCss, /\.n-radio-group\.route-switch \.n-radio-button:focus-visible \{\s*background: transparent !important;\s*box-shadow: inset 0 0 0 2px rgba\(29,39,51,\.16\) !important;/)
  assert.doesNotMatch(overview, /overview-range-tabs \.n-radio-button:hover\)[\s\S]*?box-shadow: inset 0 0 0 2px var\(--accent\)/)
  assert.match(overview, /overview-range-tabs \.n-radio-button\) \{[\s\S]*?display: inline-flex;[\s\S]*?align-items: center;[\s\S]*?line-height: 20px;/)
  assert.match(orders, /\.seg-btn \{[\s\S]*?align-items: center;[\s\S]*?line-height: 20px;/)
  assert.match(dashboard, /\.trend-range-tabs :deep\(\.n-radio-button\)\{[\s\S]*?align-items:center;[\s\S]*?line-height:20px;/)
})

test('route indicators stay below option text and display cards use shadow-only hover', () => {
  const globalCss = read('src/styles/global.css')
  assert.match(globalCss, /\.n-radio-group\.route-switch::before \{[\s\S]*?z-index: 0;[\s\S]*?background: var\(--card\);/)
  assert.match(globalCss, /\.n-radio-group\.route-switch \.n-radio-button \{[\s\S]*?z-index: 1;/)
  assert.match(globalCss, /展示卡片统一悬浮合同[\s\S]*?box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\) !important;/)
})

test('global surfaces use the white, primary-module, and hover gray hierarchy', () => {
  const globalCss = read('src/styles/global.css')
  assert.match(globalCss, /--bg: #ffffff;/)
  assert.match(globalCss, /--bg-soft: #fafafa;/)
  assert.match(globalCss, /--bg-subtle: #f0f0f0;/)
  assert.match(globalCss, /--card: #fafafa;/)
  assert.match(globalCss, /--card-hover: #f0f0f0;/)
  assert.ok(globalCss.includes(':where(.route-switch)'))
  assert.ok(globalCss.includes('border: 0 !important;'))
  assert.ok(globalCss.includes('background: var(--bg-subtle) !important;'))
  assert.match(globalCss, /一级模块：容器与页面背景直接分层，不再绘制外框线/)
  assert.match(globalCss, /:where\(\.n-card, \.n-data-table, \.resource-metric, \.stat-card, \.list-card,[\s\S]*?border: 0 !important;/)
  assert.match(globalCss, /:where\(\.route-switch\) :where\(button, \.n-radio-button\) \{[\s\S]*?background: transparent !important;/)
  assert.match(globalCss, /\.n-base-selection \.n-base-selection-label[\s\S]*?color: var\(--text\) !important;/)
  assert.match(globalCss, /\.n-dialog \.n-dialog__content[\s\S]*?color: var\(--text\) !important;/)
})

test('primary modules do not draw borders while preserving route indicator ownership', () => {
  const dashboard = read('src/views/UserDashboard.vue')
  const statCard = read('src/components/StatCard.vue')
  const subscription = read('src/views/UserSub.vue')
  const monitor = read('src/views/Monitor.vue')
  assert.match(dashboard, /\.onboarding-strip\{[\s\S]*?border:0;[\s\S]*?background:var\(--card\);[\s\S]*?box-shadow:none\}/)
  assert.match(statCard, /background: var\(--card\); border: 0; border-radius: var\(--r\)/)
  assert.match(subscription, /min-width: 0; padding: 12px 14px; border: 0; border-radius: var\(--r\)/)
  assert.match(monitor, /\.heat-range-btn\.active \{ background: transparent !important;/)
})

test('large module surfaces use one flat borderless contract and preserve modal elevation', () => {
  const source = read('src/styles/global.css')
  assert.match(source, /\/\* 一级大模块：统一使用平面表面，不让各页面局部卡片恢复边框或阴影。 \*\/[\s\S]*?\.n-card, \[class\*="-card"\], \[class\*="-panel"\]/)
  assert.match(source, /一级大模块[\s\S]*?border: 0 !important;[\s\S]*?box-shadow: none !important;/)
  assert.match(source, /一级大模块[\s\S]*?focus-visible[\s\S]*?outline: 2px solid var\(--accent\) !important;/)
  assert.match(source, /\.n-modal \.n-card \{ border: 1px solid var\(--border\) !important; box-shadow: var\(--shadow-flyout\) !important; \}/)
})

test('Cloudscape chart palette is applied to representative user and admin charts', () => {
  for (const path of ['src/views/AdminOverview.vue', 'src/components/AdminUsageReport.vue', 'src/views/UserPoints.vue', 'src/views/UserOrders.vue']) {
    const source = read(path)
    assert.match(source, /#688ae8/)
    assert.match(source, /#2ea597/)
    assert.match(source, /#c33d69/)
    assert.match(source, /#dedee3/)
  }
})

test('ECharts uses one tree-shakable registry with only rendered chart features', () => {
  const registry = read('src/utils/echarts.ts')
  assert.match(registry, /from 'echarts\/core'/)
  assert.match(registry, /LineChart, BarChart, PieChart, HeatmapChart/)
  assert.match(registry, /GridComponent,[\s\S]*?LegendComponent,[\s\S]*?TitleComponent,[\s\S]*?TooltipComponent,[\s\S]*?VisualMapComponent,[\s\S]*?CanvasRenderer/)
  assert.doesNotMatch(registry, /DatasetComponent|TransformComponent/)
  for (const path of [
    'src/components/AdminUsageReport.vue',
    'src/components/TrafficTrendChart.vue',
    'src/views/AdminMonitorDetail.vue',
    'src/views/AdminMonitor.vue',
    'src/views/AdminOverview.vue',
    'src/views/AdminServers.vue',
    'src/views/Monitor.vue',
    'src/views/UserOrders.vue',
    'src/views/UserPoints.vue',
  ]) {
    assert.match(read(path), /import \* as echarts from '@\/utils\/echarts'/, path)
    assert.doesNotMatch(read(path), /import \* as echarts from 'echarts'/, path)
  }
})

test('shared resource metrics use the display-card hover treatment', () => {
  const source = read('src/styles/global.css')
  assert.match(source, /\/\* 展示卡片 \*\/[\s\S]*?\.resource-metric \{[\s\S]*?border:0;[\s\S]*?box-shadow:none;[\s\S]*?transition:box-shadow \.25s ease;/)
  assert.match(source, /\.resource-metric:hover, \.resource-metric:focus-visible \{[\s\S]*?border-color:transparent; background:var\(--card\); box-shadow:0 8px 28px rgba\(0, 0, 0, 0\.08\);/)
})

test('monitor summary cards use the display-card hover treatment', () => {
  const source = read('src/views/Monitor.vue')
  assert.match(source, /\.summary-card \{[\s\S]*?box-shadow: none; transition: box-shadow \.25s ease; transform: none; opacity: 1;/)
  assert.match(source, /\.summary-card:hover, \.summary-card:focus-visible \{[\s\S]*?background: var\(--card\);[\s\S]*?box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\);[\s\S]*?transform: none;/)
  assert.match(source, /展示卡片/)
  assert.match(source, /悬浮效果/)
})

test('user dashboard stat cards reuse the display-card hover treatment', () => {
  const source = read('src/components/StatCard.vue')
  const dashboard = read('src/views/UserDashboard.vue')
  assert.equal((dashboard.match(/<StatCard/g) || []).length, 4)
  assert.match(source, /\/\* 展示卡片 \*\/[\s\S]*?box-shadow: none; transition: box-shadow \.25s ease; transform: none; opacity: 1;/)
  assert.match(source, /\/\* 悬浮效果：悬停只增加阴影，纸面、边框和位置保持不变。 \*\/[\s\S]*?\.stat-card:hover, \.stat-card:focus-visible \{[\s\S]*?background: var\(--card\);[\s\S]*?box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\);[\s\S]*?transform: none;/)
  assert.doesNotMatch(source, /\.stat-card\.clickable:hover \{[\s\S]*?background: var\(--accent-subtle\)/)
})

test('subscription summary cards reuse the display-card hover treatment', () => {
  const source = read('src/views/UserSub.vue')
  assert.equal((source.match(/class="sub-stat"/g) || []).length, 4)
  assert.match(source, /\/\* 展示卡片 \*\/[\s\S]*?\.sub-stat \{[\s\S]*?box-shadow: none; transition: box-shadow \.25s ease; transform: none; opacity: 1;/)
  assert.match(source, /\/\* 悬浮效果：悬停只增加阴影，纸面、边框和位置保持不变。 \*\/[\s\S]*?\.sub-stat:hover, \.sub-stat:focus-visible \{[\s\S]*?background: var\(--card\);[\s\S]*?box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\);[\s\S]*?transform: none;/)
})

test('order summary cards reuse the display-card hover treatment', () => {
  const source = read('src/views/UserOrders.vue')
  assert.equal((source.match(/class="kpi-card"/g) || []).length, 4)
  assert.match(source, /\/\* 展示卡片 \*\/[\s\S]*?\.kpi-card \{[\s\S]*?box-shadow: none; transition: box-shadow \.25s ease; transform: none; opacity: 1;/)
  assert.match(source, /\/\* 悬浮效果：悬停只增加阴影，纸面、边框和位置保持不变。 \*\/[\s\S]*?\.kpi-card:hover, \.kpi-card:focus-visible \{[\s\S]*?background: var\(--card\);[\s\S]*?box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\);[\s\S]*?transform: none;/)
})

test('points summary cards reuse the display-card hover treatment', () => {
  const source = read('src/views/UserPoints.vue')
  assert.equal((source.match(/class="kpi-card"/g) || []).length, 4)
  assert.match(source, /\/\* 展示卡片 \*\/[\s\S]*?\.kpi-card \{[\s\S]*?box-shadow: none; transition: box-shadow \.25s ease; transform: none; opacity: 1;/)
  assert.match(source, /\/\* 悬浮效果：悬停只增加阴影，纸面、边框和位置保持不变。 \*\/[\s\S]*?\.kpi-card:hover, \.kpi-card:focus-visible \{[\s\S]*?background: var\(--card\);[\s\S]*?box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\);[\s\S]*?transform: none;/)
})

test('admin overview KPI cards reuse the display-card hover treatment', () => {
  const source = read('src/views/AdminOverview.vue')
  assert.match(source, /class="kpi"/)
  assert.match(source, /\/\* 展示卡片 \*\/[\s\S]*?\.kpi \{[\s\S]*?box-shadow: none; transition: box-shadow \.25s ease; transform: none; opacity: 1;/)
  assert.match(source, /\/\* 悬浮效果：悬停只增加阴影，纸面、边框和位置保持不变。 \*\/[\s\S]*?\.kpi:hover, \.kpi:focus-visible \{[\s\S]*?background: var\(--card\);[\s\S]*?box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\);[\s\S]*?transform: none;/)
})

test('admin user summary and user cards reuse the display-card hover treatment', () => {
  const source = read('src/views/AdminUsers.vue')
  assert.match(source, /class="ss-item"/)
  assert.match(source, /\/\* 展示卡片 \*\/[\s\S]*?\.ss-item \{[\s\S]*?box-shadow: none; transition: box-shadow \.25s ease; transform: none; opacity: 1;/)
  assert.match(source, /\/\* 悬浮效果：悬停只增加阴影，纸面、边框和位置保持不变。 \*\/[\s\S]*?\.ss-item:hover, \.ss-item:focus-visible \{[\s\S]*?background: var\(--card\);[\s\S]*?box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\);[\s\S]*?transform: none;/)
  assert.match(source, /\/\* 展示卡片 \*\/[\s\S]*?\.user-card \{[\s\S]*?box-shadow: none; transition: box-shadow \.25s ease; transform: none; opacity: 1;/)
  assert.match(source, /\/\* 悬浮效果：悬停只增加阴影，纸面、边框和位置保持不变。 \*\/[\s\S]*?\.user-card:hover, \.user-card:focus-visible \{[\s\S]*?background: var\(--card\);[\s\S]*?box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\);[\s\S]*?transform: none;/)
})

test('user-group summary cards reuse the display-card hover treatment', () => {
  const source = read('src/views/AdminUserGroups.vue')
  assert.equal((source.match(/group-summary-card/g) || []).length, 6)
  assert.match(source, /\/\* 展示卡片 \*\/[\s\S]*?\.group-summary-card \{[\s\S]*?box-shadow: none;[\s\S]*?transition: box-shadow \.25s ease;[\s\S]*?transform: none;[\s\S]*?opacity: 1;/)
  assert.match(source, /\/\* 悬浮效果：悬停只增加阴影，纸面、边框和位置保持不变。 \*\/[\s\S]*?\.group-summary-card:hover, \.group-summary-card:focus-visible \{[\s\S]*?background: var\(--card\);[\s\S]*?box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\);[\s\S]*?transform: none;/)
})

test('package summary cards reuse the display-card hover treatment', () => {
  const source = read('src/views/AdminPackages.vue')
  assert.equal((source.match(/package-summary-card/g) || []).length, 7)
  assert.match(source, /\/\* 展示卡片 \*\/[\s\S]*?\.package-summary-card \{[\s\S]*?box-shadow: none;[\s\S]*?transition: box-shadow \.25s ease;[\s\S]*?transform: none;[\s\S]*?opacity: 1;/)
  assert.match(source, /\/\* 悬浮效果：悬停只增加阴影，纸面、边框和位置保持不变。 \*\/[\s\S]*?\.package-summary-card:hover, \.package-summary-card:focus-visible \{[\s\S]*?background: var\(--card\);[\s\S]*?box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\);[\s\S]*?transform: none;/)
})

test('independent top summaries and admin order route switches use shared contracts', () => {
  const orders = read('src/views/AdminOrders.vue')
  assert.match(orders, /\/\* 展示卡片 \*\/[\s\S]*?\.stat-card \{[\s\S]*?box-shadow: none;[\s\S]*?transition: box-shadow \.25s ease;/)
  assert.match(orders, /\/\* 路由切换组件 \*\/[\s\S]*?\.seg\.route-switch::before[\s\S]*?--route-indicator-x[\s\S]*?transition: transform \.24s/)
  assert.match(orders, /@mouseover="moveStatusIndicatorFromEvent"/)
  assert.match(orders, /@mouseover="moveGroupIndicatorFromEvent"/)
  assert.match(orders, /\.seg\.route-switch[\s\S]*?--route-indicator-x: 4px;[\s\S]*?min-height: 40px;[\s\S]*?border-radius: 16px !important;/)
  assert.match(orders, /\.seg\.route-switch::before[\s\S]*?border-radius: 12px;[\s\S]*?transition: transform \.24s/)
  assert.match(orders, /\.seg-btn[\s\S]*?min-height: 32px;[\s\S]*?border-radius: 12px;/)
  for (const [path, selector] of [
    ['src/components/AdminUsageReport.vue', '.kpi'],
    ['src/views/AdminMonitor.vue', '.sum-card'],
    ['src/views/AdminMonitorDetail.vue', '.metric-card'],
    ['src/views/AdminHelp.vue', '.metric-card'],
  ]) {
    const source = read(path)
    assert.match(source, /\/\* 展示卡片 \*\//, path)
    assert.match(source, new RegExp(`${selector.replace('.', '\\.')}:hover, ${selector.replace('.', '\\.')}:focus-visible`), path)
    assert.match(source, /box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\)/, path)
  }
})

test('remaining display-card summaries use the same hover treatment', () => {
  const update = read('src/views/AdminUpdate.vue')
  assert.match(update, /\.ver-card \{[\s\S]*?border: 0;/)
  assert.match(update, /\.ver-card:hover, \.ver-card:focus-visible[\s\S]*?border-color: transparent; box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\);/)
  for (const [path, selector] of [
    ['src/views/AdminServers.vue', '.traffic-summary-card'],
  ]) {
    const source = read(path)
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    assert.match(source, /展示卡片/, path)
    assert.match(source, new RegExp(`${escaped}:hover, ${escaped}:focus-visible[\\s\\S]*?box-shadow: ?0 8px 28px rgba\\(0, 0, 0, 0\\.08\\)`), path)
  }
  const singbox = read('src/views/AdminSingbox.vue')
  assert.match(singbox, /\.sb-overview button \{[\s\S]*?border:0;[\s\S]*?box-shadow:none;/)
  assert.match(singbox, /\.sb-overview button:hover \{ background:var\(--card\); box-shadow:0 8px 28px rgba\(0, 0, 0, 0\.08\);/)
  assert.match(singbox, /\.sb-overview button:focus-visible \{ outline:2px solid var\(--accent\);/)
  assert.match(singbox, /\.sb-overview button:hover[^}]*box-shadow:\s*0 8px/)
  const global = read('src/styles/global.css')
  assert.match(global, /\/\* 展示卡片 \*\/[\s\S]*?\.stat-card \{[\s\S]*?box-shadow: none; transition: box-shadow \.25s ease;/)
  assert.match(global, /\/\* 悬浮效果：悬停只增加阴影，纸面、边框和位置保持不变。 \*\/[\s\S]*?\.stat-card:hover, \.stat-card:focus-visible[\s\S]*?box-shadow: 0 8px 28px rgba\(0, 0, 0, 0\.08\)/)
})

test('sing-box IP visibility uses the shared switch control contract', () => {
  const singbox = read('src/views/AdminSingbox.vue')
  const globalCss = read('src/styles/global.css')
  assert.match(singbox, /<!-- 切换开关：显示 IP 只切换地址打码状态，不使用按钮高亮或 warning 颜色。 -->[\s\S]*?<div class="ip-visibility-toggle">[\s\S]*?<span>显示 IP<\/span>[\s\S]*?<n-switch size="small" :value="showIp" aria-label="显示 IP" @update:value="setShowIp" \/>/)
  assert.match(singbox, /function setShowIp\(value: boolean\) \{[\s\S]*?showIp\.value = value[\s\S]*?localStorage\.setItem\(IP_KEY, showIp\.value \? '1' : '0'\)/)
  assert.match(singbox, /\.ip-visibility-toggle \{ display:flex; align-items:center; gap:8px; margin-left:auto;/)
  assert.match(globalCss, /\/\* 切换开关：保留启用\/停用状态色，去掉 Naive UI rail 的焦点高亮边框。 \*\/[\s\S]*?\.n-switch:focus-visible \.n-switch__rail \{\s*box-shadow: none !important;/)
})

test('update modules and markdown inline code use flat Cloudscape surfaces', () => {
  const update = read('src/views/AdminUpdate.vue')
  const infoNotice = read('src/components/InfoNotice.vue')
  const settings = read('src/views/AdminSettings.vue')
  const globalCss = read('src/styles/global.css')
  assert.match(update, /<InfoNotice v-if="info && info.update_available && !info.downloadable" class="info-notice--update">/)
  assert.match(update, /<InfoNotice v-else-if="selectedRelease\?\.relation === 'older'" class="info-notice--update">/)
  assert.match(update, /<InfoNotice class="info-notice--update-flow">/)
  assert.match(update, /import InfoNotice from '@\/components\/InfoNotice\.vue'/)
  assert.match(infoNotice, /\.info-notice--update \{ margin-top: 8px; \}/)
  assert.match(infoNotice, /\.info-notice--update-flow \{ margin-top: 16px; \}/)
  for (const selector of ['\\.progress-box', '\\.rb-box, \\.rel-box', '\\.changelog']) {
    assert.match(update, new RegExp(`${selector} \\{[\\s\\S]*?border: 0;[\\s\\S]*?box-shadow: none;`))
  }
  assert.match(update, /\.cl-head[\s\S]*?border-bottom: 0;/)
  assert.match(globalCss, /\.md code\.md-code \{[\s\S]*?background: var\(--bg-subtle\); border: 0; border-radius: 4px;[\s\S]*?font-family: var\(--ff-mono\);/)
  assert.match(settings, /普通按钮：安装命令复制动作不使用主色高亮。[\s\S]*?<n-button class="action-button action-button--normal" @click="copyInstall">复制<\/n-button>/)
})

test('select and dropdown menus share the topbar flyout contract', () => {
  const source = read('src/views/UserSub.vue')
  const singbox = read('src/views/AdminSingbox.vue')
  const update = read('src/views/AdminUpdate.vue')
  const notifications = read('src/views/AdminManualNotifications.vue')
  const users = read('src/views/AdminUsers.vue')
  const globalCss = read('src/styles/global.css')
  assert.match(source, /下拉选择菜单：弹层复用全局顶栏菜单合同；触发按钮保持原有尺寸与样式。/)
  assert.match(source, /下拉选择菜单：协议筛选弹层复用顶栏菜单合同/)
  assert.match(singbox, /下拉选择菜单：一键模板弹层复用顶栏菜单外框、配色与动效/)
  assert.match(singbox, /下拉选择菜单：挂出口的 popselect 弹层与全局 n-select 菜单统一/)
  assert.match(update, /下拉选择菜单：版本选择弹层复用顶栏菜单合同/)
  assert.match(notifications, /下拉选择菜单：用户选择弹层复用顶栏菜单合同/)
  assert.match(users, /下拉选择菜单：用户更多操作弹层复用顶栏菜单合同/)
  assert.doesNotMatch(source, /theme-overrides="routingSelectThemeOverrides"|routingSelectThemeOverrides/)
  assert.match(globalCss, /\/\* 下拉选择菜单：只重绘弹层本体，不触碰触发按钮；几何与顶栏悬浮菜单一致。 \*\/[\s\S]*?\.n-base-select-menu,[\s\S]*?\.n-dropdown-menu \{[\s\S]*?padding: 12px !important;[\s\S]*?background: var\(--bg\) !important;[\s\S]*?border: 1px solid var\(--border\) !important;[\s\S]*?border-radius: 16px !important;[\s\S]*?box-shadow: 0 4px 24px rgba\(0, 0, 0, \.05\) !important;/)
  assert.match(globalCss, /\.n-dropdown-option-body::before,[\s\S]*?\.n-base-select-option::before \{[\s\S]*?top: 3px !important;[\s\S]*?right: 3px !important;[\s\S]*?bottom: 3px !important;[\s\S]*?left: 3px !important;[\s\S]*?border-radius: 8px !important;[\s\S]*?background: transparent !important;/)
  assert.match(globalCss, /\.n-dropdown-option-body:hover::before,[\s\S]*?\.n-dropdown-option-body--pending::before,[\s\S]*?\.n-base-select-option:hover::before,[\s\S]*?\.n-base-select-option--pending::before \{[\s\S]*?background: var\(--card-hover\) !important;/)
  assert.match(globalCss, /\.n-dropdown-option-body--active::before,[\s\S]*?\.n-base-select-option--selected::before \{[\s\S]*?background: var\(--card-hover\) !important;/)
  assert.match(globalCss, /\.n-base-select-menu \.n-base-select-option--selected \.n-base-select-option__content,[\s\S]*?\.n-base-select-menu \.n-base-select-option--selected \.n-base-select-option__check \{[\s\S]*?color: var\(--text\) !important;/)
  assert.match(globalCss, /\/\* 选择下拉菜单：选中态只保留灰色整行，不显示右侧勾选图标或其预留空位。 \*\/[\s\S]*?\.n-base-select-menu \.n-base-select-option__check \{\s*display: none !important;\s*\}[\s\S]*?\.n-base-select-menu \.n-base-select-option--show-checkmark \{\s*padding-right: 12px !important;/)
  assert.match(globalCss, /\.n-base-select-menu\.fade-in-scale-up-transition-enter-active,[\s\S]*?\.n-base-select-menu\.popover-transition-enter-active[\s\S]*?opacity 400ms cubic-bezier\(\.77, 0, \.175, 1\),[\s\S]*?transform 200ms cubic-bezier\(\.77, 0, \.175, 1\)/)
  assert.match(globalCss, /\.n-base-select-menu\.fade-in-scale-up-transition-leave-active,[\s\S]*?\.n-base-select-menu\.popover-transition-leave-active[\s\S]*?transition: none !important;/)
})

test('copy fields stay neutral and do not use the input focus ring', () => {
  const source = read('src/views/UserSub.vue')
  const settings = read('src/views/AdminSettings.vue')
  const globalCss = read('src/styles/global.css')
  assert.match(source, /复制栏：订阅地址仅用于查看和复制，不使用填写框的点击焦点高亮或过渡特效。[\s\S]*?<n-input-group class="subscription-link-group copy-field">/)
  assert.match(source, /\.subscription-link-group \{ border-radius: var\(--r\) !important; \}/)
  assert.doesNotMatch(source, /subscription-link-group:focus-within/)
  assert.match(source, /class="copy-field"><n-input :value="acct.username"/)
  assert.match(settings, /复制栏：安装命令仅用于查看和复制，不使用填写框的点击焦点高亮。[\s\S]*?<n-input-group class="copy-field">/)
  assert.match(globalCss, /复制栏：只读内容不是填写框[，,]点击查看\/复制时保持中性边界[，,]不显示 Apple 蓝焦点线。[\s\S]*?\.copy-field \.n-input\.n-input--focus[\s\S]*?box-shadow: none !important;/)
})

test('clickable stat cards turn auxiliary copy Apple blue on hover', () => {
  const statCard = read('src/components/StatCard.vue')
  assert.match(statCard, /可跳转统计卡：悬浮时辅助说明变为 Apple 蓝[，,]提示整张卡可进入对应页面。[\s\S]*?\.stat-card\.clickable:hover \.sc-sub, \.stat-card\.clickable:focus-visible \.sc-sub \{ color: var\(--accent\); \}/)
})

test('subscription QR and reset-subscription actions declare their arc button types', () => {
  const source = read('src/views/UserSub.vue')
  assert.match(source, /高亮弧边按钮：固定使用实心 Apple 蓝，悬浮\/聚焦时变深。[\s\S]*?<n-button size="small" type="primary" class="highlight-arc-button" @click="showQr=!showQr">\{\{ showQr\?'隐藏':'显示' \}\}二维码<\/n-button>/)
  assert.match(source, /弧边警告按钮：保留 Naive UI 警告色与圆角样式，提示订阅地址变更风险。[\s\S]*?<n-button size="small" type="warning" @click="handleResetSub">更换订阅地址<\/n-button>/)
  assert.match(source, /class="highlight-arc-button"/)
})
