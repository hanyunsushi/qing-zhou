<template>
  <n-config-provider :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN" :namespace="embedded ? 'console-kreeproxy-surface' : undefined" :style-mount-target="runtimeStyleTarget" :preflight-style-disabled="embedded">
    <!-- 提示信息：嵌入消息留在应用样式作用域内，不能传送到无样式的body末尾。 -->
    <n-message-provider :to="embedded ? runtimeStyleTarget : undefined">
      <n-dialog-provider :to="embedded ? runtimeStyleTarget : undefined">
        <FeedbackProvider scope-class="console-kreeproxy-surface" :to="embedded ? runtimeStyleTarget : undefined">
        <!-- 加载反馈：整页/跨壳路由首帧隐藏页面壳；局部加载只隐藏正文。 -->
        <router-view v-slot="{ Component, route: viewRoute }">
          <div ref="rootShell" class="qz-shift5-page-shell" :class="{ 'qz-shift5-full-shell-pending': (pageLoading && (!pageLoadingTarget || pageLoadingTarget === rootShell)) || fullShellTransitionPending }" :key="rootViewKey(viewRoute)">
            <component :is="Component" />
          </div>
        </router-view>
      </FeedbackProvider>
      </n-dialog-provider>
    </n-message-provider>
    <PageScrollbar v-if="!embedded" />
    <!-- 加载反馈：小点阵居中于本次加载的可见区域，排除保持不变的顶栏和侧栏。 -->
    <DotMatrixLoader v-if="pageLoading" class="page-loading-indicator" :style="loadingPosition" label="页面加载中" />
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider, zhCN, dateZhCN } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import { useConfigStore } from '@/stores/config'
import { inject, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fullShellTransitionPending, useShift5PageTransition } from '@/utils/shift5'
import FeedbackProvider from '@/components/feedback/FeedbackProvider.vue'
import PageScrollbar from '@/components/PageScrollbar.vue'
import DotMatrixLoader from '@/components/DotMatrixLoader.vue'
import { pageLoading, pageLoadingTarget, usePageLoadingPosition } from '@/utils/page-loading'
import { qingzhouEmbeddedKey, qingzhouStyleTargetKey } from '@/runtime/runtime-keys'

const route = useRoute()
const embedded = inject(qingzhouEmbeddedKey, false)
const runtimeStyleTarget = inject(qingzhouStyleTargetKey, undefined)
const rootShell = ref<HTMLElement | null>(null)
const loadingPosition = usePageLoadingPosition(() => embedded ? runtimeStyleTarget?.closest<HTMLElement>('.layout-content') ?? null : null)
const authRouteNames = new Set(['login', 'register', 'forgot-password'])
const rootViewKey = (viewRoute: { matched: Array<{ name?: string | symbol | null }> }) => {
  const name = String(viewRoute.matched[0]?.name || (viewRoute.matched.length ? 'layout' : 'pending'))
  return authRouteNames.has(name) ? 'auth' : name
}
useShift5PageTransition(
  rootShell,
  () => rootViewKey(route),
  // 加载反馈 / 组件绘制动画：首次整壳进入统一隐藏顶栏、侧栏和正文；内部路由仍由常驻布局负责。
  () => route.matched.length > 0 && route.name !== 'oauth-callback',
)

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0088ff',
    primaryColorHover: '#299bff',
    primaryColorPressed: '#299bff',
    primaryColorSuppl: '#0088ff',
    infoColor: '#0088ff',
    successColor: '#34c759',
    warningColor: '#ff8d28',
    errorColor: '#ff383c',
    borderRadius: '18px',
    borderColor: '#d5dbdb',
    textColorBase: '#16191f',
    fontFamily: 'var(--ff-body)',
  },
  // 区分-状态牌：Naive类型通过theme传递，不依赖调用处额外拼接类型class。
  Tag: {
    color: 'var(--inactive-soft)', colorBordered: 'var(--inactive-soft)', textColor: 'var(--inactive-text)', border: '1px solid transparent',
    colorSuccess: 'var(--success-soft)', colorBorderedSuccess: 'var(--success-soft)', textColorSuccess: 'var(--success-text)', borderSuccess: '1px solid transparent',
    colorWarning: 'var(--warn-soft)', colorBorderedWarning: 'var(--warn-soft)', textColorWarning: 'var(--warn-text)', borderWarning: '1px solid transparent',
    colorError: 'var(--danger-soft)', colorBorderedError: 'var(--danger-soft)', textColorError: 'var(--danger-text)', borderError: '1px solid transparent',
    colorInfo: 'var(--info-soft)', colorBorderedInfo: 'var(--info-soft)', textColorInfo: 'var(--info-text)', borderInfo: '1px solid transparent',
    colorPrimary: 'var(--info-soft)', colorBorderedPrimary: 'var(--info-soft)', textColorPrimary: 'var(--info-text)', borderPrimary: '1px solid transparent',
  },
  // 提示信息 / 警告信息：各类反馈沿用浅色语义面和图标，不附加边框线。
  Alert: {
    colorInfo: 'var(--info-soft)', iconColorInfo: 'var(--info)',
    colorSuccess: 'var(--success-soft)', iconColorSuccess: 'var(--success)',
    colorWarning: 'var(--warn-soft)', iconColorWarning: 'var(--warn)',
    colorError: 'var(--danger-soft)', iconColorError: 'var(--danger)',
    border: 'none',
    borderInfo: 'none',
    borderSuccess: 'none',
    borderWarning: 'none',
    borderError: 'none',
  },
}

// 只拉站点配置；auth 由 router guard 负责初始化
const config = useConfigStore()
if (!embedded) config.fetchConfig()
</script>
