<template>
  <slot />
  <!-- 提示信息 / 警告信息：兼容原Naive调用，自动关闭与原回调留在同一Vue上下文。 -->
  <Teleport :to="to || 'body'">
    <FeedbackMessages :entries="messages" centered @close="closeMessage" @pause="pause" @resume="resume" @after-leave="afterMessageLeave">
      <template #default="{ entry }"><RenderContent :content="entry.content" /></template>
    </FeedbackMessages>
  </Teleport>
  <FeedbackSurface v-for="item in dialogs" :key="item.key" :show="item.visible" modal
    :label="typeof item.title === 'string' ? item.title : '提示'" panel-class="kf-feedback-panel"
    :scope-class="scopeClass" :z-index="item.zIndex || 2000"
    :close-on-escape="item.closeOnEsc !== false" :close-on-click-outside="item.maskClosable !== false"
    @close="(reason, event) => dismiss(item, reason, event)" @after-enter="item.onAfterEnter?.()" @after-leave="afterDialogLeave(item)">
    <NDialog v-bind="dialogProps(item)" role="presentation" :positive-button-props="{ type: 'primary', ...item.positiveButtonProps }"
      @positive-click="event => runAction(item, 'onPositiveClick', event)"
      @negative-click="event => runAction(item, 'onNegativeClick', event)" @close="runAction(item, 'onClose')" />
  </FeedbackSurface>
</template>
<script setup lang="ts">
import { computed, defineComponent, onBeforeUnmount, provide, reactive, shallowRef, type VNodeChild } from 'vue'
import { NDialog, type DialogApi, type DialogOptions, type DialogReactive, type MessageApi, type MessageOptions, type MessageReactive } from 'naive-ui'
// Naive版本绑定的注入适配边界：契约测试保证原useMessage/useDialog仍取得此API，业务调用无需改写。
import { messageApiInjectionKey } from 'naive-ui/es/message/src/context'
import { dialogApiInjectionKey } from 'naive-ui/es/dialog/src/context'
import FeedbackMessages from './FeedbackMessages.vue'
import FeedbackSurface from './FeedbackSurface.vue'

withDefaults(defineProps<{ to?: HTMLElement; scopeClass?: string }>(), { scopeClass: '' })
type MessageItem = MessageReactive & MessageOptions & { id: string; content: string | (() => VNodeChild) }
type DialogItem = DialogReactive & { visible: boolean }
const activeMessages = shallowRef<MessageItem[]>([]), dialogs = shallowRef<DialogItem[]>([])
const retiredMessages = new Map<string, MessageItem>()
const timers = new Map<string, { timer?: ReturnType<typeof setTimeout>; remaining: number; started: number }>()
let sequence = 0
const messages = computed(() => activeMessages.value.map(item => ({ ...item, type: item.type || 'info', message: item.content })))
const RenderContent = defineComponent({ props: ['content'], setup: props => () => typeof props.content === 'function' ? props.content() : props.content as VNodeChild })
function schedule(id: string) {
  const state = timers.get(id)
  if (!state || state.remaining <= 0) return
  state.started = Date.now(); state.timer = setTimeout(() => hideMessage(id), state.remaining)
}
function hideMessage(id: string) {
  const item = activeMessages.value.find(m => m.id === id)
  if (!item) return
  clearTimeout(timers.get(id)?.timer); timers.delete(id); retiredMessages.set(id, item)
  item.onLeave?.(); activeMessages.value = activeMessages.value.filter(m => m !== item)
}
function closeMessage(id: string) { const item = activeMessages.value.find(m => m.id === id); item?.onClose?.(); hideMessage(id) }
function afterMessageLeave(id: string) { retiredMessages.get(id)?.onAfterLeave?.(); retiredMessages.delete(id) }
function pause(id: string) { const item = activeMessages.value.find(m => m.id === id), state = timers.get(id); if (item?.keepAliveOnHover !== false && state?.timer) { clearTimeout(state.timer); state.timer = undefined; state.remaining = Math.max(1, state.remaining - (Date.now() - state.started)) } }
function resume(id: string) { if (!timers.get(id)?.timer) schedule(id) }
function message(type: MessageItem['type'], content: MessageItem['content'], options: MessageOptions = {}): MessageReactive {
  const id = `feedback-message-${++sequence}`
  const item = reactive({ duration: type === 'loading' ? 0 : 3000, closable: false, showIcon: true, keepAliveOnHover: true, ...options, id, type, content, destroy: () => hideMessage(id) }) as MessageItem
  activeMessages.value = [...activeMessages.value, item]
  if (item.duration && item.duration > 0) { timers.set(id, { remaining: item.duration, started: Date.now() }); schedule(id) }
  return item
}
const messageApi = { create: (content, options) => message(options?.type || 'default', content, options), destroyAll: () => activeMessages.value.forEach(m => hideMessage(m.id)), ...Object.fromEntries(['success','error','warning','info','loading'].map(type => [type, (content: MessageItem['content'], options?: MessageOptions) => message(type as MessageItem['type'], content, options)])) } as MessageApi
function createDialog(options: DialogOptions, type: DialogItem['type'] = 'default'): DialogReactive {
  const key = `feedback-dialog-${++sequence}`
  const item = reactive({ type, ...options, key, visible: true, destroy: () => { item.visible = false } }) as DialogItem
  dialogs.value = [...dialogs.value, item]; return item
}
function dialogProps(item: DialogItem) {
  const { onPositiveClick, onNegativeClick, onClose, key, visible, destroy, ...rest } = item
  return rest
}
async function runAction(item: DialogItem, key: 'onPositiveClick' | 'onNegativeClick' | 'onClose', event?: MouseEvent) {
  const callback = item[key] as ((event?: MouseEvent) => unknown) | undefined
  const result = callback?.(event)
  if (result instanceof Promise) {
    item.loading = true
    try { if (await result !== false) item.visible = false } finally { item.loading = false }
  } else if (result !== false) item.visible = false
}
function dismiss(item: DialogItem, reason: 'escape' | 'outside', event?: MouseEvent) {
  if (reason === 'escape') item.onEsc?.()
  else if (event) item.onMaskClick?.(event)
  item.visible = false
}
function afterDialogLeave(item: DialogItem) { dialogs.value = dialogs.value.filter(d => d !== item); item.onAfterLeave?.() }
const dialogApi = { create: createDialog, destroyAll: () => dialogs.value.forEach(d => { d.visible = false }), ...Object.fromEntries(['success','warning','error','info'].map(type => [type, (options: DialogOptions) => createDialog(options, type as DialogItem['type'])])) } as DialogApi
provide(messageApiInjectionKey, messageApi); provide(dialogApiInjectionKey, dialogApi)
onBeforeUnmount(() => { for (const state of timers.values()) clearTimeout(state.timer); timers.clear(); retiredMessages.clear(); activeMessages.value = []; dialogs.value = [] })
</script>
