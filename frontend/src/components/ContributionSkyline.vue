<template>
  <!-- 展示信息模块 / 数字展示：活动量是连续数值，API由调用方提供，不默认生成模拟数据。 -->
  <div class="contribution-skyline">
    <header class="contribution-heading"><h3>{{ title }}</h3><span><b>{{ total.toLocaleString(locale) }}</b> 次活动</span></header>
    <SkylineHeatmap :model="model" :title="title" :ready="ready" :legend="legend" description="每列一周，每行一天；柱高表示活动次数，灰格表示未提供数据。" @select="$emit('select', $event)"/>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import SkylineHeatmap from './SkylineHeatmap.vue'
import { contributionModel, ACTIVITY_SCALE, type SkylineCell } from '../utils/heatmap-skyline'
const props = withDefaults(defineProps<{ data: {date: string; count: number}[]; endDate: string; title?: string; ready?: boolean; locale?: string }>(), { title: '年度活动', ready: true, locale: 'zh-CN' })
defineEmits<{ select: [cell: SkylineCell] }>()
const model = computed(() => contributionModel(props.data, props.endDate))
const total = computed(() => model.value.cells.reduce((sum, cell) => sum + (cell.value ?? 0), 0))
const legend = computed(() => [{group: -1, label: '未提供', color: '#8e8e93'}, {group: 0, label: '0', color: '#e9edf2'}, ...ACTIVITY_SCALE.slice(1).map((color, index) => ({group: index + 1, color, label: ['较少','中等','较多','最多'][index]!}))])
</script>
<style scoped>
/* 展示信息模块 / 数字展示：继承当前模块表面，统计值与单位分离。 */
.contribution-skyline { min-width: 0; }
.contribution-heading { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.contribution-heading h3 { margin: 0; font: 700 18px/22px var(--ff-heading); }
.contribution-heading span { font-size: 12px; color: var(--text-3); }
.contribution-heading b { color: var(--text); font: 700 16px/1.6 var(--ff-mono); font-variant-numeric: tabular-nums; }
</style>
