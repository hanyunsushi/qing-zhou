import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { nextTick, ref } from 'vue'

const read = file => readFileSync(new URL(file, import.meta.url), 'utf8')
const transpile = source => ts.transpileModule(source.replace(/^import .*$/gm, '').replace(/^export /gm, ''), {
  compilerOptions: { target: ts.ScriptTarget.ESNext },
}).outputText
const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const pause = () => new Promise(resolve => setTimeout(resolve, 10))
const frames = {
  requestAnimationFrame: fn => setTimeout(fn, 0),
  cancelAnimationFrame: clearTimeout,
}
function gate() {
  return runInNewContext(transpile(read('../src/utils/page-loading.ts')) +
    '\n({pageLoading, beginPageLoad, currentPageLoad, trackPageRequest, waitForPageRequests, finishPageLoad, cancelPageLoad, nextPagePaint, setPageLoadingTarget})', {
    ref, nextTick, window: { setTimeout, clearTimeout }, ...frames,
  })
}

test('the loader waits for parallel and sequential initial requests, including body processing', async () => {
  const g = gate(), token = g.beginPageLoad(), first = deferred(), second = deferred(), chained = deferred()
  const a = g.trackPageRequest(() => first.promise).then(() => g.trackPageRequest(() => chained.promise))
  const b = g.trackPageRequest(() => second.promise)
  let ready = false
  const wait = g.waitForPageRequests(token).then(value => { ready = value })
  first.resolve(); await pause()
  assert.equal(ready, false)
  second.resolve(); await b; await pause()
  assert.equal(ready, false)
  chained.resolve(); await a; await wait
  assert.equal(ready, true)
  assert.equal(g.pageLoading.value, true)
  assert.equal(g.finishPageLoad(token), true)
  assert.equal(g.pageLoading.value, false)
})

test('failed requests settle the gate without swallowing the actual error', async () => {
  const g = gate(), token = g.beginPageLoad(), request = deferred()
  const failure = assert.rejects(g.trackPageRequest(() => request.promise), /network failed/)
  const wait = g.waitForPageRequests(token)
  request.reject(new Error('network failed'))
  await failure
  assert.equal(await wait, true)
  g.finishPageLoad(token)
  assert.equal(g.pageLoading.value, false)
})

test('retry gaps stay gated until the page loading flag reaches a terminal state', async () => {
  const g = gate(), token = g.beginPageLoad()
  let busy = true, ready = false
  const wait = g.waitForPageRequests(token, () => busy).then(value => { ready = value })
  await pause()
  assert.equal(ready, false)
  await g.trackPageRequest(async () => 42)
  await pause()
  assert.equal(ready, false)
  busy = false
  await wait
  assert.equal(ready, true)
})

test('a newer navigation cancels the old gate and ignores its late completion', async () => {
  const g = gate(), oldToken = g.beginPageLoad(), old = deferred()
  const oldRequest = g.trackPageRequest(() => old.promise), oldWait = g.waitForPageRequests(oldToken)
  const token = g.beginPageLoad(), current = deferred()
  const request = g.trackPageRequest(() => current.promise)
  assert.equal(await oldWait, false)
  old.resolve(); await oldRequest
  assert.equal(g.finishPageLoad(oldToken), false)
  assert.equal(g.pageLoading.value, true)
  current.resolve(); await request
  assert.equal(await g.waitForPageRequests(token), true)
  g.finishPageLoad(token)
})

test('requests after reveal do not restart route loading; cancellation releases waiters', async () => {
  const g = gate(), token = g.beginPageLoad(), pending = deferred()
  const request = g.trackPageRequest(() => pending.promise)
  const wait = g.waitForPageRequests(token)
  g.cancelPageLoad(token)
  assert.equal(await wait, false)
  pending.resolve(); await request
  const refresh = deferred(), refreshed = g.trackPageRequest(() => refresh.promise)
  assert.equal(g.pageLoading.value, false)
  refresh.resolve(); await refreshed
})

function transition(g, reduced = false, folder = false) {
  const log = []
  class Element {
    constructor() {
      this.dataset = {}; this.children = []; this.isConnected = false
      this.style = { removeProperty() {} }
      const classes = new Set(['route-page-shell'])
      this.classList = { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) }
    }
    getBoundingClientRect() { return { left: 264, top: 64, width: 600, height: 500 } }
    querySelector(selector) { return folder && selector === '.gf-root' ? {} : null }
    querySelectorAll() { return [] }
    setAttribute() {}
    remove() { this.isConnected = false }
    animate(keyframes) { log.push({ type: keyframes[0].clipPath ? 'clip' : this.dataset.stage, loading: g.pageLoading.value, keyframes }); return { cancel() {} } }
    dispatchEvent(event) { log.push({ type: event.type, loading: g.pageLoading.value }) }
  }
  const root = new Element()
  const document = {
    documentElement: new Element(), fonts: { ready: Promise.resolve() },
    body: { appendChild: node => { node.isConnected = true } },
    querySelector: () => root, createElement: () => new Element(),
  }
  const run = runInNewContext(transpile(read('../src/utils/shift5.ts')) + '\nrunShift5Enter', {
    ...g, document, Event, HTMLElement: Element, nextTick, onMounted() {}, watch() {}, ...frames,
    getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '1' }),
    window: { matchMedia: () => ({ matches: reduced }), setTimeout: fn => setTimeout(fn, 0) },
  })
  return { root, log, run }
}

test('loading finishes and paints out before either leave or reveal animation starts', async () => {
  const g = gate(); g.beginPageLoad()
  const t = transition(g), pending = deferred(), request = g.trackPageRequest(() => pending.promise)
  const enter = t.run(t.root)
  await pause()
  assert.equal(t.log.length, 0)
  assert.equal(g.pageLoading.value, true)
  pending.resolve(); await request; await enter; await pause()
  assert.ok(t.log.some(entry => entry.type === 'leaving'))
  assert.ok(t.log.some(entry => entry.type === 'clip'))
  assert.ok(t.log.every(entry => entry.loading === false))
})

test('reduced motion still waits for data before revealing but plays no route animation', async () => {
  const g = gate(); g.beginPageLoad()
  const t = transition(g, true), pending = deferred(), request = g.trackPageRequest(() => pending.promise)
  const enter = t.run(t.root)
  await pause()
  assert.equal(t.log.length, 0)
  pending.resolve(); await request; await enter
  assert.deepEqual(t.log.map(entry => entry.type), ['qz-shift5-entered'])
  assert.equal(g.pageLoading.value, false)
})

test('folder reveal preserves blur outsets through the held final frame, without changing ordinary reveals', async () => {
  for (const folder of [false, true]) {
    const g = gate(); g.beginPageLoad()
    const t = transition(g, false, folder)
    await t.run(t.root)
    const clip = t.log.find(entry => entry.type === 'clip').keyframes
    assert.equal(clip[1].clipPath, folder ? 'inset(-96px)' : 'inset(0 0 0% 0)')
    assert.equal(clip[0].clipPath, folder ? 'inset(-96px -96px calc(100% + 96px) -96px)' : 'inset(0 0 100% 0)')
  }
})

test('all default Naive loading surfaces use the same compact 3x3 symbol', () => {
  const css = read('../src/styles/loading.css'), app = read('../src/App.vue'), router = read('../src/router/index.ts')
  assert.match(css, /\.dot-matrix-loader::before,[\s\S]*\.n-base-loading::before/)
  assert.match(css, /\.n-base-loading > \.n-base-loading__transition-wrapper \{ display: none !important;/)
  assert.match(css, /--loader-size: 16px/)
  assert.match(css, /dot-matrix-calm 1\.4s/)
  assert.match(app, /DotMatrixLoader v-if="pageLoading"/)
  assert.doesNotMatch(router, /await startShift5Leave/)
  assert.match(read('../src/api/index.ts'), /trackPageRequest\(\(\) => withRequestDeadline/)
})

test('dot matrix interpolates numeric diagonal phases instead of discrete shadow keyframes', () => {
  const css = read('../src/styles/loading.css')
  for (let i = 0; i < 5; i++) {
    assert.match(css, new RegExp(`@property --loader-diagonal-${i} \\{ syntax: '<number>';`))
    assert.match(css, new RegExp(`@keyframes dot-matrix-wave-${i} \\{\\s*0%, 100% \\{ --loader-diagonal-${i}: \\.2; \\}\\s*50% \\{ --loader-diagonal-${i}: 1;`))
  }
  assert.match(css, /animation-delay: 0s, calc\(var\(--loader-cycle, 1s\) \* \.25\)/)
  assert.match(css, /background: radial-gradient\(circle calc\(\.12em \+ \(var\(--loader-diagonal-0\) - 1\) \* \.045em\)/)
  assert.doesNotMatch(css, /(?:0|25|50|75|100)%\s*\{\s*box-shadow:/)
})
