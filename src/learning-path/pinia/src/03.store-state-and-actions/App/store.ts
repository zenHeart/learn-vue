import { defineStore } from 'pinia'
import { ref } from 'vue'

// 同时提供两种 store：counter(options) / cart(setup)
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0, history: [] as number[] }),
  actions: {
    inc() {
      this.history.push(this.count)
      this.count += 1
    },
    // 函数式 patch
    bump(n: number) {
      this.$patch((state) => {
        state.history.push(state.count)
        state.count += n
      })
    },
  },
})

export const useCartStore = defineStore('cart', () => {
  const items = ref<{ id: number; name: string; qty: number }[]>([])

  function $reset() {
    items.value = []
  }

  return { items, $reset }
})