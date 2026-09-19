<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <label>
      flush：
      <select v-model="flush">
        <option value="pre">pre</option>
        <option value="post">post</option>
        <option value="sync">sync</option>
      </select>
    </label>
    <p>value = {{ value }}</p>
    <button @click="value++">value++</button>
    <ul>
      <li v-for="log in logs" :key="log.id">{{ log.text }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const title = ref('watch 的 flush 选项（3.5+ 行为）')
const flush = ref('post')
const value = ref(0)
const logs = ref([])
let id = 0
function addLog(text) {
  logs.value.unshift({ id: ++id, text })
  if (logs.value.length > 6) logs.value.length = 6
}

watch(
  value,
  (v) => addLog(`flush=${flush.value} value=${v}`),
  { flush: flush.value }
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
  font-size: 12px;
  max-height: 160px;
  overflow-y: auto;
}
</style>