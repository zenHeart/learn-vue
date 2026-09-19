<script setup>
import { ref, onMounted } from 'vue'

// 客户端时间 — 安全
const clientNow = ref('')
onMounted(() => {
  clientNow.value = new Date().toLocaleString()
})

// 模拟服务端 SSR 输出
const ssrHtml = `<div id="app">
  <h2>SSR 输出片段</h2>
  <p class="placeholder">[server-rendered placeholder]</p>
  <p>当前时间：<span data-ssr="ts">2026-09-19T00:00:00Z</span></p>
</div>`

// 客户端 hydration 完成后
const hydrated = ref(false)
onMounted(() => {
  setTimeout(() => (hydrated.value = true), 100)
})

const mismatchWarn = '⚠️ Hydration mismatch: SSR 时间戳 = 2026-09-19T00:00:00Z, 客户端 = ' + clientNow.value
</script>

<template>
  <div class="card">
    <h2>Vite SSR / Hydration</h2>
    <p class="hint">对比 SSR 输出的 HTML 与 hydration 后的 DOM。</p>

    <h3>SSR 输出</h3>
    <pre>{{ ssrHtml }}</pre>

    <h3>客户端 hydration 后</h3>
    <div class="client">
      <p>当前时间（客户端）：<strong>{{ clientNow || '正在 mount…' }}</strong></p>
      <p v-if="hydrated" class="ok">✓ Hydration 成功</p>
      <p v-else class="warn">{{ mismatchWarn }}</p>
    </div>

    <h3>典型 mismatch 成因</h3>
    <ul>
      <li>Date.now() / new Date() 服务端、客户端不同</li>
      <li>Math.random() / crypto.randomUUID()</li>
      <li>localStorage、window.matchMedia</li>
    </ul>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 520px; }
.card h2 { margin: 0 0 6px; font-size: 1.05rem; }
.card h3 { margin: 12px 0 6px; font-size: 0.9rem; }
.hint { font-size: 0.82rem; color: #666; margin: 0 0 10px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-size: 0.78rem; line-height: 1.55; overflow-x: auto; }
.client { background: #f6f8fa; padding: 8px 10px; border-radius: 8px; font-size: 0.85rem; }
.ok { color: #18a058; }
.warn { color: #b45309; font-family: ui-monospace, monospace; font-size: 0.78rem; }
ul { font-size: 0.85rem; padding-left: 20px; margin: 6px 0; }
</style>
