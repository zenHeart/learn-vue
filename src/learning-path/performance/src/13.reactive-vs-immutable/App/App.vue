<script setup>
import { ref, shallowRef, reactive } from 'vue'

const FIELD_COUNT = 1000
const results = ref([])
const running = ref(false)
const freezeError = ref(null)

function makeBig(n) {
  const obj = {}
  for (let i = 0; i < n; i++) obj[`k${i}`] = i
  return obj
}

async function benchReactive() {
  const proxy = reactive(makeBig(FIELD_COUNT))
  const t0 = performance.now()
  for (let i = 0; i < 100; i++) {
    for (let k = 0; k < FIELD_COUNT; k++) proxy[`k${k}`] = k + i
  }
  const dt = performance.now() - t0
  results.value.push({ label: 'reactive 写 1000 字段 ×100', ms: dt })
}

async function benchShallow() {
  const s = shallowRef(makeBig(FIELD_COUNT))
  const t0 = performance.now()
  for (let i = 0; i < 100; i++) {
    s.value = { ...s.value, ...Object.fromEntries(Array.from({ length: 10 }, (_, k) => [`k${k}`, i])) }
  }
  const dt = performance.now() - t0
  results.value.push({ label: 'shallowRef 整体替换', ms: dt })
}

async function benchFreeze() {
  const frozen = Object.freeze(makeBig(FIELD_COUNT))
  const t0 = performance.now()
  let reads = 0
  for (let i = 0; i < 100; i++) {
    for (let k = 0; k < FIELD_COUNT; k++) {
      reads += frozen[`k${k}`]
    }
  }
  const dt = performance.now() - t0
  results.value.push({ label: `Object.freeze 读 1000 字段 ×100 (sum=${reads})`, ms: dt })
}

async function run() {
  if (running.value) return
  running.value = true
  results.value = []
  await benchReactive()
  await benchShallow()
  await benchFreeze()
  running.value = false
}

function tryWriteFrozen() {
  const frozen = Object.freeze({ a: 1 })
  try {
    frozen.a = 2
    freezeError.value = 'no error (only in strict mode)'
  } catch (e) {
    freezeError.value = e.message
  }
}
</script>

<template>
  <div class="demo">
    <p class="badge">响应式 vs 不可变数据</p>

    <div class="actions">
      <button class="primary" :disabled="running" @click="run">
        {{ running ? '跑基准中…' : '跑基准' }}
      </button>
      <button @click="tryWriteFrozen">尝试写 freeze 对象</button>
    </div>

    <ul class="results">
      <li v-for="(r, i) in results" :key="i">
        <span class="mode">{{ r.label }}</span>
        <span class="ms">{{ r.ms.toFixed(1) }} ms</span>
      </li>
    </ul>

    <div v-if="freezeError" class="err">写冻结对象错误: {{ freezeError }}</div>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 480px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.actions { display: flex; gap: 6px; margin-bottom: 10px; }
button { padding: 5px 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.78rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
button:disabled { opacity: 0.6; }
.results { list-style: none; padding: 0; margin: 0; }
.results li { display: flex; justify-content: space-between; padding: 6px 10px; border-radius: 6px; background: #f6f8fa; margin-bottom: 4px; font-size: 0.82rem; }
.mode { font-family: ui-monospace, monospace; }
.err { margin-top: 10px; padding: 6px 10px; background: #fdecea; color: #c0392b; border-radius: 6px; font-size: 0.78rem; }
</style>
