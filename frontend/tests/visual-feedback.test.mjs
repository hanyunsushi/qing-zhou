import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

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
