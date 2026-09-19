import { defineStore } from 'pinia'
import { ref, onScopeDispose } from 'vue'
import { Subject } from 'rxjs'

// 外部数据源:模块顶层共享一个 Subject
export const ticker$ = new Subject<number>()

export const useTickerStore = defineStore('ticker', () => {
  const value = ref(0)
  const log = ref<number[]>([])

  // 把外部流桥接进 store
  const sub = ticker$.subscribe((v) => {
    value.value = v
    log.value.push(v)
    if (log.value.length > 20) log.value.shift()
  })

  // 关键:store $dispose 时取消订阅,避免泄漏
  onScopeDispose(() => sub.unsubscribe())

  function reset() {
    value.value = 0
    log.value = []
  }

  return { value, log, reset }
})
