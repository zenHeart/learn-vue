import { ref, computed, watch } from 'vue'

export function createCacheDemo() {
  const count = ref(1)
  // 对象身份是缓存证据；getter 不写计数器或其他状态。
  const double = computed(() => ({ value: count.value * 2 }))
  const b = computed(() => count.value * 2)
  const c = computed(() => b.value + 1)
  const echo = ref('')
  const stop = watch(count, value => {
    echo.value = `synced from count = ${value}`
  }, { immediate: true, flush: 'sync' })
  return { count, double, b, c, echo, stop }
}
