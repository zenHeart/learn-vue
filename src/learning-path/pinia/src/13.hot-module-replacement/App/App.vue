<template>
  <div class="app">
    <h2>acceptHMRUpdate · Pinia 热替换</h2>
    <p class="hint">
      修改 <code>stores/counter.ts</code> 里的逻辑,保存后无需刷新,实例引用不变(<code>instanceId</code> 保持),
      但 action 内部逻辑已更新。
    </p>
    <p>counter.count: {{ counter.count }}</p>
    <p>instance id: <code>{{ instanceId }}</code></p>
    <button @click="counter.increment()">increment (来自 store)</button>
    <button @click="counter.$reset()">$reset</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCounterStore } from './stores/counter'

const counter = useCounterStore()
const instanceId = ref(counter.$id + '@' + Math.random().toString(36).slice(2, 6))
</script>
