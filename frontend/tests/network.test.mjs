import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { getEventListeners } from 'node:events'
import ts from 'typescript'

function moduleURL(source) {
  return 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText).toString('base64')
}
const networkURL = moduleURL(await readFile(new URL('../src/api/network.ts', import.meta.url), 'utf8'))
const { withRequestDeadline } = await import(networkURL)
const apiSource = (await readFile(new URL('../src/api/index.ts', import.meta.url), 'utf8'))
  .replace("import { navigateWithinConsole, embeddedRequestSignal } from '@/runtime/runtime-keys'", 'const navigateWithinConsole = path => globalThis.testEmbeddedNavigate?.(path); const embeddedRequestSignal = signal => signal')
  .replace("import { useAuthStore } from '@/stores/auth'", 'const useAuthStore = () => globalThis.testAuth')
  .replace("import { trackPageRequest } from '@/utils/page-loading'", 'const trackPageRequest = run => run()')
  .replaceAll("from './network'", `from '${networkURL}'`)
const api = await import(moduleURL(apiSource))
globalThis.testAuth = { token: 'test-token', logout() {} }

const untilAborted = signal => new Promise((resolve, reject) => {
  signal.addEventListener('abort', () => reject(signal.reason), { once: true })
})

test('default budget and timers/listeners are cleaned after success', async t => {
  let delay, cleared
  t.mock.method(globalThis, 'setTimeout', (fn, ms) => { delay = ms; return 123 })
  t.mock.method(globalThis, 'clearTimeout', id => { cleared = id })
  const parent = new AbortController()
  assert.equal(await withRequestDeadline({ signal: parent.signal }, async () => 42), 42)
  assert.equal(delay, 45_000)
  assert.equal(cleared, 123)
  assert.equal(getEventListeners(parent.signal, 'abort').length, 0)
})

test('deadline aborts body consumption, not just response headers', async t => {
  let calls = 0
  t.mock.method(globalThis, 'fetch', async (path, opts) => {
    calls++
    return { ok: true, status: 200, json: () => untilAborted(opts.signal) }
  })
  await assert.rejects(api.apiGet('/slow-body', { timeoutMs: 15 }), { name: 'TimeoutError' })
  assert.equal(calls, 1)
})

test('caller cancellation is propagated and listener removed', async () => {
  const parent = new AbortController()
  const pending = withRequestDeadline({ signal: parent.signal, timeoutMs: 0 }, untilAborted)
  parent.abort(new DOMException('navigation', 'AbortError'))
  await assert.rejects(pending, { name: 'AbortError', message: 'navigation' })
  assert.equal(getEventListeners(parent.signal, 'abort').length, 0)
})

test('already canceled requests never reach fetch', async t => {
  const parent = new AbortController(); parent.abort()
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => { throw new Error('unexpected fetch') })
  await assert.rejects(api.apiPost('/write', { value: 1 }, { signal: parent.signal }), { name: 'AbortError' })
  assert.equal(fetchMock.mock.callCount(), 0)
})

test('failed writes are sent exactly once, keeping method/body/auth', async t => {
  const requests = []
  t.mock.method(globalThis, 'fetch', async (path, opts) => {
    requests.push(opts)
    return { ok: false, status: 503, json: async () => ({ msg: 'unavailable' }) }
  })
  await assert.rejects(api.apiPost('/write', { value: 1 }), { status: 503 })
  await assert.rejects(api.apiPut('/write', { value: 2 }), { status: 503 })
  await assert.rejects(api.apiDelete('/write'), { status: 503 })
  assert.deepEqual(requests.map(r => r.method), ['POST', 'PUT', 'DELETE'])
  assert.equal(requests[0].body, '{"value":1}')
  assert.equal(requests[0].headers.Authorization, 'Bearer test-token')
})

test('successful JSON parsing failures are errors, not empty successful lists', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('truncated') } }))
  await assert.rejects(api.apiList('/broken'), { name: 'SyntaxError' })
})

test('existing envelope/raw/list callers stay compatible', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, status: 200, json: async () => ({ data: [1, 2] }) }))
  assert.deepEqual(await api.apiList('/list'), [1, 2])
  assert.deepEqual(await api.apiGetRaw('/raw'), { data: [1, 2] })
})

test('failure also cleans cancellation listeners', async () => {
  const parent = new AbortController()
  await assert.rejects(withRequestDeadline({ signal: parent.signal }, async () => { throw new Error('offline') }), /offline/)
  assert.equal(getEventListeners(parent.signal, 'abort').length, 0)
})

test('embedded requests use the Console API namespace without changing standalone paths', async t => {
  const previous = globalThis.__QINGZHOU_MICROFRONTEND__
  t.after(() => { globalThis.__QINGZHOU_MICROFRONTEND__ = previous })
  const paths = []
  t.mock.method(globalThis, 'fetch', async path => { paths.push(path); return { ok: true, status: 200, json: async () => ({ data: [] }) } })
  globalThis.__QINGZHOU_MICROFRONTEND__ = true
  await api.apiList('/api/admin/nodes')
  globalThis.__QINGZHOU_MICROFRONTEND__ = false
  await api.apiList('/api/admin/nodes')
  assert.deepEqual(paths, ['/api/kreeproxy/api/admin/nodes', '/api/admin/nodes'])
})

test('rejected authentication submissions preserve their error without navigating; expired private requests still redirect', async t => {
  const previous = globalThis.__QINGZHOU_MICROFRONTEND__
  t.after(() => { globalThis.__QINGZHOU_MICROFRONTEND__ = previous; delete globalThis.testEmbeddedNavigate })
  const previousWindow = globalThis.window
  globalThis.window = { location: { hash: '' } }
  t.after(() => { if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow })
  globalThis.__QINGZHOU_MICROFRONTEND__ = true
  const destinations = []
  globalThis.testEmbeddedNavigate = path => destinations.push(path)
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 401, json: async () => ({ msg: '用户名或密码错误' }) }))
  for (const path of ['/api/auth/login', '/api/auth/register', '/api/auth/forgot', '/api/auth/oauth2/start']) {
    await assert.rejects(api.apiPost(path, {}), { status: 401, message: '用户名或密码错误' })
  }
  assert.deepEqual(destinations, [])
  await assert.rejects(api.apiGet('/api/user/profile'), { status: 401 })
  assert.deepEqual(destinations, ['/login'])
})
