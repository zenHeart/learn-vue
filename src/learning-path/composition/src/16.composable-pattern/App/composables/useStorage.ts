import { ref, watch } from 'vue'

/**
 * 把 localStorage 包装成响应式 ref；浏览器环境以外静默退化为普通 ref
 */
export function useStorage<T>(key: string, initial: T) {
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
  const value = ref<T>(stored !== null ? (JSON.parse(stored) as T) : initial)

  watch(
    value,
    (v) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(v))
      }
    },
    { deep: true }
  )

  return value
}
