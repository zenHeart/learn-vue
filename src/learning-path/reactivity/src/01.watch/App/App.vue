<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <p>count = {{ state.count }}</p>
    <button @click="inc">+1</button>
    <button @click="reset">reset</button>
    <ul>
      <li v-for="log in logs" :key="log.id">{{ log.text }}</li>
    </ul>
    <p class="meta">
      watch 的三参数：<code>source</code> · <code>cb</code> · <code>options</code>。本 demo 同时演示 <code>deep</code>、<code>immediate</code>、<code>flush: 'post'</code>。
    </p>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

const title = ref('watch(source, cb, options) 三参数')
const state = reactive({ count: 0, deep: { value: 1 } })
const logs = ref([])
let id = 0
function addLog(text) {
  logs.value.unshift({ id: ++id, text })
  if (logs.value.length > 6) logs.value.length = 6
}
function inc() {
  state.count++
  state.deep.value++
}
function reset() {
  state.count = 0
  state.deep.value = 1
}

watch(
  () => state.count,
  (val, old) => addLog(`count ${old} -> ${val}`),
  { immediate: true }
)

watch(
  () => state.deep,
  (val) => addLog(`deep ref changed: ${val.value}`),
  { deep: true, flush: 'post' }
)
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 520px;
}
button {
  margin-right: 6px;
  padding: 4px 10px;
}
ul {
  margin-top: 8px;
  padding-left: 18px;
  max-height: 140px;
  overflow-y: auto;
  font-size: 12px;
}
code {
  background: #e2e8f0;
  padding: 0 4px;
  border-radius: 3px;
}
.meta {
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
}
</style>