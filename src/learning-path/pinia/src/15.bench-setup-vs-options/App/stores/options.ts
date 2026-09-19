import { defineStore } from 'pinia'

export const useBenchOptionsStore = defineStore('bench-options', {
  state: () => ({ count: 0, label: 'options' }),
  actions: {
    inc() { this.count++ },
  },
})
