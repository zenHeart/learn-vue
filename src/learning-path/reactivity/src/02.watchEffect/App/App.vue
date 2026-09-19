<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <p>a = {{ a }}，b = {{ b }}，sum = {{ sum }}</p>
    <button @click="a++">a +1</button>
    <button @click="b++">b +1</button>
    <ul>
      <li v-for="log in logs" :key="log.id">{{ log.text }}</li>
    </ul>
    <p class="meta">
      watchEffect 自动追踪内部使用过的响应式依赖，无需手动列出 source；与 watch 的差异是「无需 source，副作用自动重跑」。
    </p>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'

const title = ref('watchEffect 自动追踪')
const a = ref(1)
const b = ref(2)
const sum = computed(() => a.value + b.value)

const logs = ref([])
let id = 0
function addLog(text) {
  logs.value.unshift({ id: ++id, text })
  if (logs.value.length > 6) logs.value.length = 6
}

watchEffect(() => {
  addLog(`effect 看到 a=${a.value}, sum=${sum.value}`)
})
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