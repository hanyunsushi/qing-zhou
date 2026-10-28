<template>
  <img
    class="qz-brand-mark"
    :src="brandIcon"
    alt=""
    aria-hidden="true"
    :width="size"
    :height="size"
  >
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DEFAULT_BRAND_ICON, useConfigStore } from '@/stores/config'

withDefaults(defineProps<{ size?: number }>(), { size: 36 })

const config = useConfigStore()
const brandIcon = computed(() => config.config.brand_icon_data_uri || DEFAULT_BRAND_ICON)
</script>

<style scoped>
/* 品牌标识：保留应用Logo、40px槽位与8px轮廓，原图不叠加投影。 */
.qz-brand-mark {
  display: block;
  flex-shrink: 0;
  object-fit: contain;
  border-radius: 8px !important;
  filter: none;
}
</style>
