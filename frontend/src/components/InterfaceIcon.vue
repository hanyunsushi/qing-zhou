<template>
  <!-- 卡片SVG：MIT Ionicons真实轮廓/实心配对，保留原比例与stroke；承载组件负责状态。 -->
  <svg :viewBox="current.symbol.viewBox" :width="size" :height="size" fill="currentColor" preserveAspectRatio="xMidYMid meet"
    :role="label ? 'img' : undefined" :aria-label="label || undefined" :aria-hidden="label ? undefined : true" focusable="false"
    data-icon-library="Ionicons 5" :data-icon-export="current.name"
    :data-icon-variant="filled ? 'filled' : 'outline'" :data-symbol="current.name" :data-symbol-role="name">
    <component :is="elementVNode(element)" v-for="(element,index) in current.symbol.elements" :key="index" />
  </svg>
</template>
<script setup lang="ts">
import { computed, h, type VNode } from 'vue'
import { resolveInterfaceSymbol, type InterfaceSymbolName } from '../utils/interface-symbols'
import type { SvgElement } from '../utils/svg-symbols'
const props=withDefaults(defineProps<{name:InterfaceSymbolName;filled?:boolean;size?:number;label?:string}>(),{filled:false,size:16,label:''})
const current=computed(()=>resolveInterfaceSymbol(props.name,props.filled))
const elementVNode=(element:SvgElement):VNode=>h(element.tag,element.attrs,element.children.map(elementVNode))
</script>
<style scoped>
/* 卡片SVG：图形盒与命中区分离，无附加缩放或交叉淡变。 */
svg{display:block;flex:none;max-width:100%}
</style>
