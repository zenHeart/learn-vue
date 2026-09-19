import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const history = ref<number[]>([])

  function increment() {
    count.value++
    history.value.push(count.value)
  }

  return { count, history, increment }
})
