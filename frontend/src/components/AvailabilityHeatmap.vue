<template>
  <!-- 区分-状态牌 / 展示信息模块：每台服务器的时间桶折成矩阵；名称和时间使用DOM完整换行。 -->
  <div class="availability-heatmap">
    <div v-if="!models.length" class="availability-empty">暂无探针服务器</div>
    <article v-for="server in models" :key="server.key" class="availability-row">
      <header class="availability-label"><strong>{{ server.name }}</strong><span v-if="server.latest" class="availability-time">{{ server.latest.label }}</span><span v-if="server.latest" class="availability-current"><i :style="{background: server.latest.color}"/>{{ server.latest.detail }}</span></header>
      <SkylineHeatmap :model="server.model" :title="server.name + '可用性热力图'" :ready="ready" :legend="legend" description="高度表示状态级别，灰色薄格为离线 / 无数据；非负载百分比。" @select="$emit('select', $event)"/>
    </article>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import SkylineHeatmap from './SkylineHeatmap.vue'
import { availabilityModels, HEATMAP_STATES, type AvailabilityData, type SkylineCell } from '../utils/heatmap-skyline'
const props = withDefaults(defineProps<{ data: AvailabilityData; ready?: boolean }>(), { ready: true })
defineEmits<{ select: [cell: SkylineCell] }>()
const models = computed(() => availabilityModels(props.data))
const legend = HEATMAP_STATES.map((state, group) => ({...state, group}))
</script>
<style scoped>
/* 展示信息模块：透明布局不新增深度；标签列完整换行，手机移到矩阵上方。 */
.availability-heatmap { min-width: 0; }
.availability-row { display: grid; grid-template-columns: minmax(120px, 160px) minmax(0, 1fr); gap: 20px; align-items: start; padding-block: 12px; min-width: 0; }
.availability-row + .availability-row { border-top: 1px solid var(--border); margin-top: 8px; }
.availability-label { min-width: 0; display: flex; flex-direction: column; gap: 6px; padding-top: 8px; font-size: 12px; line-height: 1.6; color: var(--text-3); white-space: normal; overflow-wrap: anywhere; }
.availability-label strong { color: var(--text); font-size: 13px; font-weight: 700; line-height: 1.6; }
.availability-time { font-family: var(--ff-mono); font-variant-numeric: tabular-nums; }
.availability-current { display: flex; align-items: center; gap: 5px; }
.availability-current i { width: 6px; height: 6px; border-radius: 50%; flex: 0 0 auto; }
.availability-empty { padding: 24px; text-align: center; color: var(--text-3); font-size: 13px; }
@media (max-width: 640px) { .availability-row { grid-template-columns: minmax(0, 1fr); gap: 8px; } .availability-label { padding-top: 0; } }
</style>
