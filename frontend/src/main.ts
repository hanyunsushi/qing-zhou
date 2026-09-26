import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/global.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// 路由切换组件：统一让普通切换组的指示面跟随鼠标/键盘，并在离开后回到选中项。
function moveRouteIndicator(root: HTMLElement, button: HTMLElement | null) {
  if (!button) return
  const rootRect = root.getBoundingClientRect()
  const buttonRect = button.getBoundingClientRect()
  root.style.setProperty('--route-indicator-x', `${buttonRect.left - rootRect.left}px`)
  root.style.setProperty('--route-indicator-w', `${buttonRect.width}px`)
}
function selectedRouteButton(root: HTMLElement) {
  return root.querySelector<HTMLElement>('.n-radio-button--checked, button.active')
}
function routeRoot(target: EventTarget | null) {
  // Page-specific segmented controls own their indicator lifecycle. Keep the
  // document-level handler for shared Naive UI radio groups only.
  return target instanceof HTMLElement ? target.closest<HTMLElement>('.n-radio-group.route-switch') : null
}
function moveRouteFromEvent(event: Event) {
  const root = routeRoot(event.target)
  if (!root) return
  const target = event.target
  if (target instanceof HTMLElement) moveRouteIndicator(root, target.closest<HTMLElement>('.n-radio-button, button'))
}
function resetRouteFromLeave(event: MouseEvent | FocusEvent) {
  const root = routeRoot(event.target)
  if (!root) return
  const related = event.relatedTarget
  if (!(related instanceof Node) || !root.contains(related)) moveRouteIndicator(root, selectedRouteButton(root))
}
document.addEventListener('mouseover', moveRouteFromEvent)
document.addEventListener('focusin', moveRouteFromEvent)
document.addEventListener('mouseout', resetRouteFromLeave)
document.addEventListener('focusout', resetRouteFromLeave)
window.addEventListener('resize', () => {
  document.querySelectorAll<HTMLElement>('.n-radio-group.route-switch').forEach(root => moveRouteIndicator(root, selectedRouteButton(root)))
})
const routeSwitchObserver = new MutationObserver(() => {
  document.querySelectorAll<HTMLElement>('.n-radio-group.route-switch').forEach(root => {
    requestAnimationFrame(() => moveRouteIndicator(root, selectedRouteButton(root)))
  })
})
routeSwitchObserver.observe(document.body, { childList: true, subtree: true })
requestAnimationFrame(() => {
  document.querySelectorAll<HTMLElement>('.n-radio-group.route-switch').forEach(root => moveRouteIndicator(root, selectedRouteButton(root)))
})
