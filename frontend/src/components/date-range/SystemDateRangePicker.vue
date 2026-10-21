<script setup lang="ts">
// 日期范围选择器 / 组件绘制动画：React独占日历DOM，Vue只转发props和应用后的日期。
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { DateRangePicker as ReactDateRangePicker } from './date-range-picker-react'
import type { DateRange, DateRangePickerProps } from './date-range-picker-react'

const props = defineProps<Omit<DateRangePickerProps, 'value' | 'onChange'> & { modelValue?: DateRange | null }>()
const emit = defineEmits<{ 'update:modelValue': [range: DateRange]; change: [range: DateRange] }>()
const host = ref<HTMLElement | null>(null)
let root: Root | undefined
let observer: MutationObserver | undefined
let frame = 0
// 日期范围选择器 / 响应式：保留源单表面，正文原生滚动揭示完整日历与确认区。
function revealCalendar() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    const panel = host.value?.querySelector<HTMLElement>('[data-testid="date-range-panel"]')
    if (!panel || panel.closest('.modal-content')) return
    const bottom = panel.getBoundingClientRect().bottom
    if (bottom <= window.innerHeight - 8) return
    let scrollParent = panel.parentElement
    while (scrollParent && !(scrollParent.scrollHeight > scrollParent.clientHeight && /auto|scroll/.test(getComputedStyle(scrollParent).overflowY))) scrollParent = scrollParent.parentElement
    const target = scrollParent || window
    target.scrollBy({ top: bottom - window.innerHeight + 8, behavior: 'instant' })
  })
}
function applied(range: DateRange) { emit('update:modelValue', range); emit('change', range) }
function render() {
  if (!root) return
  const { modelValue, ...options } = props
  flushSync(() => root!.render(React.createElement(ReactDateRangePicker, { ...options, value: modelValue, onChange: applied })))
}
onMounted(() => { root = createRoot(host.value!); render(); observer = new MutationObserver(revealCalendar); observer.observe(host.value!, { childList: true, subtree: true }); window.addEventListener('resize', revealCalendar) })
watch(() => ({ ...props }), render, { flush: 'post' })
onBeforeUnmount(() => { observer?.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('resize', revealCalendar); root?.unmount(); root = undefined })
</script>

<template>
  <!-- 日期范围选择器：保留源码单表面变形、滚动日期字词、双月/单月和完整键盘操作。 -->
  <div ref="host" class="date-range-react-host" />
</template>

<style scoped>
/* 日期范围选择器：桥接容器透明，不接管源码定位、尺寸与动画。 */
.date-range-react-host { display: inline-block; min-width: 0; max-width: 100%; vertical-align: top; }
</style>
