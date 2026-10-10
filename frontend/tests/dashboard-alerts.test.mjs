import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { computed, ref } from 'vue'

const dashboard = readFileSync(new URL('../src/views/UserDashboard.vue', import.meta.url), 'utf8')
const now = 1_800_000_000
const expiry = (days) => now + days * 86400
const plan = (days, auto_renew = true, extra = {}) => ({
  kind: 'plan', package_id: 1, status: 'active', expiry_at: expiry(days), auto_renew, ...extra,
})

function alertModel(plans, status = 'active', usage = { used: 20, total: 100 }) {
  const source = dashboard.slice(dashboard.indexOf('const plans ='), dashboard.indexOf('// ---- 趋势'))
  const dash = ref({ plans }), auth = { user: { status } }, traffic = ref(usage)
  const script = ts.transpileModule(source + '\n;({ alerts, nextExpiry, nextExpiryDays })', {
    compilerOptions: { target: ts.ScriptTarget.ESNext },
  }).outputText
  const model = runInNewContext(script, {
    dash, auth, traffic, computed, metered: computed(() => traffic.value.total > 0),
    daysLeft: (ts) => ts ? Math.ceil((ts - now) / 86400) : null,
    fmtDate: String, useCountUp: (getter) => computed(getter),
  })
  return { dash, ...model }
}

test('enabled expiry reminder explains automatic renewal and links to its cancellation control', () => {
  const model = alertModel([plan(7)])
  const alert = model.alerts.value[0]
  assert.equal(alert.type, 'info')
  assert.equal(alert.text, '套餐将在 7 天后到期并自动续订，如需取消，请前往')
  assert.equal(alert.to, '/sub')
  assert.equal(alert.action, '订阅管理')
})

test('disabled and missing renewal preferences retain the manual renewal warning and react to refresh', () => {
  for (const preference of [false, undefined]) {
    const model = alertModel([plan(3, preference, { auto_renew: preference })])
    assert.equal(model.alerts.value[0].type, 'warning')
    assert.equal(model.alerts.value[0].to, '/shop')
    assert.equal(model.alerts.value[0].action, '去续费')
    assert.doesNotMatch(model.alerts.value[0].text, /自动续订/)
    model.dash.value.plans[0].auto_renew = true
    assert.match(model.alerts.value[0].text, /并自动续订/)
    model.dash.value.plans[0].auto_renew = false
    assert.equal(model.alerts.value[0].action, '去续费')
  }
})

test('nearest expiry uses its own preference rather than another active or queued plan', () => {
  const model = alertModel([plan(30, true), plan(2, false), plan(1, true, { status: 'queued' })])
  assert.equal(model.nextExpiry.value, expiry(2))
  assert.equal(model.alerts.value[0].text, '最近一份套餐将在 2 天后到期，')
  assert.equal(model.alerts.value[0].to, '/shop')
  model.dash.value.plans = [plan(30, false), plan(2, true)]
  assert.match(model.alerts.value[0].text, /^最近一份套餐将在 2 天后到期并自动续订/)
})

test('same-time mixed renewal settings do not claim every expiring plan will renew', () => {
  const model = alertModel([plan(4, true), plan(4, false)])
  const alert = model.alerts.value[0]
  assert.equal(alert.type, 'warning')
  assert.match(alert.text, /其中 1 份已开启自动续订，其余需手动续费/)
  assert.equal(alert.to, '/sub')
  assert.equal(alert.action, '订阅管理')
  model.dash.value.plans[1].auto_renew = true
  assert.match(model.alerts.value[0].text, /^最近到期的套餐将在 4 天后到期并自动续订/)
  assert.equal(model.alerts.value[0].type, 'info')
})

test('pools and package-less buckets do not promise automatic renewal', () => {
  for (const extra of [{ kind: 'pool' }, { package_id: 0 }]) {
    assert.equal(alertModel([plan(2, true, extra)]).alerts.value[0].action, '去续费')
  }
})

test('expiry boundaries, non-expiring plans and other dashboard warnings stay unchanged', () => {
  assert.match(alertModel([plan(0)]).alerts.value[0].text, /0 天后到期/)
  assert.equal(alertModel([plan(8)]).alerts.value.length, 0)
  assert.equal(alertModel([plan(7, true, { expiry_at: 0 })]).alerts.value.length, 0)
  assert.equal(alertModel([]).alerts.value.length, 0)
  assert.equal(alertModel([plan(-1, true, { status: 'expired' })]).alerts.value[0].key, 'no-active')
  assert.equal(alertModel([plan(7)], 'banned').alerts.value[0].key, 'banned')
  assert.deepEqual(Array.from(alertModel([plan(7)], 'active', { used: 100, total: 100 }).alerts.value, a => a.key), ['expiring', 'exhausted'])
})
