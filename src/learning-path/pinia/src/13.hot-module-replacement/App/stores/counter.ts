import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const step = ref(1) // 试着改这里: const step = ref(2) 保存后,按钮会按 2 递增

  function increment() {
    count.value += step.value
  }

  return { count, step, increment }
})

// 关键:把 acceptHMRUpdate 注册到 import.meta.hot.accept
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCounterStore, import.meta.hot))
}
