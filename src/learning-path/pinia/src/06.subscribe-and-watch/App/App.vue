<template>
  <div class="app">
    <h2>订阅 store 自动持久化</h2>
    <p class="hint">输入会写入 localStorage，刷新页面内容仍在</p>

    <label>
      标题：
      <input v-model="draft.title" />
    </label>
    <label>
      正文：
      <textarea v-model="draft.body" rows="5"></textarea>
    </label>

    <details>
      <summary>localStorage 当前值</summary>
      <pre>{{ storedValue }}</pre>
    </details>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDraftStore } from './store'

const draft = useDraftStore()
const storedValue = ref(localStorage.getItem('pinia-demo-draft') ?? '(empty)')
setInterval(() => {
  storedValue.value = localStorage.getItem('pinia-demo-draft') ?? '(empty)'
}, 500)
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 640px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app label { display: block; margin: .5rem 0; }
.app input, .app textarea { width: 100%; padding: .35rem .6rem; border: 1px solid #d0d7de; border-radius: 4px; }
.app details { margin-top: 1rem; }
.app pre { background: #f6f8fa; padding: .5rem; border-radius: 6px; font-size: .8em; }
</style>