import { ref } from 'vue'

/** 顶栏菜单的唯一互斥状态：旧菜单的延迟 close 不会关闭后来打开的新菜单。 */
export function useMutualHoverMenu<T extends string>() {
  const openMenu = ref<T | null>(null)

  function setMenuOpen(menu: T, show: boolean) {
    if (show) {
      openMenu.value = menu
    } else if (openMenu.value === menu) {
      openMenu.value = null
    }
  }

  function closeMenu() {
    openMenu.value = null
  }

  return { openMenu, setMenuOpen, closeMenu }
}
