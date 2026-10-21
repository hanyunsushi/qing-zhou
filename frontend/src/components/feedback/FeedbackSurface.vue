<template>
  <!-- 提示信息 / 组件绘制动画：原React表面负责进入/离开，既有Vue内容和按钮保持原上下文。 -->
  <span ref="host" class="kf-feedback-react-host" />
  <Teleport v-if="target" :to="target"><slot /></Teleport>
</template>
<script setup lang="ts">
import { ref, shallowRef, watch, onMounted, onUnmounted } from 'vue'
import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { FeedbackMount } from './feedback-react'
import './feedback.css'
const props = withDefaults(defineProps<{ show: boolean; modal?: boolean; label?: string; labelId?: string; panelClass?: string; scopeClass?: string; zIndex?: number; closeOnEscape?: boolean; closeOnClickOutside?: boolean }>(), { modal: false, panelClass: 'kf-feedback-panel', zIndex: 2000, closeOnEscape: true, closeOnClickOutside: false })
const emit = defineEmits<{ close: [reason: 'escape' | 'outside', event?: MouseEvent]; afterEnter: []; afterLeave: [] }>()
const host = ref<HTMLElement | null>(null), target = shallowRef<HTMLElement | null>(null)
let root: Root | undefined
const setSlot = (node: HTMLDivElement | null) => { target.value = node }
function render() {
  if (root) flushSync(() => root!.render(createElement(FeedbackMount, { open: props.show, modal: props.modal, label: props.label, labelId: props.labelId, panelClass: props.panelClass, scopeClass: props.scopeClass, zIndex: props.zIndex, closeOnEscape: props.closeOnEscape, closeOnClickOutside: props.closeOnClickOutside, setSlot, onClose: (reason, event) => emit('close', reason, event), onEntered: () => emit('afterEnter'), onExited: () => emit('afterLeave') })))
}
watch(() => ({ ...props }), render, { flush: 'post' })
onMounted(() => { root = createRoot(host.value!); render() })
onUnmounted(() => { root?.unmount(); root = undefined; target.value = null })
</script>
