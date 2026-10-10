<template>
  <!-- 区分-状态牌：资源圈的轨道与圆弧共用 Apple 语义色。 -->
  <div class="gauge">
    <div class="gauge-meter" role="img" :aria-label="`${label} ${targetPercent.toFixed(1)}%`">
      <svg viewBox="0 0 140 140" class="gauge-svg" aria-hidden="true">
        <circle class="gauge-bg" cx="70" cy="70" r="58" :stroke="color" />
        <circle v-if="dPercent > 0" class="gauge-fg" cx="70" cy="70" r="58"
          :stroke="color" :stroke-dasharray="CIRC" :stroke-dashoffset="offset" />
      </svg>
      <div class="gauge-center" aria-hidden="true">
        <span class="gauge-val">{{ dPercent.toFixed(1) }}<i>%</i></span>
      </div>
    </div>
    <div class="gauge-meta">
      <span class="gauge-label">{{ label }}</span>
      <span class="gauge-sub" :title="sub">{{ sub }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCountUp } from '@/utils/countup'
import { chartColorForPercent } from '@/utils/status-colors'

const props = defineProps<{ label: string; percent: number; sub: string; ready: boolean }>()
const CIRC = 2 * Math.PI * 58
const targetPercent = computed(() => Number.isFinite(props.percent) ? Math.min(100, Math.max(0, props.percent)) : 0)
const color = computed(() => chartColorForPercent(targetPercent.value))
// 组件绘制动画：圆弧与数字共用逐帧值，等待所属页面揭示后启动。
const dPercent = useCountUp(() => props.ready ? targetPercent.value : 0, { duration: 1100, round: false })
const offset = computed(() => CIRC * (1 - dPercent.value / 100))
</script>

<style scoped>
.gauge { display: flex; flex-direction: column; align-items: center; min-width: 0; text-align: center; }
.gauge-meter { display: grid; width: 100%; max-width: 76px; aspect-ratio: 1; }
.gauge-svg, .gauge-center { grid-area: 1 / 1; width: 100%; height: 100%; min-width: 0; }
.gauge-svg { display: block; transform: rotate(-90deg); }
.gauge-bg { fill: none; stroke-width: 14; opacity: .14; }
.gauge-fg { fill: none; stroke-width: 14; stroke-linecap: round; transition: stroke .4s ease; }
.gauge-center { display: grid; place-items: center; pointer-events: none; }
/* 数字展示：圈内百分比保持正文颜色，状态色只用于圆弧和轨道。 */
.gauge-val { display: flex; align-items: baseline; color: var(--text); font-size: 13px; font-weight: 750; font-family: var(--ff-mono); font-variant-numeric: tabular-nums; letter-spacing: 0; line-height: 1; }
.gauge-val i { font-size: 9px; font-weight: 650; font-style: normal; margin-left: 1px; }
.gauge-meta { display: flex; flex-direction: column; gap: 1px; margin-top: 3px; width: 100%; min-width: 0; }
.gauge-label { font-size: 11px; font-weight: 650; color: var(--text-2); }
.gauge-sub { font-size: 9.5px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) {
  .gauge-fg { transition: none; }
}
</style>
