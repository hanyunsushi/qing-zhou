import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { computed, ref } from 'vue'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const dashboard = read('../src/views/UserDashboard.vue')
const statusModule = ts.transpileModule(read('../src/utils/status-colors.ts'), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText
const { CHART_STATUS_COLORS, chartColorForPercent, STATUS_COLORS } = await import(
  'data:text/javascript;base64,' + Buffer.from(statusModule).toString('base64')
)

function usageModel(value) {
  const source = dashboard.split('// ---- 流量口径 ----')[1].split('// ---- 套餐')[0]
  const dash = ref(value)
  const script = ts.transpileModule(source + '\n;({ edgeMetered, edgeQuotaPct, edgeQuotaFoot, edgeRingColor, edgeRingOffset, ringColor, ringOffset, ringAriaLabel, EDGE_CIRC, CIRC })', {
    compilerOptions: { target: ts.ScriptTarget.ESNext },
  }).outputText
  const model = runInNewContext(script, {
    dash, computed, ringsReady: ref(true), CHART_STATUS_COLORS, chartColorForPercent, STATUS_COLORS,
    useCountUp: (getter) => computed(getter),
    pct: (used, total) => total > 0 ? Math.min(100, Math.round((used || 0) / total * 1000) / 10) : 0,
  })
  return { dash, ...model }
}

test('dashboard uses concentric rings and removes the fixed-warning Edge bar', () => {
  assert.match(dashboard, /class="ring-arc ring-arc--traffic"/)
  assert.match(dashboard, /class="ring-arc ring-arc--edge"/)
  assert.match(dashboard, /cx="70" cy="70" r="58"/)
  assert.match(dashboard, /cx="70" cy="70" r="43"/)
  assert.equal((dashboard.match(/stroke-width="14"/g) || []).length, 4)
  assert.match(dashboard, /const EDGE_CIRC = 2 \* Math\.PI \* 43/)
  assert.equal(58 - 14 / 2 - (43 + 14 / 2), 1)
  assert.match(dashboard, /<span class="ring-label">Edge 次数<\/span>/)
  assert.doesNotMatch(dashboard, /CF 次数|CF 今日|暂无 CF/)
  assert.match(dashboard, /role="img" :aria-label="ringAriaLabel"/)
  assert.match(dashboard, /v-if="edgeMetered && edgeQuotaPct > 0"/)
  assert.match(dashboard, /:class="\{ numeric: edgeMetered \}"/)
  assert.match(dashboard, /v-if="edgeRequests\.unlimited"><span class="numeric">\{\{ edgeQuotaUsed \}\}<\/span> 次 \/ 不限额/)
  assert.doesNotMatch(dashboard, /numeric: edgeMetered \|\| edgeRequests\.unlimited/)
  assert.doesNotMatch(dashboard, /edge-quota-track|edgeQuotaValue|\.ring-inf/)
})

test('both usage rings independently apply shared Apple status thresholds', () => {
  const model = usageModel({ traffic: { used: 41, total: 100 }, edge_requests: { used: 73, total: 100000 } })
  assert.equal(model.edgeQuotaPct.value, 0.1)
  assert.equal(model.edgeQuotaFoot.value, '73 / 100,000 次')
  assert.equal(model.edgeRingColor.value, CHART_STATUS_COLORS.success)
  assert.equal(model.ringColor.value, CHART_STATUS_COLORS.success)
  for (const [used, color] of [[69.9, 'success'], [70, 'warning'], [89.9, 'warning'], [90, 'error'], [100, 'error']]) {
    model.dash.value.edge_requests = { used, total: 100 }
    assert.equal(model.edgeRingColor.value, CHART_STATUS_COLORS[color])
    assert.equal(model.ringColor.value, CHART_STATUS_COLORS.success)
    assert.ok(Math.abs(model.edgeRingOffset.value - model.EDGE_CIRC * (1 - used / 100)) < 1e-8)
  }
  model.dash.value.traffic = { used: 95, total: 100 }
  assert.equal(model.ringColor.value, CHART_STATUS_COLORS.error)
})

test('Edge missing and unlimited quotas use inactive empty rings, not misleading percentages', () => {
  const model = usageModel({})
  assert.equal(model.edgeMetered.value, false)
  assert.equal(model.edgeQuotaPct.value, 0)
  assert.equal(model.edgeRingColor.value, CHART_STATUS_COLORS.inactive)
  assert.equal(model.edgeRingOffset.value, model.EDGE_CIRC)
  assert.equal(model.edgeQuotaFoot.value, '暂无 Edge 日次数额度')
  model.dash.value.edge_requests = { unlimited: true, total: 100000, used: 73 }
  assert.equal(model.edgeMetered.value, false)
  assert.equal(model.edgeQuotaFoot.value, '73 次 / 不限额')
  assert.match(model.ringAriaLabel.value, /Edge 今日次数不限额/)
})

test('Edge progress is clamped for zero, negative, and over-quota usage', () => {
  const model = usageModel({ edge_requests: { used: 0, total: 100 } })
  assert.equal(model.edgeQuotaPct.value, 0)
  assert.equal(model.edgeRingOffset.value, model.EDGE_CIRC)
  model.dash.value.edge_requests.used = -1
  assert.equal(model.edgeQuotaPct.value, 0)
  model.dash.value.edge_requests.used = 150
  assert.equal(model.edgeQuotaPct.value, 100)
  assert.equal(model.edgeRingOffset.value, 0)
  assert.equal(model.edgeQuotaFoot.value, '150 / 100 次')
})
