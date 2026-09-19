import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBenchSetupStore = defineStore('bench-setup', () => {
  const count = ref(0)
  const label = ref('setup')
  function inc() { count.value++ }
  return { count, label, inc }
})
