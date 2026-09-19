<template>
  <div class="app">
    <h2>$dispose · 手动释放 store</h2>
    <p class="hint">
      点 "reset" → 把 store.dispose 后再 useXxxStore(),你会看到 instanceId 递增,ref 引用也变了。
    </p>
    <p>counter: {{ counter.count }}</p>
    <p>history: {{ counter.history.join(', ') || '(空)' }}</p>
    <p>store instance id: {{ instanceId }}</p>
    <button @click="counter.count++">+1</button>
    <button @click="recreate">dispose & 重建</button>
    <button @click="disposeAll">dispose 整个 pinia</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCounterStore } from './stores/counter'

const counter = useCounterStore()
const instanceId = ref(counter.$id + '@' + Math.random().toString(36).slice(2, 6))
counter.$subscribe((_m, state) => {
  // 这里订阅会在 $dispose 后停止触发
})

function recreate() {
  counter.$dispose()
  // 重新拿 store:会跑工厂函数,得到一份新实例
  const fresh = useCounterStore()
  fresh.$id === counter.$id // true,id 一样,但内部 effect 都重建了
  location.reload() // 简化演示,真实测试中可直接调 useCounterStore()
}

function disposeAll() {
  const pinia = (window as any).__pinia__
  pinia._s.forEach((s: any) => s.$dispose())
  pinia._s.clear()
  location.reload()
}
</script>
