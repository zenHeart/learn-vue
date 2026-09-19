<template>
  <div class="demo">
    <h2>Composable 标准模式</h2>

    <section class="card">
      <h3>1. useMouse — 全局事件追踪</h3>
      <p>x: <strong>{{ x }}</strong>, y: <strong>{{ y }}</strong></p>
    </section>

    <section class="card">
      <h3>2. useStorage — localStorage 响应式包装</h3>
      <input v-model="name" placeholder="姓名" />
      <p>localStorage['user.name'] = <strong>{{ name }}</strong></p>
    </section>

    <section class="card">
      <h3>3. useCounter (工厂函数)</h3>
      <p>count = {{ count }}</p>
      <button @click="inc">+1</button>
      <button @click="dec">-1</button>
      <button @click="reset">reset</button>
    </section>

    <section class="card">
      <h3>4. SSR 安全的 useFetch (effectScope)</h3>
      <div v-if="loading">loading...</div>
      <div v-else>data: {{ JSON.stringify(data) }}</div>
      <button @click="reload">reload</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useMouse } from './composables/useMouse'
import { useStorage } from './composables/useStorage'
import { useCounter } from './composables/useCounter'
import { useFetch } from './composables/useFetch'

const { x, y } = useMouse()
const name = useStorage<string>('user.name', 'guest')
const { count, inc, dec, reset } = useCounter(10)
const { data, loading, reload } = useFetch<{ id: number; name: string }>('fake://demo')
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; margin-right: 6px; }
</style>
