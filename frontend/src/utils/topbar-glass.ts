import { onMounted, onUnmounted, ref } from 'vue'

/** Tracks the body scroll state shared by the public and dashboard topbars. */
export function useTopbarScrollState() {
  const isScrolled = ref(false)

  const syncScrollState = () => {
    isScrolled.value = Math.max(document.body.scrollTop, document.documentElement.scrollTop, window.scrollY) > 0
  }

  onMounted(() => {
    syncScrollState()
    window.addEventListener('scroll', syncScrollState, { passive: true })
    document.body.addEventListener('scroll', syncScrollState, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', syncScrollState)
    document.body.removeEventListener('scroll', syncScrollState)
  })

  return { isScrolled }
}
