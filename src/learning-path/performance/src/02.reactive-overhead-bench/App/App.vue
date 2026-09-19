<script setup>
import { ref, shallowRef, reactive, shallowReactive, computed } from 'vue'

const SIZE = ref(1000)
const results = ref([])
const running = ref(false)

function makeItems(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    value: i * 2,
    label: `item-${i}`,
  }))
}

async function bench(label, container, mode) {
  const items = makeItems(SIZE.value)
  let target
  if (mode === 'ref') target = ref(items)
  else if (mode === 'shallowRef') target = shallowRef(items)
  else if (mode === 'reactive') target = reactive({ list: items })
  else target = shallowReactive({ list: items })

  // 触发一次依赖
  void (mode === 'reactive' || mode === 'shallowReactive' ? container : container)

  const t0 = performance.now()
  if (mode === 'ref') {
    for (let i = 0; i < 1000; i++) target.value = makeItems(SIZE.value)
    let s = 0
    for (let i = 0; i < 1000; i++) s += target.value[0].value
    void s
  } else if (mode === 'shallowRef') {
    for (let i = 0; i < 1000; i++) target.value = makeItems(SIZE.value)
    let s = 0
    for (let i = 0; i < 1000; i++) s += target.value[0].value
    void s
  } else if (mode === 'reactive') {
    for (let i = 0; i < 1000; i++) target.list = makeItems(SIZE.value)
    let s = 0
    for (let i = 0; i < 1000; i++) s += target.list[0].value
    void s
  } else {
    for (let i = 0; i < 1000; i++) target.list = makeItems(SIZE.value)
    let s = 0
    for (let i = 0; i < 1000; i++) s += target.list[0].value
    void s
  }
  const dt = performance.now() - t0
  results.value.push({ label, ms: dt, mode })
}

async function run() {
  if (running.value) return
  running.value = true
  results.value = []
  await bench('ref', null, 'ref')
  await bench('shallowRef', null, 'shallowRef')
  await bench('reactive', null, 'reactive')
  await bench('shallowReactive', null, 'shallowReactive')
  running.value = false
}

const fastest = computed(() => {
  if (!results.value.length) return null
  return results.value.reduce((a, b) => (a.ms < b.ms ? a : b))
})
</script>

<template>
  <div class="demo">
    <p class="badge">响应式容器基准 — 1k 写入 + 1k 读取</p>

    <div class="row">
      <label>规模</label>
      <input type="range" min="500" max="5000" step="500" v-model.number="SIZE" />
      <span class="size">{{ SIZE }}</span>
    </div>

    <div class="actions">
      <button class="primary" :disabled="running" @click="run">
        {{ running ? '跑基准中…' : '跑基准' }}
      </button>
    </div>

    <ul class="results">
      <li v-for="r in results" :key="r.mode" :class="{ best: fastest && r.mode === fastest.mode }">
        <span class="mode">{{ r.label }}</span>
        <span class="ms">{{ r.ms.toFixed(1) }} ms</span>
      </li>
    </ul>

    <p v-if="fastest" class="tip">
      最快：<strong>{{ fastest.label }}</strong>
      （整体替换语义比深响应快数倍）
    </p>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.row label { font-size: 0.82rem; color: #666; }
.row input { flex: 1; }
.size { font-weight: 700; min-width: 40px; text-align: right; }
.actions { margin-bottom: 10px; }
button { padding: 5px 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.8rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.results { list-style: none; padding: 0; margin: 0; }
.results li { display: flex; justify-content: space-between; padding: 6px 10px; border-radius: 6px; background: #f6f8fa; margin-bottom: 4px; font-size: 0.85rem; }
.results li.best { background: #e8f8f0; color: #27ae60; font-weight: 600; }
.mode { font-family: ui-monospace, monospace; }
.tip { font-size: 0.78rem; color: #666; margin-top: 8px; }
</style>
