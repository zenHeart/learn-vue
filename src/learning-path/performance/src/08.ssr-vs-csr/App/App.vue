<script setup>
import { ref, computed, useSSRContext } from 'vue'

const title = 'Vue 性能优化实战'
const author = '张三'
const body = '正文段落……'.repeat(60)
const related = Array.from({ length: 6 }, (_, i) => `相关文章 #${i + 1}`)

const logs = ref([])
const times = ref({ ssr: null, csr: null, hydrate: null })

function log(msg) {
  logs.value.unshift(`${new Date().toLocaleTimeString()}  ${msg}`)
  if (logs.value.length > 10) logs.value.length = 10
}

// mock SSR：服务端拼字符串耗时
async function runSSR() {
  const t0 = performance.now()
  await new Promise(r => setTimeout(r, 30)) // 序列化 + IO
  const t1 = performance.now()
  times.value.ssr = { server: t1 - t0, lcp: t1 - t0 + 80 } // 80ms 网络
  log(`SSR 完成：服务端拼串 ${(t1 - t0).toFixed(0)}ms，LCP ≈ ${times.value.ssr.lcp.toFixed(0)}ms`)
}

// mock CSR：JS 下载 + mount + 渲染
async function runCSR() {
  const t0 = performance.now()
  await new Promise(r => setTimeout(r, 220)) // JS 下载
  await new Promise(r => setTimeout(r, 60))  // mount + render
  const t1 = performance.now()
  times.value.csr = { download: 220, render: 60, lcp: t1 - t0 }
  log(`CSR 完成：JS 下载 220ms + 渲染 60ms，LCP ≈ ${times.value.csr.lcp.toFixed(0)}ms`)
}

// mock Hydrate
async function runHydrate() {
  if (times.value.ssr == null) {
    log('请先跑 SSR mock')
    return
  }
  const t0 = performance.now()
  await new Promise(r => setTimeout(r, 50))
  const t1 = performance.now()
  times.value.hydrate = t1 - t0
  log(`Hydration 完成：patch + 事件绑定 ${(t1 - t0).toFixed(0)}ms`)
}

// 演示 useSSRContext（client 下为 undefined）
const ssrCtx = useSSRContext()
const ssrDetected = computed(() => ssrCtx != null)
</script>

<template>
  <div class="demo">
    <p class="badge">SSR vs CSR mock · useSSRContext</p>

    <div class="content">
      <h2>{{ title }}</h2>
      <p class="by">作者：{{ author }}</p>
      <p class="body">{{ body.slice(0, 120) }}…</p>
      <ul class="rel">
        <li v-for="r in related" :key="r">{{ r }}</li>
      </ul>
    </div>

    <div class="actions">
      <button class="primary" @click="runSSR">跑 SSR mock</button>
      <button @click="runCSR">跑 CSR mock</button>
      <button @click="runHydrate">跑 Hydrate</button>
    </div>

    <div class="times">
      <div><strong>SSR LCP:</strong> {{ times.ssr?.lcp?.toFixed(0) ?? '—' }} ms</div>
      <div><strong>CSR LCP:</strong> {{ times.csr?.lcp?.toFixed(0) ?? '—' }} ms</div>
      <div><strong>Hydrate:</strong> {{ times.hydrate?.toFixed(0) ?? '—' }} ms</div>
      <div><strong>useSSRContext():</strong> {{ ssrDetected ? 'SSR 环境' : 'client 环境' }}</div>
    </div>

    <ul class="log">
      <li v-for="(l, i) in logs" :key="i">{{ l }}</li>
    </ul>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 480px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.content { background: #f6f8fa; padding: 10px; border-radius: 8px; margin-bottom: 10px; }
.content h2 { margin: 0 0 4px; font-size: 1rem; }
.by { font-size: 0.78rem; color: #666; margin: 0 0 6px; }
.body { font-size: 0.78rem; color: #444; margin: 0 0 6px; line-height: 1.5; }
.rel { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 2px; font-size: 0.75rem; color: #2c8e63; }
.actions { display: flex; gap: 6px; margin-bottom: 10px; }
button { padding: 5px 10px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.78rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.times { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; background: #f6f8fa; padding: 8px; border-radius: 8px; font-size: 0.78rem; margin-bottom: 8px; }
.times strong { color: #2c8e63; }
.log { list-style: none; padding: 6px 10px; margin: 0; background: #f6f8fa; border-radius: 6px; max-height: 120px; overflow-y: auto; font-size: 0.72rem; font-family: ui-monospace, monospace; }
.log li { padding: 1px 0; }
</style>
