<template>
  <n-config-provider :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <n-dialog-provider>
        <router-view v-slot="{ Component, route: viewRoute }">
          <div ref="rootShell" class="qz-shift5-page-shell" :key="rootViewKey(viewRoute)">
            <component :is="Component" />
          </div>
        </router-view>
      </n-dialog-provider>
    </n-message-provider>
    <PageScrollbar />
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider, zhCN, dateZhCN } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import { useConfigStore } from '@/stores/config'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useShift5PageTransition } from '@/utils/shift5'
import PageScrollbar from '@/components/PageScrollbar.vue'

const route = useRoute()
const rootShell = ref<HTMLElement | null>(null)
const authRouteNames = new Set(['login', 'register', 'forgot-password'])
const rootViewKey = (viewRoute: { matched: Array<{ name?: string | symbol | null }> }) => {
  const name = String(viewRoute.matched[0]?.name || 'layout')
  return authRouteNames.has(name) ? 'auth' : name
}
useShift5PageTransition(
  rootShell,
  () => {
    const name = String(route.matched[0]?.name || 'layout')
    return authRouteNames.has(name) ? 'auth' : name
  },
  () => route.matched[0]?.name === 'monitor' || authRouteNames.has(String(route.matched[0]?.name)),
)

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#007aff',
    primaryColorHover: '#298fff',
    primaryColorPressed: '#002b55',
    primaryColorSuppl: '#007aff',
    infoColor: '#3184c2',
    successColor: '#037f0c',
    warningColor: '#b84b00',
    errorColor: '#d91515',
    borderRadius: '18px',
    borderColor: '#d5dbdb',
    textColorBase: '#16191f',
    fontFamily: '"Inter", "Resource Han Rounded CN", sans-serif',
  },
}

// 只拉站点配置；auth 由 router guard 负责初始化
const config = useConfigStore()
config.fetchConfig()
</script>
