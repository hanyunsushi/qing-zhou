<template>
  <main class="auth-page-shell">
    <section class="auth-aside" aria-label="服务说明">
      <div class="auth-aside-inner">
        <span class="auth-kicker">{{ siteName }} 服务控制台</span>
        <h1 class="auth-quote">清晰管理连接，<br />从这里开始。</h1>
        <p class="auth-aside-copy">{{ config.config.site_description || '仅限个人在中国大陆以外地区依法依规使用' }}</p>
        <div class="auth-points">
          <div v-for="point in authPoints" :key="point.numeric" class="auth-point"><span>{{ point.numeric }}</span><span>{{ point.text }}</span></div>
        </div>
      </div>
    </section>
    <section class="auth-main">
      <div class="auth-main-inner">
        <router-link to="/" class="auth-brand" :aria-label="`返回${siteName}`"><BrandMark :size="44" /><span><strong>{{ siteName }}</strong><small>服务控制台</small></span></router-link>
        <div class="auth-form-stack">
          <header class="auth-view-header"><span class="auth-kicker">{{ isRegister ? '创建账户' : isForgot ? '账户恢复' : '欢迎回来' }}</span><h2 class="auth-title">{{ isRegister ? '注册' : isForgot ? '找回密码' : '登录' }}</h2><p class="auth-sub">{{ pageSubtitle }}</p></header>
          <nav class="auth-mode-nav" aria-label="认证方式"><router-link to="/login" :class="{ active: !isRegister && !isForgot }">登录</router-link><router-link to="/register" :class="{ active: isRegister }">注册</router-link></nav>
          <div v-if="isRegister && !config.config.registration_open" class="auth-notice" role="status">当前暂未开放注册，请联系管理员获取账户。</div>
          <!-- 填写框：登录与注册共用同一组 Cloudscape 表单控件和错误槽位。 -->
          <n-form v-else-if="!isForgot" ref="formRef" class="auth-fields" :model="form" :rules="isRegister ? registerRules : loginRules" label-placement="top" @submit.prevent="submit">
            <!-- 填写框 -->
            <n-form-item v-if="isRegister" label="邮箱" path="email"><n-input v-model:value="form.email" :input-props="{ autocomplete: 'email' }" placeholder="请输入邮箱" /></n-form-item>
            <n-form-item label="用户名" path="username"><n-input v-model:value="form.username" :input-props="{ autocomplete: 'username' }" placeholder="请输入用户名" /></n-form-item>
            <n-form-item label="密码" path="password"><n-input v-model:value="form.password" :input-props="{ autocomplete: isRegister ? 'new-password' : 'current-password' }" type="password" show-password-on="click" :placeholder="isRegister ? '至少 6 位字符' : '请输入密码'" /></n-form-item>
            <n-form-item v-if="isRegister && config.config.register_mode === 'code'" label="邀请码" path="code"><n-input v-model:value="form.code" placeholder="请输入邀请码" /></n-form-item>
            <p v-if="isRegister" class="auth-legal-copy">注册即表示你已阅读并同意本站服务条款与隐私说明，并承诺仅在适用法律允许的范围内使用服务。</p>
            <n-button type="primary" class="highlight-arc-button auth-submit" block :loading="loading" attr-type="submit">{{ isRegister ? (config.config.email_verify_required ? '继续注册' : '创建账户') : '登录' }}</n-button>
          </n-form>
          <n-form v-else ref="forgotFormRef" class="auth-fields" :model="forgotForm" :rules="forgotRules" label-placement="top" @submit.prevent="handleForgot">
            <div v-if="!config.config.email_enabled" class="auth-notice" role="status">本站未配置邮件服务，无法自助重置密码。<br />请联系管理员帮你重置。</div>
            <template v-else><n-form-item label="注册邮箱" path="email"><n-input v-model:value="forgotForm.email" :input-props="{ autocomplete: 'email' }" placeholder="请输入注册邮箱" /></n-form-item><n-button type="primary" class="highlight-arc-button auth-submit" block :loading="loading" attr-type="submit">发送重置邮件</n-button></template>
          </n-form>
          <div v-if="!isRegister && !isForgot" class="auth-secondary-links"><router-link to="/forgot-password">忘记密码？</router-link></div>
          <div v-if="config.config.oauth2_enabled && !isRegister && !isForgot" class="auth-divider"><span /><em>或</em><span /></div>
          <n-button v-if="config.config.oauth2_enabled && !isRegister && !isForgot" secondary block class="auth-oauth" :loading="oauthLoading" @click="handleOAuth">使用{{ config.config.oauth2_name }}登录</n-button>
          <p class="auth-switch-copy"><template v-if="isRegister">已有账户？ <router-link to="/login">返回登录</router-link></template><template v-else-if="isForgot">想起密码了？ <router-link to="/login">返回登录</router-link></template><template v-else>还没有账户？ <router-link to="/register">创建账户</router-link></template></p>
        </div>
        <footer class="auth-footer">© {{ currentYear }} {{ siteName }} · 仅限个人在中国大陆以外地区依法依规使用</footer>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NForm, NFormItem, NInput, useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import { apiPost } from '@/api'
import BrandMark from '@/components/BrandMark.vue'

const route = useRoute(), router = useRouter(), auth = useAuthStore(), config = useConfigStore(), message = useMessage()
const formRef = ref<FormInst | null>(null), forgotFormRef = ref<FormInst | null>(null), loading = ref(false), oauthLoading = ref(false)
const form = reactive({ username: '', password: '', email: '', code: '' })
const forgotForm = reactive({ email: '' })
const isRegister = computed(() => route.name === 'register'), isForgot = computed(() => route.name === 'forgot-password')
const siteName = computed(() => config.config.site_name || 'Kreeproxy'), currentYear = new Date().getFullYear()
const pageSubtitle = computed(() => isRegister.value ? `创建账户后即可使用${siteName.value}的订阅与节点服务` : isForgot.value ? '输入注册邮箱，我们会发送密码重置说明' : `登录${siteName.value}以继续管理你的服务`)
const authPoints = [{ numeric: '01', text: '订阅、节点与套餐集中管理' }, { numeric: '02', text: '用量与服务状态随时可查' }, { numeric: '03', text: '账户与安全设置由你掌控' }]
const redirectTarget = computed(() => { const value = String(route.query.redirect || ''); return value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard' })
const loginRules: FormRules = { username: { required: true, message: '请输入用户名', trigger: 'blur' }, password: { required: true, message: '请输入密码', trigger: 'blur' } }
const registerRules: FormRules = { username: loginRules.username, password: { required: true, min: 6, message: '密码至少 6 位', trigger: 'blur' }, email: { trigger: ['blur', 'input'], validator(_rule, value: string) { if (config.config.email_verify_required && config.config.register_mode !== 'code' && !value) return new Error('需要邮箱以完成验证'); if (value && !/^\S+@\S+\.\S+$/.test(value)) return new Error('邮箱格式不正确'); return true } } }
const forgotRules: FormRules = { email: { required: true, message: '请输入邮箱', trigger: 'blur' } }

function resetAuthForms() {
  form.username = ''
  form.password = ''
  form.email = ''
  form.code = ''
  forgotForm.email = ''
  formRef.value?.restoreValidation()
  forgotFormRef.value?.restoreValidation()
}

watch(() => route.name, resetAuthForms)

async function submit() {
  try { await formRef.value?.validate() } catch { return }
  loading.value = true
  try {
    if (isRegister.value) {
      const data = await auth.register(form.username, form.password, form.code || undefined, form.email || undefined)
      if (data?.need_verify) {
        message.success(data.message || '注册成功，请查收验证邮件后激活账户')
        await router.replace('/login')
      } else {
        message.success('注册成功')
        await router.replace(redirectTarget.value)
      }
    } else {
      await auth.login(form.username, form.password)
      message.success('登录成功')
      await router.replace(redirectTarget.value)
    }
  } catch (error: any) {
    message.error(error?.message || (isRegister.value ? '注册失败' : '登录失败'))
  } finally {
    loading.value = false
  }
}
async function handleForgot() { if (!config.config.email_enabled) return; try { await forgotFormRef.value?.validate() } catch { return }; loading.value = true; try { const data = await apiPost<any>('/api/auth/forgot', { email: forgotForm.email }); message.success(data?.message || '若该邮箱已注册，我们已发送密码重置邮件') } catch (error: any) { message.error(error?.message || '发送失败') } finally { loading.value = false } }
async function handleOAuth() { oauthLoading.value = true; try { const data = await apiPost<{ authorization_url: string }>('/api/auth/oauth2/start', {}); window.location.assign(data.authorization_url) } catch (error: any) { message.error(error?.message || '无法打开认证中心') } finally { oauthLoading.value = false } }
</script>

<style scoped>
.auth-page-shell{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);min-height:100dvh;background:var(--bg);color:var(--text)}
.auth-aside{display:grid;min-height:100dvh;align-items:center;padding:clamp(32px,6vw,72px);background:var(--text);color:var(--bg)}
.auth-aside-inner{width:100%;max-width:440px;margin-inline:auto}.auth-kicker{display:block;margin:0 0 14px;color:var(--text-3);font-size:12px;font-weight:650;line-height:1.2;letter-spacing:.04em}.auth-aside .auth-kicker{color:color-mix(in srgb,var(--bg) 64%,transparent)}
.auth-quote{margin:0 0 22px;color:var(--bg);font-family:var(--ff-heading);font-size:clamp(40px,5vw,64px);font-weight:500;line-height:1.04;letter-spacing:0}.auth-aside-copy{max-width:34rem;margin:0 0 28px;color:color-mix(in srgb,var(--bg) 76%,transparent);font-size:15px;line-height:1.65}.auth-points{display:grid;border-top:1px solid color-mix(in srgb,var(--bg) 22%,transparent)}.auth-point{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:start;padding:18px 0;border-bottom:1px solid color-mix(in srgb,var(--bg) 16%,transparent);color:color-mix(in srgb,var(--bg) 86%,transparent);font-size:15px;line-height:1.45;transition:color .18s ease,background-color .18s ease}.auth-point:hover{color:var(--bg);background:color-mix(in srgb,var(--bg) 7%,transparent)}.auth-point>span:first-child{color:color-mix(in srgb,var(--bg) 56%,transparent);font:600 12px/1.45 var(--ff-mono)}
.auth-main{display:grid;min-height:100dvh;align-items:center;justify-items:center;padding:clamp(32px,6vw,72px) clamp(20px,4vw,44px)}.auth-main-inner{display:grid;width:100%;max-width:460px;align-content:center}.auth-brand{display:inline-flex;width:max-content;max-width:100%;align-items:center;gap:12px;margin-bottom:32px;color:var(--text);text-decoration:none}.auth-brand>span{display:grid;gap:3px}.auth-brand strong{color:var(--text);font-family:var(--ff-heading);font-size:20px;font-weight:500;line-height:1.08}.auth-brand small{color:var(--text-3);font-size:13px;line-height:1.35}.auth-form-stack{display:grid;gap:20px}.auth-view-header{display:grid;gap:6px}.auth-view-header .auth-kicker,.auth-sub{min-height:20px;margin:0;color:var(--text-3);font-size:14px;line-height:1.5}.auth-title{margin:0;color:var(--text);font-family:var(--ff-heading);font-size:clamp(32px,4vw,44px);font-weight:500;line-height:1.05;letter-spacing:0}
.auth-mode-nav{display:flex;gap:20px;border-bottom:1px solid var(--border)}.auth-mode-nav a{position:relative;padding:0 0 10px;border-inline-start:0;color:var(--text-3);font-size:14px;text-decoration:none;box-shadow:none}.auth-mode-nav a::before{display:none;content:none}.auth-mode-nav a::after{position:absolute;right:0;bottom:-1px;left:0;height:2px;content:'';background:transparent}.auth-mode-nav a:hover,.auth-mode-nav a:focus-visible,.auth-mode-nav a.active{color:var(--text)}.auth-mode-nav a.active::after{background:var(--accent)}.auth-fields{display:grid;gap:0}.auth-fields :deep(.n-form-item){margin-bottom:0}.auth-fields :deep(.n-form-item-label){padding-bottom:6px;color:var(--text-2);font-size:13px;font-weight:560}.auth-fields :deep(.n-form-item-feedback-wrapper){box-sizing:border-box;height:28px;min-height:28px;margin-bottom:0;padding:6px 0;overflow:visible}.auth-fields :deep(.n-form-item-feedback){margin:0;padding:0;color:var(--danger);font-size:12px;line-height:16px}.auth-submit{margin-top:4px}.auth-legal-copy{margin:0 0 12px;color:var(--text-3);font-size:12px;line-height:1.55}.auth-secondary-links{display:flex;justify-content:flex-end;margin-top:-8px}.auth-secondary-links a,.auth-switch-copy a{color:var(--accent);text-decoration:none}.auth-secondary-links a:hover,.auth-secondary-links a:focus-visible,.auth-switch-copy a:hover,.auth-switch-copy a:focus-visible{text-decoration:underline;text-underline-offset:3px}.auth-divider{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin-top:2px;color:var(--text-3);font-size:12px}.auth-divider span{height:1px;background:var(--border)}.auth-divider em{font-style:normal}.auth-oauth{margin-top:-4px}.auth-notice{padding:14px 16px;border-radius:var(--r);background:var(--accent-soft);color:var(--text-2);font-size:13px;line-height:1.65}.auth-switch-copy{min-height:20px;margin:0;color:var(--text-3);font-size:13px;line-height:20px}.auth-footer{margin-top:28px;color:var(--text-3);font-size:12px;line-height:1.5}
@media (max-width:860px){.auth-page-shell{grid-template-columns:1fr}.auth-aside{display:none}.auth-main{align-items:start;padding-top:32px;padding-bottom:32px}}
</style>
