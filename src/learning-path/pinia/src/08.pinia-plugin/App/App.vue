<template>
  <div class="app">
    <h2>自定义 Pinia 插件</h2>
    <p class="hint">本插件把 <code>prefs</code> 的 theme/locale 持久化到 localStorage</p>

    <section>
      <p>当前主题：<strong>{{ prefs.theme }}</strong></p>
      <p>当前语言：<strong>{{ prefs.locale }}</strong></p>
      <button @click="prefs.toggleTheme()">切换主题</button>
      <button @click="prefs.locale = 'en-US'">切到 en-US</button>
      <button @click="prefs.$persist?.clear()">清除持久化</button>
    </section>

    <details>
      <summary>localStorage 当前值</summary>
      <pre>{{ storage }}</pre>
    </details>

    <p class="hint">counter store 没有 persist 选项，刷新会回到 0</p>
    <button @click="counter.count++">counter.count++（{{ counter.count }}）</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePrefsStore, useCounterStore } from './store'

const prefs = usePrefsStore()
const counter = useCounterStore()
const storage = ref(Object.entries(localStorage).filter(([k]) => k.startsWith('pinia-persist:')))
setInterval(() => {
  storage.value = Object.entries(localStorage).filter(([k]) => k.startsWith('pinia-persist:'))
}, 500)
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 640px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app section { margin-bottom: 1rem; }
.app button { padding: .25rem .6rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; margin-right: .25rem; }
.app details { margin-top: 1rem; }
.app pre { background: #f6f8fa; padding: .5rem; border-radius: 6px; font-size: .8em; }
.app code { background: #eef1f4; padding: 1px 4px; border-radius: 3px; }
</style>