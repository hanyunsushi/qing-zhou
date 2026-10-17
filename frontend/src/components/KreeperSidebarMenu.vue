<script setup lang="ts">
// 侧边栏 / 组件绘制动画：Vue接入原React源码，框架边界只负责props、菜单事件和VNode内容。
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { MenuOption } from 'naive-ui'
import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { SidebarMotion } from './sidebar-motion-react'
const props=withDefaults(defineProps<{options:MenuOption[];value?:string|number;projectKey?:string;collapsed?:boolean;revealMatches?:boolean;expandedKeys?:Array<string|number>;defaultExpandedKeys?:Array<string|number>}>(),{collapsed:false,defaultExpandedKeys:()=>[]})
const emit=defineEmits<{'update:value':[value:string];'update:expandedKeys':[keys:Array<string|number>];projectSelect:[key:string]}>()
const localKeys=ref([...props.defaultExpandedKeys]),root=ref<HTMLElement|null>(null)
let reactRoot:Root|undefined
function toggle(item:MenuOption){const key=item.key as string|number,next=new Set(props.expandedKeys??localKeys.value);if((props.collapsed&&!item.sidebarProject)||!next.has(key)){next.add(key);if(item.sidebarProjectKey)emit('projectSelect',String(item.sidebarProjectKey))}else next.delete(key);localKeys.value=[...next];emit('update:expandedKeys',[...next])}
function select(item:MenuOption){if(item.sidebarProjectOwner)emit('projectSelect',String(item.sidebarProjectOwner));emit('update:value',String(item.sidebarRouteKey??item.key))}
// 提示信息 / 多项目路由导航：筛选临时展示匹配项的父级，清空后恢复原折叠状态。
function matchingParents(options:MenuOption[]):Array<string|number>{return options.flatMap(item=>item.children?.length?[item.key as string|number,...matchingParents(item.children)]:[])}
function draw(){if(reactRoot&&root.value)flushSync(()=>reactRoot!.render(React.createElement(SidebarMotion,{host:root.value!,options:props.options,value:props.value,projectKey:props.projectKey,collapsed:props.collapsed,expandedKeys:props.revealMatches?matchingParents(props.options):props.expandedKeys??localKeys.value,select,toggle})))}
onMounted(()=>{reactRoot=createRoot(root.value!);draw()})
watch(()=>[props.options,props.value,props.projectKey,props.collapsed,props.revealMatches,props.expandedKeys,localKeys.value],draw,{flush:'post'})
onBeforeUnmount(()=>{reactRoot?.unmount();reactRoot=undefined})
function keyboard(event:KeyboardEvent){
 const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button.n-menu-item-content');if(!button||!root.value)return
 const buttons=Array.from(root.value.querySelectorAll<HTMLButtonElement>('button.n-menu-item-content')).filter(el=>!el.disabled&&!el.closest('[data-motion-pop-id]')&&el.getClientRects().length)
 const index=buttons.indexOf(button);let next:HTMLElement|undefined
 if(event.key==='ArrowDown')next=buttons[(index+1)%buttons.length]
 else if(event.key==='ArrowUp')next=buttons[(index+buttons.length-1)%buttons.length]
 else if(event.key==='Home')next=buttons[0];else if(event.key==='End')next=buttons[buttons.length-1]
 else if(event.key==='ArrowRight'){if(button.getAttribute('aria-expanded')==='false')button.click();else next=button.closest('.sidebar-motion-item')?.querySelector<HTMLButtonElement>('.n-submenu-children button, .sidebar-project-content button')??undefined}
 else if(event.key==='ArrowLeft'){if(button.getAttribute('aria-expanded')==='true')button.click();else next=button.closest('.n-submenu-children, .sidebar-project-content')?.parentElement?.querySelector<HTMLButtonElement>(':scope > .n-menu-item > button')??undefined}
 else return
 event.preventDefault();event.stopPropagation();if(next)void nextTick(()=>next?.focus())
}
</script>
<template>
  <!-- 侧边栏：React独占此菜单DOM，Vue不插入会改变Motion树的分组控制节点。 -->
  <div ref="root" class="sidebar-motion-menu-root" @keydown="keyboard" />
</template>
