import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import { setTimeout as delay } from 'node:timers/promises'
import { compileScript, parse } from '@vue/compiler-sfc'
import { transformSync } from 'esbuild'
import * as Vue from 'vue'

const read = path => readFileSync(new URL('../src/' + path, import.meta.url), 'utf8')
const keys = { dialog: Symbol('native-dialog'), message: Symbol('message'), notification: Symbol('notification') }
const descriptor = parse(read('components/feedback/FeedbackProvider.vue')).descriptor
const compiled = transformSync(compileScript(descriptor, { id: 'feedback-provider-test' }).content, { loader: 'ts', format: 'cjs' }).code
const module = { exports: {} }
const require = createRequire(import.meta.url)
new Function('require', 'module', 'exports', compiled)(id => {
  if (id.endsWith('/dialog/src/context')) return { dialogApiInjectionKey: keys.dialog }
  if (id.endsWith('/message/src/context')) return { messageApiInjectionKey: keys.message }
  if (id.endsWith('/notification/src/NotificationProvider')) return { notificationApiInjectionKey: keys.notification }
  if (id === './FeedbackMessages.vue') return { default: {} }
  return require(id)
}, module, module.exports)
const Provider = module.exports.default
Provider.render = () => Vue.getCurrentInstance().slots.default?.()[0]
const renderer = Vue.createRenderer({
  createElement: () => ({}), createText: text => ({ text }), createComment: text => ({ text }),
  insert: (node, parent) => { node.parent = parent }, remove() {}, patchProp() {},
  setText: (node, text) => { node.text = text }, setElementText() {},
  parentNode: node => node.parent, nextSibling: () => null,
})

function mount(t, native) {
  let api, state
  const Probe = { setup() {
    api = Object.fromEntries(Object.entries(keys).map(([name, key]) => [name, Vue.inject(key, null)]))
    state = Vue.getCurrentInstance().parent.setupState
    return () => null
  } }
  const app = renderer.createApp({ setup() {
    if (native) Vue.provide(keys.dialog, native)
    return () => Vue.h(Provider, {}, () => Vue.h(Probe))
  } })
  app.mount({})
  t.after(() => app.unmount())
  return { api, state }
}

test('native dialog methods preserve options, return values and explicit button overrides', t => {
  const calls = [], result = { destroy() {} }, destroyAll = () => {}
  const native = { destroyAll, ...Object.fromEntries(['create', 'success', 'warning', 'error', 'info'].map(method => [method, options => { calls.push({ method, options }); return result }])) }
  const { api } = mount(t, native)
  const callback = async () => false
  for (const method of ['create', 'success', 'warning', 'error', 'info']) {
    const options = { title: 'Confirm', onPositiveClick: callback, maskClosable: false, closeOnEsc: false, positiveButtonProps: { loading: true } }
    assert.equal(api.dialog[method](options), result)
    assert.deepEqual(calls.at(-1), { method, options: { ...options, positiveButtonProps: { type: 'primary', loading: true } } })
    assert.deepEqual(options.positiveButtonProps, { loading: true })
    assert.equal(calls.at(-1).options.onPositiveClick, callback)
  }
  api.dialog.warning({ positiveButtonProps: { type: 'error', disabled: true } })
  assert.deepEqual(calls.at(-1).options.positiveButtonProps, { type: 'error', disabled: true })
  assert.equal(api.dialog.destroyAll, destroyAll)
})

test('no native provider means no replacement confirmation implementation', t => {
  const { api } = mount(t)
  assert.equal(api.dialog, null)
  assert.doesNotMatch(descriptor.template.content, /FeedbackSurface|NDialog|dialogs/)
  const app = read('App.vue')
  assert.match(app, /<n-dialog-provider :to="embedded \? runtimeStyleTarget : undefined">/)
  assert.match(descriptor.template.content, /<FeedbackMessages :class="scopeClass"/)
  assert.doesNotMatch(descriptor.template.content, /\bcentered\b/)
})

test('message timer pauses on hover and retires only after leave', async t => {
  const { api, state } = mount(t)
  const events = []
  const entry = api.message.success('Saved', { duration: 80, onLeave: () => events.push('leave'), onAfterLeave: () => events.push('after') })
  state.pause(entry.id)
  await delay(110)
  assert.equal(state.messages.length, 1)
  state.resume(entry.id)
  await delay(110)
  assert.equal(state.messages.length, 0)
  assert.deepEqual(events, ['leave'])
  state.afterMessageLeave(entry.id)
  state.afterMessageLeave(entry.id)
  assert.deepEqual(events, ['leave', 'after'])
})

test('notifications share message stack and retain content, actions and lifecycle callbacks', async t => {
  const { api, state } = mount(t)
  const events = [], action = () => Vue.h('button', { onClick: () => events.push('action') }, 'Retry')
  const entry = api.notification.warning({ title: 'Warning', description: 'Description', content: 'Body', meta: 'Meta', action, duration: 0,
    onAfterEnter: () => events.push('entered'), onAfterShow: () => events.push('shown'),
    onLeave: () => events.push('leave'), onHide: () => events.push('hide'),
    onAfterLeave: () => events.push('left'), onAfterHide: () => events.push('hidden'),
    onClose: async () => false,
  })
  const message = state.messages[0]
  assert.equal(message.type, 'warning')
  assert.equal(message.closable, true)
  state.afterMessageEnter(message.id)
  assert.deepEqual(events, ['entered', 'shown'])
  const content = message.content()
  assert.equal(content[0].children[0], 'Warning')
  assert.equal(content[1].children[0], 'Description')
  assert.equal(content[2], 'Body')
  assert.equal(content[3].children[0], 'Meta')
  content[4].children[0].props.onClick()
  await state.closeMessage(message.id)
  assert.equal(state.messages.length, 1)
  entry.onClose = async () => true
  await state.closeMessage(message.id)
  state.afterMessageLeave(message.id)
  assert.equal(state.messages.length, 0)
  assert.deepEqual(events, ['entered', 'shown', 'action', 'leave', 'hide', 'left', 'hidden'])
})

test('destroyAll only removes notifications', t => {
  const { api, state } = mount(t)
  api.message.loading('Busy')
  api.notification.info({ content: 'Notice', duration: 60000 })
  api.notification.destroyAll()
  assert.equal(state.messages.length, 1)
  api.message.destroyAll()
  assert.equal(state.messages.length, 0)
})

test('message entry events and optional fade-scale do not alter the default source motion', () => {
  const messages = read('components/feedback/FeedbackMessages.vue')
  assert.match(messages, /@after-enter="emit\('afterEnter', entry.id\)"/)
  assert.match(messages, /afterEnter: \[id: string\]/)
  const surface = read('components/feedback/FeedbackSurface.vue')
  assert.match(surface, /animation: 'source'/)
  assert.match(surface, /animation: props.animation/)
  const motion = read('components/feedback/feedback-react.tsx')
  assert.match(motion, /p.animation === 'fade-scale'/)
  assert.match(motion, /duration: \.25/)
  assert.match(motion, /duration: \.2/)
  assert.match(motion, /: feedbackPanelMotion\(\)/)
  assert.match(motion, /reduced \? \{ initial: false as const/)
})
