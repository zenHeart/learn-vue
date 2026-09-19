import { ref } from 'vue'

/**
 * 计数器工厂：返回 ref + 动作方法
 */
export function useCounter(initial = 0) {
  const count = ref(initial)
  const inc = () => count.value++
  const dec = () => count.value--
  const reset = (v = initial) => (count.value = v)
  return { count, inc, dec, reset }
}
