<script setup>
import { reactive, shallowReactive, triggerRef } from 'vue'
import { ref } from 'vue'

const DEPTH = 5
const WIDTH = 200
const results = ref([])
const running = ref(false)

function buildDeep() {
  // 五层嵌套：{ level0: [ { level1: [ { level2: [ { level3: [ { level4: { value } } ] } ] } ] } ] }
  function make(level) {
    if (level === DEPTH) return { value: 0 }
    return Array.from({ length: WIDTH }, (_, i) => make(level + 1))
  }
  return make(0)
}

function buildShallow() {
  return { level0: buildDeep() }
}

async function benchDeep() {
  const data = buildDeep()
  const proxy = reactive(data)
  const t0 = performance.now()
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 0; i < WIDTH; i++) {
      proxy.level0[i].level1[i].level2[i].level3[i].value++
    }
  }
  const t1 = performance.now()
  results.value.push({ label: 'reactive 5层嵌套', ms: t1 - t0 })
}

async function benchShallow() {
  const data = buildShallow()
  const proxy = shallowReactive(data)
  const t0 = performance.now()
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 0; i < WIDTH; i++) {
      proxy.level0[i].level1[i].level2[i].level3[i].value++
    }
  }
  const t1 = performance.now()
  results.value.push({ label: 'shallowReactive 顶层代理', ms: t1 - t0 })
}

async function run() {
  if (running.value) return
  running.value = true
  results.value = []
  await benchDeep()
  await benchShallow()
  running.value = false
}
</script>

<template>
  <div class="demo">
    <p class="badge">深嵌套响应式 — 批量更新基准</p>

    <p class="meta">深度 {{ DEPTH }}，宽度 {{ WIDTH }}，5 轮 × {{ WIDTH }} 次叶节点更新</p>

    <div class="actions">
      <button class="primary" :disabled="running" @click="run">
        {{ running ? '跑基准中…' : '跑基准' }}
      </button>
    </div>

    <ul class="results">
      <li v-for="(r, i) in results" :key="i">
        <span class="mode">{{ r.label }}</span>
        <span class="ms">{{ r.ms.toFixed(1) }} ms</span>
      </li>
    </ul>

    <p class="tip">嵌套越深、写入越频繁，深 reactive 的代理开销越明显。</p>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 8px; }
.meta { font-size: 0.78rem; color: #666; margin: 0 0 10px; }
.actions { margin-bottom: 10px; }
button { padding: 5px 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.8rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
button:disabled { opacity: 0.6; }
.results { list-style: none; padding: 0; margin: 0; }
.results li { display: flex; justify-content: space-between; padding: 6px 10px; border-radius: 6px; background: #f6f8fa; margin-bottom: 4px; font-size: 0.85rem; }
.mode { font-family: ui-monospace, monospace; }
.tip { font-size: 0.78rem; color: #666; margin: 8px 0 0; }
</style>
