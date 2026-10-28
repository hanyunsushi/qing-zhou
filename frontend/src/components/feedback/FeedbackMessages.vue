<template>
  <!-- 提示信息 / 警告信息：保留通知的自动关闭及原关闭入口，不生成确认/取消按钮。 -->
  <div class="kf-feedback-messages" :class="{ 'kf-feedback-messages-center': centered }" aria-live="polite" aria-relevant="additions text">
    <FeedbackSurface v-for="entry in retained" :key="entry.id" :show="entry.visible" panel-class="kf-feedback-panel kf-feedback-message" @after-leave="finish(entry.id)" @after-enter="emit('afterEnter', entry.id)">
      <div :data-type="entry.type" class="kf-feedback-message-content" :role="entry.type === 'error' ? 'alert' : 'status'" @mouseenter="emit('pause', entry.id)" @mouseleave="emit('resume', entry.id)">
        <slot name="content" :entry="entry">
          <DotMatrixLoader v-if="entry.type === 'loading' && entry.showIcon !== false" class="kf-feedback-symbol" />
          <InterfaceIcon v-else-if="entry.showIcon !== false" :name="entry.type === 'success' ? 'success' : entry.type === 'error' ? 'close' : entry.type === 'warning' ? 'warning' : 'information'" filled :size="20" class="kf-feedback-symbol" />
          <div class="kf-feedback-message-copy"><strong v-if="entry.title">{{ entry.title }}</strong><slot :entry="entry">{{ entry.message }}</slot></div>
          <button v-if="entry.closable" type="button" class="kf-feedback-close" :aria-label="closeLabel" @click="emit('close', entry.id)"><span aria-hidden="true">×</span></button>
        </slot>
      </div>
    </FeedbackSurface>
  </div>
</template>
<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import InterfaceIcon from '../InterfaceIcon.vue'
import FeedbackSurface from './FeedbackSurface.vue'
import DotMatrixLoader from '../DotMatrixLoader.vue'
export interface FeedbackMessage { id: string; type: string; message?: unknown; title?: string; closable?: boolean; showIcon?: boolean; [key: string]: unknown }
const props = withDefaults(defineProps<{ entries: FeedbackMessage[]; centered?: boolean; closeLabel?: string }>(), { closeLabel: '关闭提示' })
const emit = defineEmits<{ close: [id: string]; pause: [id: string]; resume: [id: string]; afterLeave: [id: string]; afterEnter: [id: string] }>()
const retained = shallowRef<Array<FeedbackMessage & { visible: boolean }>>([])
watch(() => props.entries, entries => {
  const current = new Set(entries.map(e => e.id)), previous = new Map(retained.value.map(e => [e.id, e]))
  retained.value = [...entries.map(e => ({ ...e, visible: true })), ...[...previous.values()].filter(e => !current.has(e.id)).map(e => ({ ...e, visible: false }))]
}, { immediate: true, deep: true })
function finish(id: string) { retained.value = retained.value.filter(e => e.id !== id); emit('afterLeave', id) }
</script>
