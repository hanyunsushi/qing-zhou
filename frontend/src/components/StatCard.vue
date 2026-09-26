<template>
  <component
    :is="clickable ? 'button' : 'div'"
    class="stat-card"
    :class="{ clickable }"
    :type="clickable ? 'button' : undefined"
    :style="{ animationDelay: delay + 'ms' }"
    @click="clickable && $emit('click')"
  >
    <div class="sc-top">
      <span class="sc-label">{{ label }}</span>
      <span v-if="badge" class="sc-badge" :style="{ background: badgeColor + '1a', color: badgeColor }">{{ badge }}</span>
    </div>
    <div class="sc-value" :style="valueColor ? { color: valueColor } : {}" :title="String(value)">{{ value }}</div>
    <div class="sc-sub" :title="sub">{{ sub }}<span v-if="clickable" class="sc-arrow" aria-hidden="true">›</span></div>
    <div v-if="$slots.default" class="sc-extra"><slot /></div>
  </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string | number
  sub?: string
  badge?: string
  badgeColor?: string
  valueColor?: string
  clickable?: boolean
  /** 入场动画延迟(ms)，同一行卡片依次错开，读起来有先后而不是齐刷刷弹出 */
  delay?: number
}>(), { delay: 0 })
defineEmits<{ (e: 'click'): void }>()
</script>

<style scoped>
/* 展示卡片 */
.stat-card {
  position: relative; overflow: hidden;
  display: block; width: 100%; text-align: left; font: inherit; color: inherit;
  background: var(--card); border: 0; border-radius: var(--r);
  padding: 14px 16px 12px;
  box-shadow: none; transition: box-shadow .25s ease; transform: none; opacity: 1;
}

.stat-card.clickable { cursor: pointer; }
/* 悬浮效果：悬停只增加阴影，纸面、边框和位置保持不变。 */
/* 可跳转统计卡：悬浮时辅助说明变为 Apple 蓝，提示整张卡可进入对应页面。 */
.stat-card:hover, .stat-card:focus-visible {
  background: var(--card);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
  transform: none;
  opacity: 1;
}
.stat-card.clickable:hover .sc-arrow { opacity: 1; transform: none; }
.stat-card.clickable:hover .sc-sub, .stat-card.clickable:focus-visible .sc-sub { color: var(--accent); }

.sc-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.sc-label { font-size: 12.5px; color: var(--text-2); font-weight: 550; }
.sc-badge { font-size: 10.5px; font-weight: 650; padding: 2px 8px; border-radius: var(--r); letter-spacing: .01em; }
.sc-value {
  font-size: 26px; font-weight: 720; letter-spacing: -0.02em; line-height: 1.15;
  margin-top: 8px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.sc-sub { font-size: 11.5px; color: var(--text-3); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sc-arrow { display: inline-block; margin-left: 4px; opacity: 0; transition: opacity .18s, transform .18s; }
.sc-extra { margin-top: 8px; }

/* 尊重系统的「减少动态效果」设置 */
@media (prefers-reduced-motion: reduce) {
  .stat-card { animation: none; }
}
</style>
