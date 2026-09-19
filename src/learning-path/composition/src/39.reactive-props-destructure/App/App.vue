<template>
  <div class="demo">
    <h2>Reactive Props Destructure (Vue 3.5+)</h2>
    <p class="hint">在 Vue 3.5+ 中，<code>const &#123; count &#125; = defineProps(...)</code> 解构后仍保持响应式。</p>

    <section class="card">
      <h4>父组件</h4>
      <button @click="inc">+1</button>
      <span class="badge">{{ count }}</span>
      <input v-model="label" placeholder="改 label 看 watch 次数" />
    </section>

    <CountDisplay :count="count" :label="label" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CountDisplay from './CountDisplay.vue'
import { useCounter } from './useCounter.ts'

const { count, inc } = useCounter(0)
const label = ref('hello')
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 12px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h4 { margin: 0 0 8px; font-size: 14px; }
button { padding: 4px 12px; border: 1px solid #cbd5e1; background: #fff; border-radius: 4px; cursor: pointer; }
input { padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-left: 6px; }
.badge {
  display: inline-block;
  margin: 0 8px;
  padding: 2px 10px;
  background: #6366f1;
  color: #fff;
  border-radius: 12px;
  font-size: 12px;
}
code { background: #f1f5f9; padding: 1px 5px; border-radius: 3px; font-size: 12px; }
</style>