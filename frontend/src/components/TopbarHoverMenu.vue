<template>
  <div
    ref="rootRef"
    class="topbar-hover-menu"
    @pointerenter="openMenu"
    @pointerleave="scheduleClose"
    @focusin="openMenu"
    @focusout="handleFocusOut"
    @keydown.esc="closeMenu"
  >
    <slot name="trigger" :open="props.open" />
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
        @pointerleave="scheduleClose"
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
}>(), {})
const emit = defineEmits<{ open: []; close: []; select: [key: string] }>()

const rootRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelPositioned = ref(false)
const panelStyle = ref<Record<string, string>>({})
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
  emit('close')
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
    resetPanelPosition()
    return
  }
  await nextTick()
  schedulePosition()
})

onMounted(() => window.addEventListener('resize', handleViewportResize))
onBeforeUnmount(() => {
  if (positionFrame !== undefined) window.cancelAnimationFrame(positionFrame)
  window.removeEventListener('resize', handleViewportResize)
})
</script>
