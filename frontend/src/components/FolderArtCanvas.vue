<template>
  <!-- 玻璃文件夹卡片 / 组件绘制动画：渐进绘制附件纹理，不请求外部图片。 -->
  <canvas ref="canvas" aria-hidden="true" :data-ready="ready || undefined" :width="width" :height="height" />
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { paintFolderArt, type FolderArt } from '../utils/folder-art'

const props = defineProps<{ art: Exclude<FolderArt, 'none'>; seed: number; width: number; height: number }>()
const canvas = ref<HTMLCanvasElement | null>(null)
const ready = ref(false)
let revision = 0
async function draw() {
  if (!canvas.value) return
  const current = ++revision
  ready.value = false
  const image = await paintFolderArt(props.art, props.seed, props.width, props.height, 0)
  if (current !== revision || !canvas.value) return
  canvas.value.width = image.width
  canvas.value.height = image.height
  canvas.value.getContext('2d')?.drawImage(image, 0, 0)
  ready.value = true
}
onMounted(draw)
watch(() => [props.art, props.seed, props.width, props.height], draw, { deep: true })
onBeforeUnmount(() => { revision++ })
</script>
