<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <p>count = {{ count }}</p>
    <p>other = {{ other }}</p>
    <button @click="count++">count++</button>
    <button @click="other++">other++</button>
    <ul>
      <li v-for="log in logs" :key="log.id">{{ log.text }}</li>
    </ul>
    <p class="meta">
      <code>watch(ref, cb, { immediate, deep, once, flush })</code>。本 demo 演示 <code>immediate</code> 与 <code>deep</code> 选项。
    </p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const title = ref('watch(ref, cb, options) 完整选项')
const count = ref(0)
const other = ref({ value: 1 })
const logs = ref([])
let id = 0
function addLog(text) {
  logs.value.unshift({ id: ++id, text })
  if (logs.value.length > 6) logs.value.length = 6
}

watch(
  count,
  (val, old) => addLog(`count ${old} -> ${val}`),
  { immediate: true }
)

watch(
  other,
  (val) => addLog(`other.value -> ${val.value}`),
  { deep: true }
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
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
}
</style>