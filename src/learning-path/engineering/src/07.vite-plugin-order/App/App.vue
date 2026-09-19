<script setup>
import { ref, computed } from 'vue'

const defaultPlugins = [
  { name: '@vitejs/plugin-vue', enforce: 'pre', note: '解析 .vue' },
  { name: 'vite-svg-loader', enforce: 'pre', note: '把 svg 当组件' },
  { name: 'unplugin-vue-components', enforce: undefined, note: '自动注册组件' },
  { name: 'unplugin-auto-import', enforce: undefined, note: '自动 import API' },
  { name: 'vite-plugin-pages', enforce: undefined, note: '基于文件路由' },
  { name: 'vite-plugin-compression', enforce: 'post', note: 'gzip / brotli' },
  { name: 'rollup-plugin-visualizer', enforce: 'post', note: 'bundle 分析' },
]

const plugins = ref([...defaultPlugins])
const move = (i, dir) => {
  const j = i + dir
  if (j < 0 || j >= plugins.value.length) return
  const tmp = plugins.value[i]
  plugins.value[i] = plugins.value[j]
  plugins.value[j] = tmp
}

const orderValid = computed(() => {
  // pre 必须在所有默认之前，默认必须在所有 post 之前
  let stage = 0
  for (const p of plugins.value) {
    const s = p.enforce === 'pre' ? 0 : p.enforce === 'post' ? 2 : 1
    if (s < stage) return false
    stage = s
  }
  return true
})
</script>

<template>
  <div class="demo">
    <p class="badge">Vite 插件顺序</p>

    <ul class="plugins">
      <li v-for="(p, i) in plugins" :key="p.name">
        <span class="idx">{{ i + 1 }}</span>
        <span :class="['enforce', p.enforce]">{{ p.enforce ?? 'default' }}</span>
        <code>{{ p.name }}</code>
        <span class="note">{{ p.note }}</span>
        <button @click="move(i, -1)" :disabled="i === 0">↑</button>
        <button @click="move(i, 1)" :disabled="i === plugins.length - 1">↓</button>
      </li>
    </ul>

    <div :class="['status', orderValid ? 'ok' : 'fail']">
      {{ orderValid ? '✓ 顺序合法' : '✗ 顺序错误：pre/post 不能穿插' }}
    </div>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 540px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.plugins { list-style: none; padding: 0; margin: 0; }
.plugins li { display: grid; grid-template-columns: 24px 60px 1fr 1.4fr 60px; gap: 6px; padding: 5px 8px; font-size: 0.78rem; align-items: center; border-bottom: 1px solid #f0f0f0; }
.idx { color: #888; font-weight: 700; }
.enforce { font-size: 0.7rem; padding: 1px 6px; border-radius: 4px; text-align: center; }
.enforce.pre { background: #eaf3ff; color: #0066cc; }
.enforce.post { background: #fff3e0; color: #b78103; }
.enforce:not(.pre):not(.post) { background: #f0f0f0; color: #666; }
code { font-family: ui-monospace, monospace; font-size: 0.85em; }
.note { color: #666; font-size: 0.74rem; }
button { padding: 2px 6px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer; font-size: 0.74rem; }
button:disabled { opacity: 0.4; cursor: not-allowed; }
.status { margin-top: 8px; padding: 6px 10px; border-radius: 6px; font-weight: 600; text-align: center; }
.status.ok { background: #e8f8f0; color: #27ae60; }
.status.fail { background: #fdecea; color: #c0392b; }
</style>
