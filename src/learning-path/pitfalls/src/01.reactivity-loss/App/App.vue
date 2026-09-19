<script setup>
import { reactive, toRefs } from 'vue'

// 错误版本
const badState = reactive({ count: 0 })
const { count: badCount } = badState

// 修复版本
const goodState = reactive({ count: 0 })
const { count: goodCount } = toRefs(goodState)
</script>

<template>
  <div class="demo">
    <p class="badge">响应式丢失</p>

    <div class="card bad">
      <h3>① 错误版本</h3>
      <pre>const { count } = state</pre>
      <p>count 显示: {{ badCount }}</p>
      <button @click="badCount++">错误：count++</button>
      <p class="meta">badState.count = {{ badState.count }}</p>
    </div>

    <div class="card good">
      <h3>② 修复版本</h3>
      <pre>const { count } = toRefs(state)</pre>
      <p>count 显示: {{ goodCount }}</p>
      <button class="primary" @click="goodCount.value++">修复：count.value++</button>
      <p class="meta">goodState.count = {{ goodState.count }}</p>
    </div>

    <p class="tip">错误版本的 count 是普通 number，自增不会触发更新。</p>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #fdecea; color: #c0392b; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.card { padding: 10px; border-radius: 8px; margin-bottom: 8px; }
.card.bad { background: #fff5f5; border: 1px solid #f5c6c6; }
.card.good { background: #f0fff4; border: 1px solid #c6e8d4; }
h3 { font-size: 0.85rem; margin: 0 0 4px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 6px 8px; border-radius: 4px; font-size: 0.72rem; font-family: ui-monospace, monospace; margin: 4px 0; }
button { padding: 5px 10px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.78rem; margin-top: 4px; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.meta { font-size: 0.72rem; color: #888; margin-top: 4px; }
.tip { font-size: 0.78rem; color: #666; margin: 8px 0 0; }
</style>
