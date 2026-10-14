<template>
  <!-- 加载反馈：小型3×3点阵，颜色继承当前控件，不承载全屏遮罩。 -->
  <span class="dot-matrix-loader" role="status" :aria-label="label" :style="loaderStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import '../styles/loading.css'

const props = withDefaults(defineProps<{ size?: number; speed?: number; label?: string }>(), {
  size: 20,
  speed: 1,
  label: '加载中',
})
const loaderStyle = computed(() => ({
  '--loader-size': `${Number.isFinite(props.size) && props.size > 0 ? props.size : 20}px`,
  '--loader-cycle': `${Number.isFinite(props.speed) && props.speed > 0 ? props.speed : 1}s`,
}))
</script>
