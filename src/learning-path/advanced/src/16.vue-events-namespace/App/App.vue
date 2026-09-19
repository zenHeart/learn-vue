<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <p>父组件日志：</p>
    <ul>
      <li v-for="log in logs" :key="log.id">{{ log.text }}</li>
    </ul>
    <Child @save="onSave" @update:value="onUpdate" />
    <p class="meta">
      父组件同时监听 <code>@save</code> 与 <code>@update:value</code>。子组件用 <code>emits: ['save', 'update:value']</code> 声明多个事件。
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const title = ref('多个事件的命名与监听')
const logs = ref([])
let id = 0
function addLog(text) {
  logs.value.unshift({ id: ++id, text })
  if (logs.value.length > 6) logs.value.length = 6
}
function onSave(payload) { addLog('save: ' + JSON.stringify(payload)) }
function onUpdate(value) { addLog('update:value: ' + value) }
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
ul {
  margin: 6px 0;
  padding-left: 18px;
  font-size: 12px;
  max-height: 140px;
  overflow-y: auto;
}
button {
  padding: 4px 10px;
  margin-right: 6px;
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