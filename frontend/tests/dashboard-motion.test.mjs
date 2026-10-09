import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { computed, effectScope, nextTick, ref, watch, onScopeDispose } from 'vue'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const dashboard = read('../src/views/UserDashboard.vue')
const transpile = (source) => ts.transpileModule(source.replace(/^import .*$/gm, '').replace(/^export /gm, ''), {
  compilerOptions: { target: ts.ScriptTarget.ESNext },
}).outputText

function clock(reduced = false) {
  let now = 0, id = 0
  const frames = new Map(), timers = new Map()
  const useCountUp = runInNewContext(transpile(read('../src/utils/countup.ts')) + '\nuseCountUp', {
    ref, watch, onScopeDispose,
    matchMedia: () => ({ matches: reduced }),
    performance: { now: () => now },
    requestAnimationFrame: (fn) => { frames.set(++id, fn); return id },
    cancelAnimationFrame: (key) => frames.delete(key),
    clearTimeout: (key) => timers.delete(key),
    window: { setTimeout: (fn) => { timers.set(++id, fn); return id } },
  })
  return {
    useCountUp,
    frame(time) { now = time; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(now)) },
    fallback() { const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn()) },
    pending: () => frames.size + timers.size,
  }
}

test('dashboard arcs use animated percentages and wait for the owning page reveal', () => {
  assert.match(dashboard, /useCountUp\(\(\) => \(ringsReady\.value && metered\.value/)
  assert.match(dashboard, /const dEdgeRingPct = useCountUp/)
  assert.match(dashboard, /Math\.min\(dRingPct\.value, 100\)/)
  assert.match(dashboard, /EDGE_CIRC \* \(1 - dEdgeRingPct\.value \/ 100\)/)
  assert.match(dashboard, /qz-shift5-entered/)
  assert.match(dashboard, /removeEventListener\('qz-shift5-entered'/)
  assert.doesNotMatch(dashboard, /\.ring-arc\{transition:stroke-dashoffset/)
})

test('both arcs stay empty before reveal, draw through intermediate frames, and refresh from current values', async () => {
  const c = clock(), scope = effectScope()
  const ready = ref(false), traffic = ref(41), edge = ref(73)
  const [outer, inner] = scope.run(() => [
    c.useCountUp(() => ready.value ? traffic.value : 0, { duration: 1100, round: false }),
    c.useCountUp(() => ready.value ? edge.value : 0, { duration: 1100, round: false }),
  ])
  c.frame(1100)
  assert.equal(outer.value, 0); assert.equal(inner.value, 0)
  ready.value = true
  await nextTick()
  c.frame(1450)
  assert.ok(outer.value > 0 && outer.value < 41)
  assert.ok(inner.value > 0 && inner.value < 73)
  c.frame(2200)
  assert.equal(outer.value, 41); assert.equal(inner.value, 73)
  traffic.value = 60; edge.value = 90
  await nextTick()
  assert.equal(outer.value, 41); assert.equal(inner.value, 73)
  c.frame(2500)
  assert.ok(outer.value > 41 && outer.value < 60)
  assert.ok(inner.value > 73 && inner.value < 90)
  c.frame(3300)
  assert.equal(outer.value, 60); assert.equal(inner.value, 90)
  scope.stop()
  assert.equal(c.pending(), 0)
})

test('reduced motion snaps to exact values and background fallback cannot strand a ring', async () => {
  for (const reduced of [true, false]) {
    const c = clock(reduced), scope = effectScope(), value = ref(0)
    const output = scope.run(() => c.useCountUp(() => value.value, { round: false }))
    value.value = 4.1
    await nextTick()
    if (!reduced) c.fallback()
    assert.equal(output.value, 4.1)
    scope.stop()
    assert.equal(c.pending(), 0)
  }
})

test('Shift5 notifies the revealed root only after clearing the page gates', async () => {
  const removed = [], events = []
  const root = {
    classList: { add() {}, remove: (name) => removed.push(name) },
    dispatchEvent: (event) => events.push({ name: event.type, gatesCleared: removed.includes('qz-shift5-route-transition-pending') }),
  }
  const document = {
    body: { appendChild() {} },
    documentElement: { classList: { remove: (name) => removed.push(name) } },
    createElement: () => ({ dataset: {}, classList: { remove() {} }, style: { removeProperty() {} }, setAttribute() {} }),
  }
  const enter = runInNewContext(transpile(read('../src/utils/shift5.ts')) + '\nrunShift5Enter', {
    document, Event, nextTick, onMounted() {}, watch() {},
    window: { matchMedia: () => ({ matches: true }) },
  })
  await enter(root)
  assert.equal(events.length, 1)
  assert.equal(events[0].name, 'qz-shift5-entered')
  assert.equal(events[0].gatesCleared, true)
})
