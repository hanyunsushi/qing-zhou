<template>
  <!-- 普通按钮 / 悬浮效果：刷新只旋转SVG，按钮表面与位置保持中性；loading单独反馈。 -->
  <button type="button" class="kreeper-refresh" :disabled="disabled || loading" :aria-label="label" :title="label" :aria-busy="loading" @click="$emit('refresh')">
    <!-- 普通按钮：Lucide refresh-cw SVG，圆弧与箭头共用端点，以viewBox中心旋转。 -->
    <svg class="kreeper-refresh-svg" :class="{ 'is-loading': loading }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  </button>
</template>
<script setup lang="ts">
// SVG: Lucide refresh-cw, ISC license; https://lucide.dev/icons/refresh-cw
withDefaults(defineProps<{ label?: string; loading?: boolean; disabled?: boolean }>(), { label: '立即刷新', loading: false, disabled: false })
defineEmits<{ refresh: [] }>()
</script>
<style scoped>
/* 普通按钮：中性32px刷新入口；SVG悬浮转180度并同速回转，不引入位移、缩放或彩色光晕。 */
.kreeper-refresh { display: inline-grid; place-items: center; width: 32px; height: 32px; padding: 0; flex: 0 0 auto; border-radius: var(--r); border: 1px solid var(--border); background: var(--card); color: var(--text-2); cursor: pointer; }
.kreeper-refresh:hover:not(:disabled) { color: var(--text); border-color: var(--border-strong); }
.kreeper-refresh:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.kreeper-refresh:disabled { opacity: .5; cursor: not-allowed; }
.kreeper-refresh-svg { transform-origin: center; transform-box: view-box; transition: transform .6s cubic-bezier(.4,0,.2,1); }
.kreeper-refresh:hover:not(:disabled) .kreeper-refresh-svg, .kreeper-refresh:focus-visible:not(:disabled) .kreeper-refresh-svg { transform: rotate(180deg); }
.kreeper-refresh-svg.is-loading { animation: kreeper-refresh-turn .8s linear infinite; }
@keyframes kreeper-refresh-turn { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .kreeper-refresh .kreeper-refresh-svg { animation: none !important; transition: none !important; transform: none !important; } }
</style>
