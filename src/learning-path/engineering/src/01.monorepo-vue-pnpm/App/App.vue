<script setup>
import { ref, computed } from 'vue'

// 拓扑排序演示：构建顺序
const packages = [
  { name: '@my-org/utils', depends: [] },
  { name: '@my-org/ui', depends: ['@my-org/utils'] },
  { name: '@my-org/web', depends: ['@my-org/ui', '@my-org/utils'] },
  { name: '@my-org/admin', depends: ['@my-org/ui'] },
  { name: '@my-org/mobile', depends: ['@my-org/utils'] },
]

function topoSort(packages) {
  const indeg = new Map()
  const graph = new Map()
  packages.forEach(p => { indeg.set(p.name, 0); graph.set(p.name, []) })
  packages.forEach(p => p.depends.forEach(dep => {
    graph.get(dep).push(p.name)
    indeg.set(p.name, indeg.get(p.name) + 1)
  }))
  const queue = [...indeg.entries()].filter(([, d]) => d === 0).map(([n]) => n)
  const order = []
  while (queue.length) {
    const n = queue.shift()
    order.push(n)
    for (const next of graph.get(n)) {
      indeg.set(next, indeg.get(next) - 1)
      if (indeg.get(next) === 0) queue.push(next)
    }
  }
  return order
}

const parallel = ref(false)
const order = computed(() => topoSort(packages))
const totalTime = computed(() => {
  // 每包 30s，并行最多 4 个
  const t = 30
  if (!parallel.value) {
    return order.value.length * t
  }
  // 简单分组：按层
  const layers = []
  const seen = new Set()
  let remaining = new Set(packages.map(p => p.name))
  while (remaining.size) {
    const layer = []
    for (const p of packages) {
      if (!remaining.has(p.name)) continue
      if (p.depends.every(d => seen.has(d))) layer.push(p.name)
    }
    layer.forEach(n => { remaining.delete(n); seen.add(n) })
    if (layer.length) layers.push(layer)
  }
  return layers.length * t
})
</script>

<template>
  <div class="demo">
    <p class="badge">pnpm workspace 构建顺序</p>

    <h4>包结构</h4>
    <ul class="pkgs">
      <li v-for="p in packages" :key="p.name">
        <code>{{ p.name }}</code>
        <span class="deps" v-if="p.depends.length">← {{ p.depends.join(', ') }}</span>
      </li>
    </ul>

    <h4>拓扑排序结果</h4>
    <div class="order">
      <span v-for="(n, i) in order" :key="n" class="step">
        {{ n }}<span v-if="i < order.length - 1" class="arrow"> →</span>
      </span>
    </div>

    <label class="parallel">
      <input type="checkbox" v-model="parallel" /> 并行构建 (4 worker)
    </label>

    <p class="time">总耗时估算: <strong>{{ totalTime }}s</strong></p>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
h4 { font-size: 0.85rem; margin: 8px 0 4px; color: #444; }
.pkgs { list-style: none; padding: 0; margin: 0 0 10px; font-size: 0.78rem; }
.pkgs li { padding: 2px 0; }
code { background: #f6f8fa; padding: 1px 6px; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.85em; }
.deps { color: #888; margin-left: 6px; }
.order { background: #f6f8fa; padding: 10px; border-radius: 8px; font-family: ui-monospace, monospace; font-size: 0.78rem; margin-bottom: 10px; word-break: break-all; }
.arrow { color: #42b883; margin: 0 4px; }
.parallel { display: flex; gap: 6px; align-items: center; font-size: 0.78rem; margin-bottom: 6px; }
.time { font-size: 0.85rem; color: #2c8e63; font-weight: 600; }
</style>
