import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import { effectScope, nextTick, onScopeDispose, ref, watch } from 'vue'

const source = readFileSync(new URL('../src/utils/page-loading.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source.replace(/^import .*$/gm, '').replace(/^export /gm, ''), {
  compilerOptions: { target: ts.ScriptTarget.ESNext },
}).outputText
const plain = value => JSON.parse(JSON.stringify(value))

test('loading centers use the visible loaded region, excluding persistent chrome and offscreen content', () => {
  const center = runInNewContext(compiled + '\nloadingRegionCenter', { ref })
  const viewport = { left: 0, top: 0, right: 1167, bottom: 816 }
  assert.deepEqual(plain(center(null, viewport)), { left: '583.5px', top: '408px', visibility: 'visible' })
  assert.deepEqual(plain(center({ left: 264, top: 64, right: 1151, bottom: 2000 }, viewport, 64)),
    { left: '707.5px', top: '440px', visibility: 'visible' })
  assert.deepEqual(plain(center({ left: 490, top: 200, right: 1123, bottom: 1500 }, viewport, 64)),
    { left: '806.5px', top: '508px', visibility: 'visible' })
  assert.deepEqual(plain(center({ left: 264, top: -600, right: 1151, bottom: 1800 }, viewport, 64)),
    { left: '707.5px', top: '440px', visibility: 'visible' })
  assert.equal(center({ left: 264, top: 900, right: 1151, bottom: 1500 }, viewport, 64).visibility, 'hidden')
  assert.deepEqual(plain(center(null, { left: 0, top: 100, right: 394, bottom: 500 })),
    { left: '197px', top: '300px', visibility: 'visible' })
})

test('loading position follows sidebar resize, scroll and visual viewport and disposes all listeners', async () => {
  const listeners = new Map(), frames = new Map(), observers = new Set()
  let frameId = 0
  const events = prefix => ({
    addEventListener: (name, fn) => listeners.set(`${prefix}:${name}`, fn),
    removeEventListener: name => listeners.delete(`${prefix}:${name}`),
  })
  const viewport = { offsetLeft: 0, offsetTop: 0, width: 1167, height: 816, ...events('viewport') }
  const win = { innerWidth: 1167, innerHeight: 816, visualViewport: viewport, ...events('window') }
  const header = { getBoundingClientRect: () => ({ bottom: 64 }) }
  const rect = { left: 264, top: 64, right: 1151, bottom: 2000 }
  const target = {
    isConnected: true, classList: { contains: () => false },
    closest: () => ({ querySelector: () => header }), getBoundingClientRect: () => rect,
  }
  const model = runInNewContext(compiled + '\n({beginPageLoad, finishPageLoad, usePageLoadingPosition})', {
    ref, watch, nextTick, onScopeDispose, window: win, document: events('document'),
    requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId },
    cancelAnimationFrame: id => frames.delete(id),
    ResizeObserver: class {
      constructor(fn) { this.fn = fn; observers.add(this) }
      observe() {}
      disconnect() { observers.delete(this) }
    },
  })
  const token = model.beginPageLoad(target), scope = effectScope()
  const position = scope.run(() => model.usePageLoadingPosition())
  assert.equal(position.value.left, '707.5px')
  // The mobile layout is committed by Vue after child/parent mount callbacks.
  viewport.width = 394; rect.left = 0; rect.right = 394
  await nextTick()
  assert.equal(position.value.left, '197px')
  viewport.width = 1167; rect.left = 264; rect.right = 1151
  const flush = () => { const jobs = [...frames.values()]; frames.clear(); jobs.forEach(fn => fn()) }
  rect.left = 72
  observers.values().next().value.fn(); flush()
  assert.equal(position.value.left, '611.5px')
  rect.top = -400
  listeners.get('document:scroll')(); flush()
  assert.equal(position.value.top, '440px')
  viewport.width = 394; viewport.height = 500; rect.left = 0; rect.right = 394
  listeners.get('viewport:resize')(); flush()
  assert.equal(position.value.left, '197px')
  assert.equal(position.value.top, '282px')
  model.finishPageLoad(token)
  assert.equal(observers.size, 0)
  assert.equal(listeners.size, 0)
  assert.equal(frames.size, 0)
  scope.stop()
})
