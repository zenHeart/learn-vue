<template>
  <section>
    <h3>Counter</h3>
    <p>当前 count: {{ count }}</p>
    <p>挂载时间: {{ mountedAt }}</p>
    <button @click="count++">+1</button>
    <p class="hint">
      试着把 <code>const initial = 0</code> 改成 <code>10</code> —— 保存后 count 会变成 10,但 mountedAt 不变,证明这是 HMR 而非重挂载。
    </p>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 试着改这里: const initial = 10
const initial = 0
const count = ref(initial)
const mountedAt = new Date().toLocaleTimeString()

onMounted(() => {
  console.log('[Counter] mounted at', mountedAt)
})
</script>
