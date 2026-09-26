<template>
  <div
    class="page-scrollbar"
    aria-hidden="true"
    @pointerdown="onTrackPointerDown"
  >
    <button
      v-if="hasOverflow"
      class="page-scrollbar-thumb"
      type="button"
      aria-label="页面滚动条"
      :style="{ height: `${thumbHeight}px`, transform: `translateY(${thumbTop}px)` }"
      @pointerdown.stop="onThumbPointerDown"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const viewportHeight = ref(0)
const documentHeight = ref(0)
const scrollTop = ref(0)
const dragging = ref(false)
let frame = 0
let dragStartY = 0
let dragStartScrollTop = 0
let resizeObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null

const hasOverflow = computed(() => documentHeight.value > viewportHeight.value + 1)
const thumbHeight = computed(() => {
  if (!hasOverflow.value || viewportHeight.value <= 0) return 0
  return Math.max(24, viewportHeight.value * viewportHeight.value / documentHeight.value)
})
const thumbTravel = computed(() => Math.max(0, viewportHeight.value - thumbHeight.value))
const thumbTop = computed(() => {
  const maxScroll = Math.max(1, documentHeight.value - viewportHeight.value)
  return Math.min(thumbTravel.value, Math.max(0, scrollTop.value / maxScroll * thumbTravel.value))
})

function sync() {
  viewportHeight.value = window.innerHeight
  documentHeight.value = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
  scrollTop.value = document.body.scrollTop || document.documentElement.scrollTop || window.scrollY
}

function scheduleSync() {
  if (frame) return
  frame = window.requestAnimationFrame(() => {
    frame = 0
    sync()
  })
}

function scrollToRatio(clientY: number) {
  const maxScroll = Math.max(0, documentHeight.value - viewportHeight.value)
  const trackY = Math.min(viewportHeight.value, Math.max(0, clientY))
  const ratio = thumbTravel.value ? (trackY - thumbHeight.value / 2) / thumbTravel.value : 0
  document.body.scrollTo({ top: Math.min(maxScroll, Math.max(0, ratio * maxScroll)), behavior: 'auto' })
}

function onTrackPointerDown(event: PointerEvent) {
  if (!hasOverflow.value || event.button !== 0) return
  scrollToRatio(event.clientY)
}

function onThumbPointerDown(event: PointerEvent) {
  if (!hasOverflow.value || event.button !== 0) return
  dragging.value = true
  dragStartY = event.clientY
  dragStartScrollTop = scrollTop.value
  document.body.classList.add('page-scrollbar-dragging')
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp, { once: true })
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value || !thumbTravel.value) return
  const maxScroll = Math.max(0, documentHeight.value - viewportHeight.value)
  const next = dragStartScrollTop + (event.clientY - dragStartY) / thumbTravel.value * maxScroll
  document.body.scrollTo({ top: Math.min(maxScroll, Math.max(0, next)), behavior: 'auto' })
}

function onPointerUp() {
  dragging.value = false
  document.body.classList.remove('page-scrollbar-dragging')
  window.removeEventListener('pointermove', onPointerMove)
}

onMounted(() => {
  sync()
  document.body.addEventListener('scroll', scheduleSync, { passive: true })
  window.addEventListener('resize', scheduleSync)
  window.visualViewport?.addEventListener('resize', scheduleSync)
  resizeObserver = new ResizeObserver(scheduleSync)
  resizeObserver.observe(document.documentElement)
  resizeObserver.observe(document.body)
  mutationObserver = new MutationObserver(scheduleSync)
  mutationObserver.observe(document.body, { childList: true, subtree: true })
})

onBeforeUnmount(() => {
  if (frame) window.cancelAnimationFrame(frame)
  document.body.removeEventListener('scroll', scheduleSync)
  window.removeEventListener('resize', scheduleSync)
  window.visualViewport?.removeEventListener('resize', scheduleSync)
  window.removeEventListener('pointermove', onPointerMove)
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  resizeObserver = null
  mutationObserver = null
  document.body.classList.remove('page-scrollbar-dragging')
})
</script>

<style scoped>
.page-scrollbar {
  position: fixed;
  z-index: 120;
  inset: 0 0 0 auto;
  width: var(--scrollbar-track-width);
  border-left: 1px solid var(--border-strong);
  background: transparent;
  pointer-events: auto;
}
.page-scrollbar-thumb {
  position: absolute;
  top: 0;
  /* Auto-center against the track's actual padding box, including any border. */
  left: 0;
  right: 0;
  width: var(--scrollbar-thumb-width);
  margin-inline: auto;
  min-height: 24px;
  display: block;
  padding: 0;
  border: 0;
  outline: 0;
  border-radius: 999px;
  background: #c7c7c7;
  appearance: none;
  -webkit-appearance: none;
  cursor: grab;
  touch-action: none;
}
.page-scrollbar-thumb:hover,
.page-scrollbar-thumb:focus-visible { background: #a8a8a8; }
.page-scrollbar-thumb:active { cursor: grabbing; }
:global(body.page-scrollbar-dragging) { user-select: none; cursor: grabbing; }
</style>
