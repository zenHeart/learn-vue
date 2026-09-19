import { ref, onScopeDispose } from 'vue'

/**
 * 简化的 fetch composable，SSR 安全：
 *  - 不在 setup 阶段直接触发网络
 *  - 通过 effectScope/onScopeDispose 在组件销毁时取消请求
 *  - 用 AbortController 取消未完成的请求
 */
export function useFetch<T>(url: string) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<unknown>(null)
  let controller: AbortController | null = null

  const load = async () => {
    controller?.abort()
    controller = new AbortController()
    loading.value = true
    error.value = null
    try {
      // 模拟异步过程
      await new Promise((res) => setTimeout(res, 300))
      // 在 SSR 时跳过真实请求
      if (typeof window === 'undefined') {
        data.value = null as unknown as T
      } else {
        // 真实环境可以用 fetch(url, { signal })
        data.value = { id: 1, name: 'demo data' } as T
      }
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  onScopeDispose(() => {
    controller?.abort()
  })

  // 立即调用一次：浏览器端常见，SSR 安全做法是放在 onMounted 中
  if (typeof window !== 'undefined') {
    load()
  }

  return { data, loading, error, reload: load }
}
