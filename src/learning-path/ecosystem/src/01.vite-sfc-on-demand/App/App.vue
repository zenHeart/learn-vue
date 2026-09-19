<script setup>
import { ref, onMounted } from 'vue'

const started = ref(0)
const sfcCount = ref(0)

onMounted(() => {
  // 模拟 Vite 的冷启动测点
  started.value = performance.now()

  // 这里只是演示计数；真实场景下 SFC 数量由 build / vite-node 给出
  sfcCount.value = 1
})

function colorForTag(tag) {
  const map = {
    resolve: '#42b883',
    optimizeDeps: '#35495e',
    pluginVue: '#3b82f6',
  }
  return map[tag] || '#666'
}
</script>

<template>
  <div class="card">
    <h2>Vite + Vue SFC 按需编译</h2>
    <p class="hint">
      这个 demo 直接在 REPL 里渲染，并展示冷启动链路中的关键字段。
      真实 Vite 项目里，浏览器会请求 <code>/src/App.vue</code>，
      由 <code>@vitejs/plugin-vue</code> 按需 transform。
    </p>

    <div class="metrics">
      <div class="metric">
        <span class="label">mount 时长</span>
        <span class="value">{{ started.toFixed(1) }} ms</span>
      </div>
      <div class="metric">
        <span class="label">当前组件数</span>
        <span class="value">{{ sfcCount }}</span>
      </div>
    </div>

    <h3>关键 vite.config.ts 字段</h3>
    <ul class="tags">
      <li><span class="dot" :style="{ background: colorForTag('resolve') }"></span><code>resolve.alias</code> — <code>@</code> → <code>./src</code></li>
      <li><span class="dot" :style="{ background: colorForTag('resolve') }"></span><code>resolve.extensions</code> — 必须包含 <code>.vue</code></li>
      <li><span class="dot" :style="{ background: colorForTag('optimizeDeps') }"></span><code>optimizeDeps.include</code> — 启动期预构建</li>
      <li><span class="dot" :style="{ background: colorForTag('pluginVue') }"></span><code>@vitejs/plugin-vue</code> — SFC transform</li>
    </ul>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 460px; }
.card h2 { margin: 0 0 6px; font-size: 1.1rem; }
.card h3 { margin: 14px 0 6px; font-size: 0.92rem; }
.hint { font-size: 0.82rem; color: #666; margin: 0 0 10px; line-height: 1.5; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.82rem; }
.metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 10px; }
.metric { background: #f6f8fa; border-radius: 8px; padding: 8px 10px; }
.label { display: block; font-size: 0.7rem; color: #888; }
.value { display: block; font-size: 1.1rem; font-weight: 700; margin-top: 2px; color: #42b883; }
.tags { list-style: none; padding: 0; margin: 0; font-size: 0.84rem; }
.tags li { display: flex; align-items: center; gap: 6px; padding: 4px 0; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
</style>
