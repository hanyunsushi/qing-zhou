import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { computed, effectScope, nextTick, reactive, ref, watch, onScopeDispose } from 'vue'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const gauge = read('../src/components/ResourceGauge.vue')
const monitor = read('../src/views/Monitor.vue')
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
  const chartColorForPercent = runInNewContext(transpile(read('../src/utils/status-colors.ts')) + '\nchartColorForPercent')
  return {
    gauge(props) {
      return runInNewContext(transpile(gauge.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1])
        + '\n({ dPercent, targetPercent, color, offset, CIRC })', { computed, defineProps: () => props, useCountUp, chartColorForPercent })
    },
    frame(time) { now = time; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(now)) },
    fallback() { const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn()) },
    pending: () => frames.size + timers.size,
  }
}

test('home resource rings match dual-ring geometry and use one animated value for arc and text', () => {
  assert.match(gauge, /viewBox="0 0 140 140"/)
  assert.match(gauge, /r="58"/)
  assert.match(gauge, /stroke-width: 14/)
  assert.match(gauge, /\.gauge-bg \{[^}]*opacity: \.14/)
  assert.match(gauge, /v-if="dPercent > 0"/)
  assert.match(gauge, /:stroke-dashoffset="offset"/)
  assert.match(gauge, /dPercent\.toFixed\(1\)/)
  assert.match(gauge, /duration: 1100, round: false/)
  assert.match(gauge, /role="img"[\s\S]*?:aria-label=/)
  assert.doesNotMatch(gauge, /transition:[^;}]*stroke-dashoffset/)
  assert.match(monitor, /<ResourceGauge[\s\S]*?v-for="g in gauges\(s\)"[\s\S]*?:key="g.key"[\s\S]*?:ready="ringsReady"/)
  assert.match(monitor, /qz-shift5-entered/)
  assert.match(monitor, /event\.target\.contains\(monitorRoot\.value\)/)
  assert.match(monitor, /removeEventListener\('qz-shift5-entered'/)
  assert.doesNotMatch(monitor, /gaugeAnimated|GAUGE_C|transition: stroke-dashoffset/)
})

test('resource percentages remain neutral while only arcs and tracks carry status color', () => {
  assert.match(gauge, /\.gauge-val \{[^}]*color: var\(--text\)/)
  assert.doesNotMatch(gauge, /class="gauge-val"[^>]*:style=/)
  assert.match(gauge, /class="gauge-bg"[^>]*:stroke="color"/)
  assert.match(gauge, /class="gauge-fg"[\s\S]*?:stroke="color"/)
})

test('each resource starts after reveal, refreshes from its current value, and cleans up', async () => {
  const c = clock(), scope = effectScope()
  const props = [41, 73, 95].map(percent => reactive({ percent, ready: false, label: 'resource', sub: '' }))
  const rings = scope.run(() => props.map(p => c.gauge(p)))
  c.frame(1100)
  rings.forEach(r => { assert.equal(r.dPercent.value, 0); assert.equal(r.offset.value, r.CIRC) })
  props.forEach(p => { p.ready = true })
  await nextTick()
  c.frame(1450)
  rings.forEach((r, i) => {
    assert.ok(r.dPercent.value > 0 && r.dPercent.value < props[i].percent)
    assert.equal(r.offset.value, r.CIRC * (1 - r.dPercent.value / 100))
  })
  c.frame(2200)
  rings.forEach((r, i) => assert.equal(r.dPercent.value, props[i].percent))
  props[0].percent = 60; props[1].percent = 20; props[2].percent = 0
  await nextTick()
  assert.equal(rings[0].dPercent.value, 41)
  c.frame(2500)
  assert.ok(rings[0].dPercent.value > 41 && rings[0].dPercent.value < 60)
  assert.ok(rings[1].dPercent.value < 73 && rings[1].dPercent.value > 20)
  c.frame(3300)
  rings.forEach((r, i) => assert.equal(r.dPercent.value, props[i].percent))
  scope.stop()
  assert.equal(c.pending(), 0)
})

test('late-mounted metrics animate independently without resetting existing servers', () => {
  const c = clock(), existing = effectScope(), late = effectScope()
  const first = existing.run(() => c.gauge(reactive({ percent: 12.4, ready: true })))
  c.frame(1100)
  const second = late.run(() => c.gauge(reactive({ percent: 83, ready: true })))
  assert.equal(first.dPercent.value, 12.4)
  assert.equal(second.dPercent.value, 0)
  c.frame(1400)
  assert.ok(second.dPercent.value > 0 && second.dPercent.value < 83)
  existing.stop(); late.stop()
  assert.equal(c.pending(), 0)
})

test('zero, invalid values, status thresholds and reduced motion stay accurate', async () => {
  const c = clock(true), scope = effectScope(), props = reactive({ percent: 0, ready: true })
  const ring = scope.run(() => c.gauge(props))
  for (const [input, value, color] of [[0, 0, '#34c759'], [69.9, 69.9, '#34c759'], [70, 70, '#ff9500'],
    [90, 90, '#ff3b30'], [140, 100, '#ff3b30'], [-5, 0, '#34c759'], [NaN, 0, '#34c759'], [Infinity, 0, '#34c759']]) {
    props.percent = input
    await nextTick()
    assert.equal(ring.dPercent.value, value)
    assert.equal(ring.color.value, color)
    assert.ok(Number.isFinite(ring.offset.value))
  }
  scope.stop()
  assert.equal(c.pending(), 0)
})

test('background fallback reaches the exact resource percentage and unmount cancels mid-animation', () => {
  const c = clock(), scope = effectScope()
  const ring = scope.run(() => c.gauge(reactive({ percent: 0.4, ready: true })))
  c.fallback()
  assert.equal(ring.dPercent.value, 0.4)
  scope.stop()
  const mid = effectScope()
  mid.run(() => c.gauge(reactive({ percent: 83, ready: true })))
  assert.ok(c.pending() > 0)
  mid.stop()
  assert.equal(c.pending(), 0)
})
