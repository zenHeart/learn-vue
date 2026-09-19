<script setup>
import { ref } from 'vue'

const loaded = ref({})
const loading = ref({})
const logs = ref([])

function log(msg) {
  logs.value.unshift(`${new Date().toLocaleTimeString()}  ${msg}`)
  if (logs.value.length > 10) logs.value.length = 10
}

// 用 setTimeout 模拟动态 import 的网络延迟与 chunk 拆分
function dynamicImport(name, sizeKb, delayMs) {
  return new Promise((resolve) => {
    log(`请求 chunk: ${name} (${sizeKb}KB)`)
    setTimeout(() => {
      log(`chunk ${name} 加载完成 (${sizeKb}KB)`)
      resolve({ name, sizeKb })
    }, delayMs)
  })
}

const modules = {
  chart: { size: 320, label: '图表编辑器', delay: 600 },
  markdown: { size: 180, label: 'Markdown 预览', delay: 400 },
  map: { size: 540, label: '地图工具', delay: 800 },
}

async function load(key) {
  if (loaded.value[key] || loading.value[key]) return
  loading.value[key] = true
  const meta = modules[key]
  const result = await dynamicImport(meta.label, meta.size, meta.delay)
  loaded.value[key] = result
  loading.value[key] = false
}
</script>

<template>
  <div class="demo">
    <p class="badge">Bundle 拆分 — 动态 import 模拟</p>

    <div class="cards">
      <div v-for="(m, key) in modules" :key="key" class="card">
        <h3>{{ m.label }}</h3>
        <p class="meta">{{ m.size }} KB · 估算加载 ~{{ m.delay }}ms</p>
        <button
          v-if="!loaded[key]"
          class="primary"
          :disabled="loading[key]"
          @click="load(key)"
        >{{ loading[key] ? '加载中…' : '动态加载' }}</button>
        <span v-else class="loaded">✓ 已加载</span>
      </div>
    </div>

    <div class="log-pane">
      <strong>加载日志</strong>
      <ul>
        <li v-for="(l, i) in logs" :key="i">{{ l }}</li>
      </ul>
    </div>

    <p class="tip">真实工程用 <code>import('./Big.vue')</code> 触发 Vite chunk 拆分。</p>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 480px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 12px; }
.card { background: #f6f8fa; padding: 10px; border-radius: 8px; text-align: center; }
.card h3 { font-size: 0.85rem; margin: 0 0 4px; }
.meta { font-size: 0.72rem; color: #888; margin: 0 0 8px; }
button { padding: 5px 10px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.78rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.loaded { color: #27ae60; font-weight: 600; font-size: 0.82rem; }
.log-pane { background: #f6f8fa; padding: 10px; border-radius: 8px; }
.log-pane strong { font-size: 0.78rem; color: #666; }
.log-pane ul { list-style: none; padding: 4px 0 0; margin: 0; font-family: ui-monospace, monospace; font-size: 0.72rem; max-height: 120px; overflow-y: auto; }
.log-pane li { padding: 1px 0; }
.tip { font-size: 0.72rem; color: #888; margin: 8px 0 0; }
code { background: #f6f8fa; padding: 1px 4px; border-radius: 4px; font-size: 0.85em; }
</style>
