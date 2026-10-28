<template>
 <!-- 侧边栏折叠按钮 / 卡片SVG：Ionicons默认/Fill方向箭头，展开/收起转向；按钮命中和标签由Shell保留。 -->
 <span class="sidebar-rail-symbol" :style="{'--sidebar-symbol-angle':collapsed?'180deg':'0deg'}"><InterfaceIcon name="back" :filled="collapsed" :size="16"/></span>
</template>
<script setup lang="ts">
import InterfaceIcon from './InterfaceIcon.vue'
defineProps<{collapsed:boolean}>()
</script>
<style scoped>
/* 侧边栏 / 组件绘制动画：Ionicons方向图形与菜单同为16px，保留原32px按钮与64px footer。 */
.sidebar-rail-symbol{display:grid;place-items:center;width:18px;height:20px;transform:rotate(var(--sidebar-symbol-angle));transition:transform .3s ease,color .3s ease}
:global(.sidebar-collapse-button:hover) .sidebar-rail-symbol,:global(.sidebar-collapse-button:focus-visible) .sidebar-rail-symbol{color:var(--accent)}
@media(prefers-reduced-motion:reduce){.sidebar-rail-symbol{transition:none!important;transform:rotate(var(--sidebar-symbol-angle))!important}}
</style>
