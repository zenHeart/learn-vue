<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <label>
      flush 选项：
      <select v-model="flushMode">
        <option value="pre">pre</option>
        <option value="post">post</option>
        <option value="sync">sync</option>
      </select>
    </label>
    <label>
      <input type="checkbox" v-model="onceEnabled" /> once：只触发一次
    </label>
    <p>value = {{ value }}</p>
    <button @click="value++">value++</button>
    <ul>
      <li v-for="log in logs" :key="log.id">{{ log.text }}</li>
    </ul>
    <p class="meta">
      <code>flush: 'pre' | 'post' | 'sync'</code> 决定回调在 DOM 更新前/后/同步触发；<code>once: true</code> 让 watchEffect 只跑一次。
    </p>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'

const title = ref('watchEffect flush + once 选项')
const flushMode = ref('post')
const onceEnabled = ref(true)
const value = ref(0)
const logs = ref([])
let id = 0
function addLog(text) {
  logs.value.unshift({ id: ++id, text })
  if (logs.value.length > 6) logs.value.length = 6
}

watchEffect(
  () => {
    addLog(`flush=${flushMode.value} once=${onceEnabled.value} value=${value.value}`)
  },
  {
    flush: flushMode.value,
    once: onceEnabled.value
  }
)
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 540px;
}
button {
  margin: 6px 0;
  padding: 4px 10px;
}
ul {
  margin-top: 8px;
  padding-left: 18px;
  max-height: 160px;
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