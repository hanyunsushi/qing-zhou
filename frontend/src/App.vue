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
    <!-- 加载反馈：小点阵居中于本次加载的可见区域，排除保持不变的顶栏和侧栏。 -->
    <DotMatrixLoader v-if="pageLoading" class="page-loading-indicator" :style="loadingPosition" label="页面加载中" />
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
import DotMatrixLoader from '@/components/DotMatrixLoader.vue'
import { pageLoading, usePageLoadingPosition } from '@/utils/page-loading'

const route = useRoute()
const rootShell = ref<HTMLElement | null>(null)
const loadingPosition = usePageLoadingPosition()
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
    infoColor: '#007aff',
    successColor: '#34c759',
    warningColor: '#ff9500',
    errorColor: '#ff3b30',
    borderRadius: '18px',
    borderColor: '#d5dbdb',
    textColorBase: '#16191f',
    fontFamily: 'var(--ff-body)',
  },
  // 提示信息 / 警告信息：各类反馈沿用浅色语义面和图标，不附加边框线。
  Alert: {
    border: 'none',
    borderInfo: 'none',
    borderSuccess: 'none',
    borderWarning: 'none',
    borderError: 'none',
  },
}

// 只拉站点配置；auth 由 router guard 负责初始化
const config = useConfigStore()
config.fetchConfig()
</script>
