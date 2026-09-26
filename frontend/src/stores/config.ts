import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { apiGet } from '@/api'

export const DEFAULT_SITE_NAME = 'Kreeproxy'
export const DEFAULT_SITE_DESCRIPTION = '仅限个人在中国大陆以外地区依法依规使用'
export const DEFAULT_BRAND_ICON = '/kreeproxy-brand.png'

export interface SiteConfig {
  oauth2_enabled: boolean
  oauth2_name: string
  site_name: string
  site_description: string
  register_mode: string
  registration_open: boolean
  email_verify_required: boolean
  // 面板到底能不能发信。发不了的话，「找回密码」是条死路——链接只会写进
  // 服务端日志，用户永远等不到那封邮件。
  email_enabled: boolean
  telegram_enabled: boolean
  points_per_cny: number
  homepage_mode: string
  homepage_url: string
  help_docs_mode: string
  help_docs_url: string
  brand_icon_data_uri: string
}

export const useConfigStore = defineStore('config', () => {
  const config = ref<SiteConfig>({
    oauth2_enabled: false,
    oauth2_name: '认证中心',
    site_name: DEFAULT_SITE_NAME,
    site_description: DEFAULT_SITE_DESCRIPTION,
    // Registration is closed until the public config confirms otherwise. This
    // matches the backend seed and avoids briefly exposing the form on a slow
    // or unavailable config request.
    register_mode: 'closed',
    registration_open: false,
    email_verify_required: true,
    // 默认 true：拿不到 /api/config 时维持原样（显示找回密码入口），
    // 而不是因为一次网络抖动就把功能藏起来。
    email_enabled: true,
    telegram_enabled: false,
    points_per_cny: 10,
    homepage_mode: 'monitor',
    homepage_url: '',
    help_docs_mode: 'builtin',
    help_docs_url: '',
    brand_icon_data_uri: DEFAULT_BRAND_ICON,
  })

  function applyBrowserBranding() {
    if (typeof document === 'undefined') return
    const name = config.value.site_name?.trim() || DEFAULT_SITE_NAME
    const icon = config.value.brand_icon_data_uri || DEFAULT_BRAND_ICON
    const type = icon.startsWith('data:image/png') ? 'image/png'
      : icon.startsWith('data:image/jpeg') ? 'image/jpeg'
        : icon.startsWith('data:image/webp') ? 'image/webp'
          : icon.endsWith('.png') ? 'image/png'
            : icon.endsWith('.jpg') || icon.endsWith('.jpeg') ? 'image/jpeg'
              : icon.endsWith('.webp') ? 'image/webp' : 'image/svg+xml'
    document.title = name
    for (const rel of ['icon', 'shortcut icon', 'apple-touch-icon']) {
      let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
      if (!link) {
        link = document.createElement('link')
        link.rel = rel
        document.head.appendChild(link)
      }
      link.href = icon
      link.type = type
    }
  }

  watch(config, applyBrowserBranding, { deep: true, immediate: true })

  async function fetchConfig() {
    try {
      const data = await apiGet<SiteConfig>('/api/config')
      if (data) {
        const normalized = { ...data }
        if (!normalized.site_name?.trim() || normalized.site_name.trim() === '轻舟') normalized.site_name = DEFAULT_SITE_NAME
        if (!normalized.brand_icon_data_uri || normalized.brand_icon_data_uri === '/qingzhou-mark.svg') normalized.brand_icon_data_uri = DEFAULT_BRAND_ICON
        if (!normalized.site_description?.trim()) normalized.site_description = DEFAULT_SITE_DESCRIPTION
        Object.assign(config.value, normalized)
      }
    } catch {}
    return config.value
  }

  return { config, fetchConfig, applyBrowserBranding }
})
