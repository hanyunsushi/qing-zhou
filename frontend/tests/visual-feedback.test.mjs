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
test('navigation searches report no results and collapsed groups retain dot landmarks', () => {
  const layout = read('components/DashboardLayout.vue')
  assert.equal((layout.match(/role="status">无结果/g) || []).length, 3)
  assert.match(layout, /:show-empty="!!searchQuery.trim\(\)"/)
  assert.match(layout, /menu-group-dot[^}]*'aria-hidden': 'true'/)
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
    assert.equal(elements[2].tag, 'n-menu')
    assert.ok(elements[2].props.some(prop => prop.type === 7 && prop.name === 'else'))
  }
  const emptyStyle = layout.match(/\.sidebar-search-empty \{([^}]+)\}/)[1]
  assert.doesNotMatch(emptyStyle, /position:\s*absolute|box-shadow|z-index|border:/)
  assert.doesNotMatch(layout, /搜索反馈沿用浮层几何/)
})
test('Markdown links define hover color and visible keyboard focus after their base rule', () => {
  const css = read('styles/global.css')
  assert.match(css, /\.md a:hover, \.md a:focus-visible \{ color: var\(--accent-hover\); \}/)
  assert.match(css, /\.md a:focus-visible \{ outline: 2px solid var\(--accent\); outline-offset: 3px; \}/)
})
test('operation buttons use wave-free press recoil and keep highlight and warning hover colors', () => {
  const css = read('styles/global.css')
  assert.match(css, /\.n-button > \.n-base-wave \{ display: none !important; \}/)
  const highlight = css.match(/\.n-button\.n-button--primary-type\.highlight-arc-button \{([^}]+)\}/)[1]
  assert.match(highlight, /--n-color-pressed: var\(--accent-arc-hover\) !important;/)
  assert.doesNotMatch(highlight, /var\(--accent-strong\)/)
  const warning = css.match(/\.n-button\.n-button--warning-type[^{}]+\{([^}]+)\}/)[1]
  assert.match(warning, /--n-color-pressed: var\(--n-color-hover\) !important;/)
  assert.match(warning, /--n-border-pressed: var\(--n-border-hover\) !important;/)
  assert.match(css, /:is\(\.action-button, \.highlight-arc-button, \.delete-button, \.n-button--warning-type\):is\(:active, \.n-button--pressed\):not\(\.n-button--disabled\)/)
  assert.match(css, /transform:translateY\(var\(--button-press-offset\)\) !important;/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.n-button \{ --button-press-offset: 0px; \}/)
  for (const path of ['views/AdminUpdate.vue', 'views/AuthPage.vue', 'views/AdminNodes.vue']) {
    assert.doesNotMatch(read(path), /按下短暂变深/)
    assert.match(read(path), /高亮弧边按钮：[^\n]*按下保持悬浮色并回弹/)
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
