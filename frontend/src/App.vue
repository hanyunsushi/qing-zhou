<template>
  <n-config-provider :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider, zhCN, dateZhCN } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import { useConfigStore } from '@/stores/config'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0972d3',
    primaryColorHover: '#033160',
    primaryColorPressed: '#002b55',
    primaryColorSuppl: '#0972d3',
    infoColor: '#3184c2',
    successColor: '#037f0c',
    warningColor: '#b84b00',
    errorColor: '#d91515',
    borderRadius: '8px',
    borderColor: '#d5dbdb',
    textColorBase: '#16191f',
    fontFamily: '"Amazon Ember", "Segoe UI", "Microsoft YaHei", "PingFang SC", system-ui, sans-serif',
  },
}

// 只拉站点配置；auth 由 router guard 负责初始化
const config = useConfigStore()
config.fetchConfig()
</script>
