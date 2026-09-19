// 一个简单的 composable 演示：在内部用 onWatcherCleanup 注册 cleanup
import { watch, onWatcherCleanup } from 'vue'

export function useFakeFetch<T>(
  source: { value: T },
  onResult: (v: T) => void,
) {
  watch(source, (v) => {
    const ctrl = { aborted: false }
    setTimeout(() => {
      if (!ctrl.aborted) onResult(v)
    }, 150)
    onWatcherCleanup(() => {
      ctrl.aborted = true
      console.log('[useFakeFetch cleanup]', v)
    })
  })
}