import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiPost, apiGet } from '@/api'

export interface User {
  id: number
  username: string
  email: string
  email_verified: boolean
  role: string
  is_admin: boolean
  status: string
  points: number
}

export const useAuthStore = defineStore('auth', () => {
  // Browser sessions are carried by the backend's HttpOnly cookie. Do not
  // persist or resend a JWT from JavaScript; stale bearer tokens can shadow a
  // valid cookie after a backend restart or account switch.
  const token = ref('')
  const user = ref<User | null>(null)
  const loaded = ref(false)
  let initPromise: Promise<void> | null = null

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => !!user.value?.is_admin)

  async function login(username: string, password: string) {
    const data = await apiPost<{ token?: string; user: User }>('/api/auth/login', { username, password })
    token.value = ''
    user.value = data.user
    localStorage.removeItem('qz_token')
  }

  async function register(username: string, password: string, code?: string, email?: string) {
    const body: any = { username, password }
    if (code) body.code = code
    if (email) body.email = email
    const data = await apiPost<{ token?: string; user?: User; need_verify?: boolean; message?: string }>('/api/auth/register', body)
    // email_verify_required: the panel creates the account and mails a link,
    // but does not issue a session. Treating that 200 as a login used to write
    // the string "undefined" into qz_token and dump the user on a 401 dashboard.
    if (data?.need_verify || !data?.token) {
      return data
    }
    token.value = ''
    user.value = data.user ?? null
    localStorage.removeItem('qz_token')
    return data
  }

  async function fetchMe() {
    try {
      user.value = await apiGet<User>('/api/auth/me')
    } catch (e: any) {
      if (e.status === 401) logout(true)
    }
  }

  function logout(localOnly = false) {
    if (!localOnly && (token.value || user.value)) {
      apiPost('/api/auth/logout').catch(() => {})
    }
    token.value = ''
    user.value = null
    localStorage.removeItem('qz_token')
  }

  /** 初始化：由 HttpOnly cookie 恢复会话，拉取用户信息。防重复调用。 */
  async function init() {
    if (loaded.value) return
    if (initPromise) return initPromise
    initPromise = (async () => {
      localStorage.removeItem('qz_token')
      try { await fetchMe() } catch {}
      loaded.value = true
    })()
    return initPromise
  }

  async function loginFromCookie() {
    logout(true)
    user.value = await apiGet<User>('/api/auth/me')
    if (!user.value) throw new Error("登录会话未建立，请重新登录")
    loaded.value = true
  }

  return { loginFromCookie, token, user, loaded, isLoggedIn, isAdmin, login, register, fetchMe, logout, init }
})
