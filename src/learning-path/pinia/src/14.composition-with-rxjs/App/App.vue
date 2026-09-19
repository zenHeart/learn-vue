<template>
  <div class="app">
    <h2>Pinia × RxJS 外部流</h2>
    <p class="hint">
      点 "外部推一次" 触发 ticker$.next(随机数);store 内部订阅后,
      ref 会同步更新,模板与右侧 <code>useObservable</code> 转的 Observable 都看到同一份值。
    </p>
    <p>ticker.value: <strong>{{ ticker.value }}</strong></p>
    <p>外部 observable 读到的最新值: <strong>{{ observed ?? '(尚未推送)' }}</strong></p>
    <button @click="push">外部推一次</button>
    <button @click="autoStart">{{ running ? '停止自动推送' : '开始自动推送' }}</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTickerStore, ticker$ } from './stores/ticker'

const ticker = useTickerStore()
const observed = ref<number | null>(null)
const running = ref(false)
let timer: number | null = null

function push() {
  ticker$.next(Math.floor(Math.random() * 100))
}

function autoStart() {
  running.value = !running.value
  if (running.value) {
    timer = window.setInterval(push, 500)
  } else if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 模拟"反向暴露" — 把 store ref 转成可订阅的 Observable
const obs$ = ticker$ // 真实场景中可用 toObservable(ticker.value) from VueUse
const sub = obs$.subscribe((v) => (observed.value = v))
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app :deep(code) { background: #eef1f4; padding: 1px 4px; border-radius: 3px; }
.app button { padding: .25rem .6rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; margin-right: .4rem; }
</style>
