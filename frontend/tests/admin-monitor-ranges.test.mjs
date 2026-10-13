import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import test from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../src/views/AdminMonitor.vue', import.meta.url), 'utf8')
const transpile = code => ts.transpileModule(code, {
  compilerOptions: { target: ts.ScriptTarget.ESNext },
}).outputText

class Element {
  constructor(left, width, parent = null) {
    this.left = left
    this.width = width
    this.parent = parent
    this.values = {}
    this.style = { setProperty: (key, value) => { this.values[key] = value } }
  }
  getBoundingClientRect() { return { left: this.left, width: this.width } }
  closest() { return this.button || this }
  contains(node) { return node === this || node.parent === this || node.button?.parent === this }
  querySelector() { return this.active }
}

function indicators() {
  let containers = []
  const pending = []
  let changed
  const code = source.slice(source.indexOf('function moveRangeIndicator('), source.indexOf('// --- ECharts'))
  const api = runInNewContext(transpile(code) + '\n({moveRangeIndicatorFromEvent, resetRangeIndicator, syncRangeIndicators})', {
    HTMLElement: Element, Node: Element, filtered: {},
    chartLoaded: { value: {} }, chartRange: { value: {} }, loadChart: () => {},
    monitorRoot: { value: { querySelectorAll: () => containers } },
    nextTick: fn => { pending.push(fn) },
    watch: (_, fn, options) => { assert.equal(options.flush, 'post'); changed = fn },
  })
  const group = (left = 100) => {
    const root = new Element(left, 250)
    root.active = new Element(left + 4, 50, root)
    const other = new Element(left + 54, 55, root)
    return { root, other }
  }
  return { ...api, group, changed: () => changed([], []), set: value => { containers = value }, flush: () => pending.splice(0).forEach(fn => fn()) }
}

test('monitor ranges use one indicator with hover, keyboard, return and standard geometry', () => {
  assert.equal((source.match(/@mouseover="moveRangeIndicatorFromEvent"/g) || []).length, 2)
  assert.equal((source.match(/@focusin="moveRangeIndicatorFromEvent"/g) || []).length, 2)
  assert.equal((source.match(/@mouseleave="resetRangeIndicator"/g) || []).length, 2)
  assert.equal((source.match(/@focusout="resetRangeIndicator"/g) || []).length, 2)
  assert.equal((source.match(/:aria-pressed=/g) || []).length, 2)
  assert.match(source, /font:500 13px\/20px var\(--ff\)/)
  assert.match(source, /\.range-switch\.route-switch button \{[^}]*padding:6px 14px;[^}]*border-radius:12px;/)
  assert.match(source, /button:focus-visible \{[^}]*box-shadow:inset 0 0 0 2px rgba\(29,39,51,\.16\) !important;/)
  assert.match(source, /@media \(pointer: coarse\)[\s\S]*?min-height:44px; min-width:44px;/)
  assert.match(source, /切换开关：公开可见性用于首页/)
  assert.match(source, /首页本机指标由“面板本机”的公开开关控制/)
})

test('hover and focus move only their own group; leaving restores the selected option', () => {
  const api = indicators()
  const first = api.group(), second = api.group(400)
  api.set([first.root, second.root]); api.syncRangeIndicators(); api.flush()
  const nested = new Element(0, 0); nested.button = first.other
  api.moveRangeIndicatorFromEvent({ currentTarget: first.root, target: nested })
  assert.equal(first.root.values['--route-indicator-x'], '54px')
  assert.equal(first.root.values['--route-indicator-w'], '55px')
  assert.equal(second.root.values['--route-indicator-x'], '4px')
  // An internal focus transfer must not reset the new hover/focus target.
  api.resetRangeIndicator({ currentTarget: first.root, relatedTarget: first.other })
  assert.equal(first.root.values['--route-indicator-x'], '54px')
  api.moveRangeIndicatorFromEvent({ currentTarget: first.root, target: first.root.active })
  assert.equal(first.root.values['--route-indicator-x'], '4px')
  api.moveRangeIndicatorFromEvent({ currentTarget: first.root, target: first.other })
  api.resetRangeIndicator({ currentTarget: first.root, relatedTarget: null })
  assert.equal(first.root.values['--route-indicator-x'], '4px')
  assert.equal(first.root.values['--route-indicator-w'], '50px')
})

test('filter remount measures new option positions after DOM update', () => {
  const api = indicators(), first = api.group()
  api.set([first.root]); api.syncRangeIndicators(); api.flush()
  const replacement = api.group(700)
  replacement.root.active.left = 815
  replacement.root.active.width = 62
  api.set([replacement.root]); api.changed()
  assert.equal(replacement.root.values['--route-indicator-x'], undefined)
  api.flush()
  assert.equal(replacement.root.values['--route-indicator-x'], '115px')
  assert.equal(replacement.root.values['--route-indicator-w'], '62px')
})

test('late chart responses cannot replace a newer selected range or another server', async () => {
  const pending = new Map(), rendered = []
  const refs = { value: { 1: { isConnected: true }, 2: { isConnected: true } } }
  const code = source.slice(source.indexOf('const chartRequests:'), source.indexOf('let refreshTimer:'))
  const loadChart = runInNewContext(transpile(code) + '\nloadChart', {
    chartRange: { value: {} }, chartLoaded: { value: {} }, chartRefs: refs,
    chartInstances: { value: {} }, monitorMounted: true, syncRangeIndicators: () => {},
    apiGet: url => new Promise(resolve => pending.set(url, resolve)), nextTick: async () => {},
    echarts: { init: el => ({ getDom: () => el, dispose: () => {}, setOption: option => rendered.push({ el, option }) }) },
  })
  const old = loadChart(1, '1h'), latest = loadChart(1, '7d'), other = loadChart(2, '6h')
  pending.get('/api/admin/monitor/servers/1/metrics?range=7d')({ data: [] }); await latest
  pending.get('/api/admin/monitor/servers/2/metrics?range=6h')({ data: [] }); await other
  pending.get('/api/admin/monitor/servers/1/metrics?range=1h')({ data: [] }); await old
  assert.equal(rendered.length, 2)
  assert.equal(rendered[0].el, refs.value[1])
  assert.equal(rendered[1].el, refs.value[2])
  refs.value[1] = { isConnected: true }
  const remounted = loadChart(1, '7d')
  pending.get('/api/admin/monitor/servers/1/metrics?range=7d')({ data: [] }); await remounted
  assert.equal(rendered[2].el, refs.value[1])
})

test('heatmap keeps the latest range and its loading state under reordered responses', async () => {
  const pending = new Map()
  const ctx = {
    heatRange: { value: '' }, heatData: { value: null }, heatLoading: { value: false },
    heatError: { value: '' },
    monitorMounted: true, syncRangeIndicators: () => {}, nextTick: async () => {},
    apiGet: url => new Promise(resolve => pending.set(url, resolve)),
  }
  const code = source.slice(source.indexOf('async function loadHeatmap('), source.indexOf('// --- Asset editing ---'))
  const load = runInNewContext(transpile('let heatRequest = 0\n' + code) + '\nloadHeatmap', ctx)
  const old = load('1h'), latest = load('7d')
  pending.get('/api/admin/monitor/heatmap?range=1h')({ range: '1h' }); await old
  assert.equal(ctx.heatLoading.value, true)
  assert.equal(ctx.heatData.value, null)
  pending.get('/api/admin/monitor/heatmap?range=7d')({ range: '7d' }); await latest
  assert.equal(ctx.heatData.value.range, '7d')
  assert.equal(ctx.heatRange.value, '7d')
  assert.equal(ctx.heatLoading.value, false)
  const unmounted = load('6h'); ctx.monitorMounted = false
  pending.get('/api/admin/monitor/heatmap?range=6h')({ range: '6h' }); await unmounted
  assert.equal(ctx.heatData.value.range, '7d')
})
