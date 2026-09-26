<template>
  <header class="app-header" :class="{ 'is-scrolled': isScrolled, 'is-menu-open': openMenu !== null }">
    <div class="header-left" @click="router.push('/')">
      <!-- 品牌标识：公共顶栏与其他页面侧栏复用同一品牌层级，保留顶栏原有位置。 -->
      <div class="logo"><BrandMark :size="40" /></div>
      <div class="brand-copy">
        <span class="brand-text">{{ config.config.site_name || 'Kreeproxy' }}</span>
        <span class="brand-caption">服务控制台</span>
      </div>
    </div>
    <div class="header-right">
      <template v-if="auth.isLoggedIn">
        <n-button class="header-nav-trigger topbar-language-reference-trigger" quaternary size="small" @click="router.push('/dashboard')">
          <template #icon><n-icon><HomeOutline /></n-icon></template>
          控制台
        </n-button>
        <!-- 悬浮下拉菜单：管理入口与账户入口共用同一菜单圆角合同。 -->
        <TopbarHoverMenu v-if="auth.isAdmin" :open="openMenu === 'admin'" :options="adminMenu" @open="setMenuOpen('admin', true)" @close="setMenuOpen('admin', false)" @select="handleNav">
          <template #trigger>
            <n-button class="header-nav-trigger header-dropdown-trigger topbar-language-reference-trigger" quaternary size="small" :aria-expanded="openMenu === 'admin'" aria-haspopup="menu">
              <template #icon><n-icon><SettingsOutline /></n-icon></template>
              管理
            </n-button>
          </template>
        </TopbarHoverMenu>
        <!-- 悬浮下拉菜单：账户入口与管理入口共用同一菜单圆角合同。 -->
        <TopbarHoverMenu :open="openMenu === 'account'" :options="userMenu" @open="setMenuOpen('account', true)" @close="setMenuOpen('account', false)" @select="handleNav">
          <template #trigger>
            <n-button class="header-nav-trigger header-dropdown-trigger topbar-language-reference-trigger topbar-account-trigger" quaternary size="small" :aria-expanded="openMenu === 'account'" aria-haspopup="menu">
              <svg class="topbar-account-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.25"/><path d="M5.9 19c.75-3.35 2.8-5.1 6.1-5.1s5.35 1.75 6.1 5.1"/></svg>
              <span class="account-name">{{ auth.user?.username }}</span>
            </n-button>
          </template>
        </TopbarHoverMenu>
      </template>
      <template v-else>
        <!-- 强调按钮：登录入口复用全局 action-button 强调按钮样式。 -->
        <n-button type="primary" size="small" class="action-button action-button--emphasis" @click="router.push('/login')">
          登录
        </n-button>
      </template>
    </div>

  </header>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { HomeOutline, SettingsOutline, LogOutOutline } from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import BrandMark from './BrandMark.vue'
import TopbarHoverMenu from './TopbarHoverMenu.vue'
import { useMutualHoverMenu } from '@/utils/topbar-menu'
import { useTopbarScrollState } from '@/utils/topbar-glass'

const router = useRouter()
const auth = useAuthStore()
const config = useConfigStore()
type HeaderMenu = 'admin' | 'account'
// 悬浮下拉菜单：共享一个打开状态，忽略旧菜单迟到的关闭事件，避免切换闪烁。
const { openMenu, setMenuOpen, closeMenu } = useMutualHoverMenu<HeaderMenu>()
const { isScrolled } = useTopbarScrollState()
// 悬浮下拉菜单：共享一个打开状态，忽略旧菜单迟到的关闭事件，避免切换闪烁。

const userMenu = [
  { label: '控制台', key: '/dashboard' },
  { label: '账户设置', key: '/account' },
  { type: 'divider', key: 'd1' },
  { label: '退出登录', key: '__logout', icon: () => h(NIcon, null, { default: () => h(LogOutOutline) }) },
]

const adminMenu = [
  { label: '管理概览', key: '/admin' },
  { label: '用户管理', key: '/admin/users' },
  { label: '套餐管理', key: '/admin/packages' },
  { label: '节点管理', key: '/admin/nodes' },
  { label: 'sing-box', key: '/admin/singbox' },
  { label: '服务器', key: '/admin/servers' },
  { label: '监控', key: '/admin/monitor' },
  { label: '订单', key: '/admin/orders' },
  { label: '系统设置', key: '/admin/settings' },
]

function handleNav(key: string) {
  closeMenu()
  if (key === '__logout') {
    auth.logout()
    router.push('/')
  } else {
    router.push(key)
  }
}

</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  /* Apple globalnav uses width:100% of its containing block.  This header is
     mounted in the public page shell, so viewport width would overshoot when
     the document reserves a native scrollbar or a modal locks scrolling. */
  width: 100%;
  max-width: 100%;
  /* 公共顶栏品牌与登录后侧栏共用 16px 左侧内容轨道。 */
  padding: 0 clamp(16px, 4vw, 48px) 0 16px;
  background: var(--topbar-background);
  border-bottom: 1px solid var(--topbar-divider);
  backdrop-filter: var(--topbar-backdrop-filter);
  -webkit-backdrop-filter: var(--topbar-backdrop-filter);
  position: sticky;
  top: 0;
  /* Keep the header stacking context above the fixed page scrollbar so the
     right-aligned hover menu remains opaque across the rail. */
  z-index: 130;
  transition: background-color .24s cubic-bezier(.4, 0, .6, 1), border-color .24s cubic-bezier(.4, 0, .6, 1);
}
.app-header.is-scrolled {
  background: var(--topbar-scrim-background-fallback);
  backdrop-filter: var(--topbar-backdrop-filter);
  -webkit-backdrop-filter: var(--topbar-backdrop-filter);
}
.app-header.is-menu-open {
  background: var(--topbar-background);
  backdrop-filter: var(--topbar-backdrop-filter);
  -webkit-backdrop-filter: var(--topbar-backdrop-filter);
}
@supports (backdrop-filter: initial) {
  .app-header { background: var(--topbar-scrim-background); }
}
.header-left { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
.logo {
  width: 40px; height: 40px; display: grid; place-items: center; border-radius: 8px; flex-shrink: 0;
}
.brand-copy { min-width: 0; display: flex; flex-direction: column; line-height: 20px; }
.brand-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: var(--ff-heading); font-size: 16px; line-height: 20px; font-weight: 500; letter-spacing: 0; color: var(--text); }
.brand-caption { margin-top: 2px; color: var(--text-3); font-size: 12px; line-height: 16px; font-weight: 400; letter-spacing: 0; }
.header-right { display: flex; align-items: center; gap: 8px; }
@media (max-width: 640px) {
  .app-header { width: 100%; max-width: 100%; padding: 0 12px 0 16px; }
  .header-right { gap: 2px; }
}
</style>
