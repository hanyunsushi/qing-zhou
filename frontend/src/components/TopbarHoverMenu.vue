<template>
  <div
    ref="rootRef"
    class="topbar-hover-menu"
    @pointerenter="handleTriggerEnter"
    @pointerleave="handlePointerLeave"
    @focusin="handleTriggerEnter"
    @focusout="handleFocusOut"
    @keydown.esc="closeMenu"
  >
    <!-- 下拉选择菜单 / 悬浮下拉菜单：左右独立命中，文字区悬浮、箭头区点击，共用一个互斥面板。 -->
    <div v-if="props.splitLabel" class="topbar-split-trigger" role="group" :aria-label="props.splitLabel">
      <button
        type="button"
        class="topbar-split-label"
        aria-haspopup="menu"
        :aria-expanded="props.open"
        @pointerenter="openSplitHover"
        @focus="openSplitHover"
        @click="openSplitHover"
      >{{ props.splitLabel }}</button>
      <span class="topbar-trigger-divider" aria-hidden="true" />
      <button
        type="button"
        class="topbar-split-toggle"
        :aria-label="`${props.splitLabel}菜单`"
        aria-haspopup="menu"
        :aria-expanded="props.open"
        @click="toggleSplitClick"
      >
        <span class="topbar-trigger-chevron" :class="{ 'is-open': props.open }" aria-hidden="true" />
      </button>
    </div>
    <slot v-else name="trigger" :open="props.open" />
    <span
      v-if="props.open"
      class="topbar-hover-menu-hit-bridge"
      :class="{ 'is-positioned': panelPositioned }"
      :style="panelStyle"
      aria-hidden="true"
    />
    <Transition name="topbar-menu" :duration="{ enter: 400, leave: 0 }" @after-leave="resetPanelPosition">
      <div
        v-if="props.open"
        ref="panelRef"
        class="topbar-hover-menu-panel"
        :class="{ 'is-positioned': panelPositioned }"
        :style="panelStyle"
        role="menu"
        @pointerenter="openMenu"
        @pointerleave="handlePointerLeave"
      >
        <div class="topbar-hover-menu-panel-content">
          <template v-for="option in props.options" :key="String(option.key)">
            <div v-if="option.type === 'divider'" class="topbar-hover-menu-divider" role="separator" />
            <button
              v-else
              type="button"
              class="topbar-hover-menu-option"
              role="menuitem"
              @click="selectOption(String(option.key))"
            >
              <component :is="option.icon" v-if="option.icon" class="topbar-hover-menu-option-icon" aria-hidden="true" />
              <span>{{ option.label }}</span>
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface TopbarHoverMenuOption {
  label?: string
  key: string
  type?: string
  icon?: unknown
}

const props = withDefaults(defineProps<{
  options: TopbarHoverMenuOption[]
  open: boolean
  splitLabel?: string
}>(), {})
const emit = defineEmits<{ open: []; close: []; select: [key: string] }>()

const rootRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelPositioned = ref(false)
const panelStyle = ref<Record<string, string>>({})
const splitMode = ref<'hover' | 'click' | null>(null)
let positionFrame: number | undefined

function resetPanelPosition() {
  panelPositioned.value = false
  panelStyle.value = {}
}

function positionPanel() {
  const root = rootRef.value
  const panel = panelRef.value
  if (!root || !panel) return

  const rootRect = root.getBoundingClientRect()
  const panelRect = panel.getBoundingClientRect()
  const gutter = 8
  const centeredLeft = rootRect.left + rootRect.width / 2 - panelRect.width / 2
  const maxLeft = Math.max(gutter, window.innerWidth - panelRect.width - gutter)
  const viewportLeft = Math.min(Math.max(centeredLeft, gutter), maxLeft)

  panelStyle.value = {
    '--topbar-menu-left': `${viewportLeft - rootRect.left}px`,
    '--topbar-menu-top': `${rootRect.height + 8}px`,
    '--topbar-menu-bridge-width': `${panelRect.width}px`,
  }
  panelPositioned.value = true
}

function schedulePosition() {
  if (positionFrame !== undefined) window.cancelAnimationFrame(positionFrame)
  positionFrame = window.requestAnimationFrame(() => {
    positionFrame = undefined
    positionPanel()
  })
}

function handleViewportResize() {
  if (props.open) schedulePosition()
}

function openMenu() {
  emit('open')
}

function closeMenu() {
  splitMode.value = null
  emit('close')
}

function handleTriggerEnter() {
  if (!props.splitLabel) openMenu()
}

function openSplitHover(event?: PointerEvent | FocusEvent | MouseEvent) {
  if (event && 'pointerType' in event && event.pointerType === 'touch') return
  if (splitMode.value !== 'click') splitMode.value = 'hover'
  openMenu()
}

function toggleSplitClick() {
  if (props.open && splitMode.value === 'click') {
    closeMenu()
    return
  }
  splitMode.value = 'click'
  openMenu()
}

function handlePointerLeave(event?: PointerEvent) {
  if (props.splitLabel && (splitMode.value === 'click'
    || (event?.relatedTarget && rootRef.value?.contains(event.relatedTarget as Node)))) return
  scheduleClose()
}

function handleOutsidePointer(event: PointerEvent) {
  if (props.splitLabel && props.open && !rootRef.value?.contains(event.target as Node)) closeMenu()
}

function scheduleClose() {
  closeMenu()
}

function handleFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget as Node | null
  if (!nextTarget || !(event.currentTarget as HTMLElement).contains(nextTarget)) scheduleClose()
}

function selectOption(key: string) {
  emit('select', key)
}

watch(() => props.open, async (open) => {
  if (!open) {
    splitMode.value = null
    resetPanelPosition()
    return
  }
  await nextTick()
  schedulePosition()
})

onMounted(() => {
  window.addEventListener('resize', handleViewportResize)
  document.addEventListener('pointerdown', handleOutsidePointer)
})
onBeforeUnmount(() => {
  if (positionFrame !== undefined) window.cancelAnimationFrame(positionFrame)
  window.removeEventListener('resize', handleViewportResize)
  document.removeEventListener('pointerdown', handleOutsidePointer)
})
</script>
