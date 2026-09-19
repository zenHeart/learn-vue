<script setup>
import { ref } from 'vue'

const logs = ref([])
function log(m) { logs.value.unshift(m); if (logs.value.length > 10) logs.value.length = 10 }

// 模拟 store
let sharedState = { count: 0 }
const fixMode = ref(false)

function createStore() {
  if (fixMode.value) return { count: 0 }  // 修复：每个用例独立
  return sharedState                    // 错误：共享全局
}

const store = ref(createStore())

function runTest(label) {
  const s = createStore()
  log(`[${label}] 初始化 count = ${s.count}`)
  s.count++
  log(`[${label}] 操作后 count = ${s.count}`)
}

function reset() {
  sharedState = { count: 0 }
  store.value = createStore()
  log('重置')
}
</script>

<template>
  <div class="demo">
    <p class="badge">Pinia 测试隔离</p>

    <div class="switch">
      <label><input type="checkbox" v-model="fixMode" /> 修复模式（每个用例独立）</label>
    </div>

    <div class="actions">
      <button @click="runTest('用例 A')">跑用例 A</button>
      <button @click="runTest('用例 B')">跑用例 B</button>
      <button @click="runTest('用例 C')">跑用例 C</button>
      <button @click="reset">重置</button>
    </div>

    <p class="meta">当前 store.count = {{ store.count }}</p>

    <h4>操作日志</h4>
    <ul class="log">
      <li v-for="(l, i) in logs" :key="i">{{ l }}</li>
    </ul>

    <p class="tip">
      错误模式下 count 累积（用例间污染）；修复模式每次都从 0 开始。
    </p>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 480px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #fdecea; color: #c0392b; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.switch { margin-bottom: 10px; font-size: 0.78rem; }
.actions { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
button { padding: 5px 10px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.78rem; }
.meta { font-size: 0.85rem; color: #2c8e63; margin-bottom: 6px; }
h4 { font-size: 0.85rem; margin: 8px 0 4px; color: #444; }
.log { list-style: none; padding: 6px 10px; margin: 0; background: #f6f8fa; border-radius: 6px; font-size: 0.72rem; max-height: 160px; overflow-y: auto; font-family: ui-monospace, monospace; }
.log li { padding: 1px 0; }
.tip { font-size: 0.78rem; color: #666; margin: 10px 0 0; }
</style>
