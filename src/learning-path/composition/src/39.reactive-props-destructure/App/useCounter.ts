// Vue 3.5+ reactive props destructure
// 这个 composable 不需要接 props，仅做演示
import { ref } from 'vue'

export function useCounter(initial = 0) {
  const count = ref(initial)
  function inc() { count.value++ }
  return { count, inc }
}