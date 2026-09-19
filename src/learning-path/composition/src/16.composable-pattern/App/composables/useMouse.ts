import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * 监听全局鼠标坐标的 composable
 */
export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  const update = (e: MouseEvent) => {
    x.value = e.clientX
    y.value = e.clientY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onBeforeUnmount(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
