<template>
  <!-- 提示信息 / 警告信息：保留通知的自动关闭及原关闭入口，不生成确认/取消按钮。 -->
  <div class="kf-feedback-messages" :class="{ 'kf-feedback-messages-center': centered }" aria-live="polite" aria-relevant="additions text">
    <FeedbackSurface v-for="entry in retained" :key="entry.id" :show="entry.visible" panel-class="kf-feedback-panel kf-feedback-message" @after-enter="emit('afterEnter', entry.id)" @after-leave="finish(entry.id)">
      <div :data-type="entry.type" class="kf-feedback-message-content" :role="entry.type === 'error' ? 'alert' : 'status'" @mouseenter="emit('pause', entry.id)" @mouseleave="emit('resume', entry.id)">
        <slot name="content" :entry="entry">
          <DotMatrixLoader v-if="entry.type === 'loading' && entry.showIcon !== false" class="kf-feedback-symbol" />
          <svg v-else-if="entry.showIcon !== false" class="kf-feedback-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
            <path v-if="entry.type === 'success'" d="m7.5 12 3 3 6-6" stroke="white" />
            <path v-else-if="entry.type === 'error'" d="m9 9 6 6m0-6-6 6" stroke="white" />
            <path v-else d="M12 7v6m0 3v1" stroke="white" />
          </svg>
          <div class="kf-feedback-message-copy"><strong v-if="entry.title">{{ entry.title }}</strong><slot :entry="entry">{{ entry.message }}</slot></div>
          <button v-if="entry.closable" type="button" class="kf-feedback-close" :aria-label="closeLabel" @click="emit('close', entry.id)"><span aria-hidden="true">×</span></button>
        </slot>
      </div>
    </FeedbackSurface>
  </div>
</template>
<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import FeedbackSurface from './FeedbackSurface.vue'
import DotMatrixLoader from '../DotMatrixLoader.vue'
export interface FeedbackMessage { id: string; type: string; message?: unknown; title?: string; closable?: boolean; showIcon?: boolean; [key: string]: unknown }
const props = withDefaults(defineProps<{ entries: FeedbackMessage[]; centered?: boolean; closeLabel?: string }>(), { closeLabel: '关闭提示' })
const emit = defineEmits<{ close: [id: string]; pause: [id: string]; resume: [id: string]; afterEnter: [id: string]; afterLeave: [id: string] }>()
const retained = shallowRef<Array<FeedbackMessage & { visible: boolean }>>([])
watch(() => props.entries, entries => {
  const current = new Set(entries.map(e => e.id)), previous = new Map(retained.value.map(e => [e.id, e]))
  retained.value = [...entries.map(e => ({ ...e, visible: true })), ...[...previous.values()].filter(e => !current.has(e.id)).map(e => ({ ...e, visible: false }))]
}, { immediate: true, deep: true })
function finish(id: string) { retained.value = retained.value.filter(e => e.id !== id); emit('afterLeave', id) }
</script>
