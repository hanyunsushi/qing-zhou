import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { parse } from '@vue/compiler-dom'
import { parse as parseSfc } from '@vue/compiler-sfc'

const read = path => readFileSync(new URL('../src/' + path, import.meta.url), 'utf8')
test('all alert types and order surfaces keep their borderless contract', () => {
  const theme = read('App.vue')
  for (const type of ['', 'Info', 'Success', 'Warning', 'Error']) assert.ok(theme.includes(`border${type}: 'none'`))
  assert.match(read('views/UserDashboard.vue'), /<n-alert[^>]*:bordered="false"/)
  assert.match(read('views/UserOrders.vue'), /\.order-item \{[^}]*border: 0;/)
})
test('feedback messages use topbar glass while modal surfaces keep their base material', () => {
  const css = read('components/feedback/feedback.css')
  assert.match(css, /\.kf-feedback-panel \{[^}]*background: var\(--bg, #fff\) !important;/)
  assert.match(css, /\.kf-feedback-panel\.kf-feedback-message \{ background: var\(--topbar-surface\) !important; backdrop-filter: var\(--topbar-backdrop-filter\); -webkit-backdrop-filter: var\(--topbar-backdrop-filter\); \}/)
})
test('buttons use 300ms gray or blue highlights and reserve ring growth for emphasis', () => {
  const css = read('styles/global.css')
  assert.match(css, /--button-hover-duration: \.3s;/)
  assert.match(css, /--button-surface: #ffffff;/)
  assert.match(css, /--action-button-bg-hover: var\(--card-hover\)/)
  assert.match(css, /--action-button-fg: var\(--text-2\);[^}]*--action-button-fg-hover: var\(--text-2\)/)
  assert.match(css, /--action-button-bg-hover: var\(--accent-button-hover\)/)
  assert.match(css, /box-shadow:0 0 0 2px var\(--action-button-border-hover\)/)
  assert.doesNotMatch(css, /neutral-hover-fill|box-shadow: inset 0 0 32px/)
})
test('navigation searches report no results and collapsed groups retain dot landmarks', () => {
  const layout = read('components/DashboardLayout.vue')
  assert.equal((layout.match(/role="status">无结果/g) || []).length, 3)
  assert.match(layout, /:show-empty="!!searchQuery.trim\(\)"/)
  assert.match(read('composables/useSidebarNavigation.ts'), /menu-group-dot[^}]*'aria-hidden': 'true'/)
  assert.match(layout, /\.mobile-sidebar-drawer-root \.n-drawer-body-content-wrapper/)
})
test('sidebar empty feedback replaces the menu in the result track on desktop and mobile', () => {
  const layout = read('components/DashboardLayout.vue')
  const root = parse(parseSfc(layout).descriptor.template.content)
  const navs = []
  const walk = node => {
    if (node.tag === 'nav') navs.push(node)
    for (const child of node.children || []) walk(child)
  }
  walk(root)
  assert.equal(navs.length, 2)
  for (const nav of navs) {
    const elements = nav.children.filter(node => node.type === 1)
    assert.equal(elements[0].props.find(prop => prop.name === 'class').value.content, 'sidebar-filter')
    assert.equal(elements[1].props.find(prop => prop.name === 'class').value.content, 'sidebar-search-empty')
    assert.equal(elements[2].tag, 'KreeperSidebarMenu')
    assert.ok(elements[2].props.some(prop => prop.type === 7 && prop.name === 'else'))
  }
  const emptyStyle = layout.match(/\.sidebar-search-empty \{([^}]+)\}/)[1]
  assert.doesNotMatch(emptyStyle, /position:\s*absolute|box-shadow|z-index|border:/)
  assert.doesNotMatch(layout, /搜索反馈沿用浮层几何/)
})
test('Markdown links are underlined only on hover or keyboard focus', () => {
  const css = read('styles/global.css')
  assert.match(css, /\na \{ color: var\(--accent\); text-decoration: none; text-underline-offset: 3px; \}/)
  assert.match(css, /\na:hover, a:focus-visible \{ color: var\(--accent\); text-decoration: underline; \}/)
  assert.match(css, /\na:focus-visible \{ outline: 2px solid var\(--accent\); outline-offset: 3px; \}/)
  assert.match(css, /\.md a \{ color: var\(--accent\); text-decoration: none; text-underline-offset: 3px; \}/)
  assert.match(css, /\.md a:hover, \.md a:focus-visible \{ color: var\(--accent\); text-decoration: underline; \}/)
  assert.match(css, /\.md a:focus-visible \{ outline: 2px solid var\(--accent\); outline-offset: 3px; \}/)
  assert.ok(css.indexOf('.md a {') < css.indexOf('.md a:hover'))
})
test('operation buttons use wave-free static clicks and keep the unified highlight hover color', () => {
  const css = read('styles/global.css')
  assert.match(css, /\.n-button > \.n-base-wave \{ display: none !important; \}/)
  const highlight = css.match(/\.n-button\.n-button--primary-type\.highlight-arc-button,[^{]*\{([^}]+)\}/)[1]
  assert.match(highlight, /--n-color-pressed: var\(--accent-arc-hover\) !important;/)
  assert.doesNotMatch(highlight, /var\(--accent-strong\)/)
  assert.doesNotMatch(css, /\.n-button\.n-button--warning-type/)
  assert.match(css, /button:active:not\(:disabled\),\s*button\.n-button--pressed:not\(\.n-button--disabled\) \{ transform: none !important;/)
  assert.doesNotMatch(css, /transform:translateY\(var\(--button-press-offset\)\) !important;/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.n-button \{ --button-press-offset: 0px; \}/)
  for (const path of ['views/AdminUpdate.vue', 'views/AuthPage.vue', 'views/AdminNodes.vue']) {
    assert.doesNotMatch(read(path), /按下短暂变深/)
    assert.match(read(path), /高亮弧边按钮：[^\n]*点击保持悬浮色且不改变位置/)
  }
})
test('monitor uses shared skyline and separates loopback assets from machine metrics', () => {
  const source = read('views/AdminMonitor.vue')
  assert.match(source, /const monitorServers = computed\(\(\) => servers.value.filter\(s => !s.panel_metrics\)\)/)
  assert.match(source, /const panelAliases = computed/)
  assert.match(source, /<AvailabilityHeatmap/)
  assert.doesNotMatch(source, /function renderHeatmap\(/)
})
test('help status switch measures selection and tracks hover, keyboard and resize', () => {
  const source = read('views/AdminHelp.vue')
  assert.match(source, /ref="statusSwitch"[^>]*role="group"/)
  assert.match(source, /watch\(statusFilter, syncStatusIndicator, \{ flush: 'post' \}\)/)
  assert.match(source, /@mouseover="moveStatusFromEvent" @focusin="moveStatusFromEvent"/)
  assert.match(source, /--route-indicator-w/)
  assert.match(source, /@media \(pointer: coarse\)[^\n]*min-height: 44px/)
})
