<template>
  <slot />
  <!-- 提示信息 / 警告信息：兼容原Naive调用，自动关闭与原回调留在同一Vue上下文。 -->
  <Teleport :to="to || 'body'">
    <FeedbackMessages :class="scopeClass" :entries="messages" @close="closeMessage" @pause="pause" @resume="resume" @after-leave="afterMessageLeave" @after-enter="afterMessageEnter">
      <template #default="{ entry }"><RenderContent :content="entry.content" /></template>
    </FeedbackMessages>
  </Teleport>
</template>
<script setup lang="ts">
import { computed, defineComponent, h, inject, onBeforeUnmount, provide, reactive, shallowRef, type VNodeChild } from 'vue'
import type { DialogApi, DialogOptions, MessageApi, MessageOptions, MessageReactive, NotificationApi, NotificationOptions, NotificationReactive } from 'naive-ui'
// 提示信息 / 警告信息：消息和通知共用右上角表面；确认Dialog由外层原生NDialogProvider提供。
import { messageApiInjectionKey } from 'naive-ui/es/message/src/context'
import { notificationApiInjectionKey } from 'naive-ui/es/notification/src/NotificationProvider'
import { dialogApiInjectionKey } from 'naive-ui/es/dialog/src/context'
import FeedbackMessages from './FeedbackMessages.vue'

withDefaults(defineProps<{ to?: HTMLElement; scopeClass?: string }>(), { scopeClass: '' })
type MessageItem = MessageReactive & MessageOptions & { id: string; content: string | (() => VNodeChild); notification?: NotificationReactive }
const activeMessages = shallowRef<MessageItem[]>([])
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
async function closeMessage(id: string) {
  const item = activeMessages.value.find(m => m.id === id)
  if (item?.notification && await item.notification.onClose?.() === false) return
  if (!item?.notification) item?.onClose?.()
  hideMessage(id)
}
function afterMessageEnter(id: string) { const item = activeMessages.value.find(m => m.id === id); item?.notification?.onAfterEnter?.(); item?.notification?.onAfterShow?.() }
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
// 高亮弧边按钮：仅补主按钮默认类型，弹窗生命周期、异步false、焦点与动画继续交给原生provider。
const nativeDialog = inject(dialogApiInjectionKey, null)
if (nativeDialog) provide(dialogApiInjectionKey, {
  ...nativeDialog,
  ...Object.fromEntries((['create', 'success', 'warning', 'error', 'info'] as const).map(method => [method, (options: DialogOptions) => nativeDialog[method]({ ...options, positiveButtonProps: { type: 'primary', ...options?.positiveButtonProps } })])),
} as DialogApi)
// 提示信息 / 警告信息：保留通知内容、状态、操作和关闭回调，只合并外观、位置与动效。
function notification(options: NotificationOptions): NotificationReactive {
  let item: MessageReactive
  const entry = reactive({ ...options, key: `feedback-notification-${++sequence}`, destroy: () => item.destroy(), hide: () => item.destroy(), deactivate: () => item.destroy() }) as NotificationReactive
  const render = (value: string | (() => VNodeChild) | undefined) => typeof value === 'function' ? value() : value
  item = message(entry.type || 'info', () => [
    entry.title ? h('strong', null, [render(entry.title)]) : null,
    entry.description ? h('div', null, [render(entry.description)]) : null,
    render(entry.content),
    entry.meta ? h('div', null, [render(entry.meta)]) : null,
    entry.action ? h('div', null, [render(entry.action)]) : null,
  ], {
    duration: entry.duration ?? 4500, closable: entry.closable ?? true, keepAliveOnHover: entry.keepAliveOnHover ?? true,
    onLeave: () => { entry.onLeave?.(); entry.onHide?.() },
    onAfterLeave: () => { entry.onAfterLeave?.(); entry.onAfterHide?.() },
  })
  ;(item as MessageItem).notification = entry
  return entry
}
const notificationApi = { create: notification, open: notification, destroyAll: () => activeMessages.value.filter(item => item.notification).forEach(item => hideMessage(item.id)), ...Object.fromEntries(['success','error','warning','info'].map(type => [type, (options: NotificationOptions) => notification({ ...options, type: type as NotificationOptions['type'] })])) } as NotificationApi
provide(messageApiInjectionKey, messageApi)
provide(notificationApiInjectionKey, notificationApi)
onBeforeUnmount(() => { for (const state of timers.values()) clearTimeout(state.timer); timers.clear(); retiredMessages.clear(); activeMessages.value = [] })
</script>
