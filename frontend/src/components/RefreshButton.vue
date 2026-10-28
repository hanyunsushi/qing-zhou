<template>
  <!-- 普通按钮 / 悬浮效果：刷新只旋转SVG，蓝色原生图形，无额外外框或底面；loading单独反馈。 -->
  <button type="button" class="kreeper-refresh" :disabled="disabled || loading" :aria-label="label" :title="label" :aria-busy="loading" @click="$emit('refresh')">
    <!-- 普通按钮 / 卡片SVG：Ionicons刷新真实配对，loading切Fill；原400/800ms旋转保留。 -->
    <InterfaceIcon name="refresh" :filled="loading" :size="16" class="kreeper-refresh-svg" :class="{ 'is-loading': loading }" />
  </button>
</template>
<script setup lang="ts">
import InterfaceIcon from './InterfaceIcon.vue'
withDefaults(defineProps<{ label?: string; loading?: boolean; disabled?: boolean }>(), { label: '立即刷新', loading: false, disabled: false })
defineEmits<{ refresh: [] }>()
</script>
<style scoped>
/* 普通按钮：透明无框32px刷新入口，原始Ionicons图形使用accent蓝色；SVG悬浮转180度并同速回转，不引入位移、缩放或彩色光晕。 */
.kreeper-refresh { display: inline-grid; place-items: center; width: 32px; height: 32px; padding: 0; flex: 0 0 auto; border-radius: var(--r); border: 0; background: transparent; color: var(--accent); cursor: pointer; }
.kreeper-refresh:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.kreeper-refresh:disabled { opacity: .5; cursor: not-allowed; }
.kreeper-refresh-svg { transform-origin: center; transform-box: view-box; transition: transform .4s linear; }
.kreeper-refresh:hover:not(:disabled) .kreeper-refresh-svg, .kreeper-refresh:focus-visible:not(:disabled) .kreeper-refresh-svg { transform: rotate(180deg); }
.kreeper-refresh-svg.is-loading { animation: kreeper-refresh-turn .8s linear infinite; }
@keyframes kreeper-refresh-turn { to { transform: rotate(360deg); } }
/* 普通按钮：触摸命中44px，图形仍保持16px与原旋转中心。 */
@media (pointer: coarse) { .kreeper-refresh { width: 44px; height: 44px; } }
@media (prefers-reduced-motion: reduce) { .kreeper-refresh .kreeper-refresh-svg { animation: none !important; transition: none !important; transform: none !important; } }
</style>
