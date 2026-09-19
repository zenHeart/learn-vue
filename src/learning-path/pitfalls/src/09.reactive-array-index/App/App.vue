<script setup>
import { ref, reactive } from 'vue'

const arr = ref([{ name: 'A', id: 1 }, { name: 'B', id: 2 }])
const reactiveArr = reactive([{ name: 'A', id: 1 }, { name: 'B', id: 2 }])

const logs = ref([])
function log(m) { logs.value.unshift(m); if (logs.value.length > 8) logs.value.length = 8 }

// 错误：拿 first 引用，重新赋值 arr.value[0]，first 不变
function brokenReplace() {
  const first = arr.value[0]
  log(`错误前 first.name = ${first.name}`)
  arr.value[0] = { name: 'A*', id: 1 }
  log(`arr.value[0].name = ${arr.value[0].name}`)
  log(`first.name 仍是 = ${first.name} (旧引用)`)
}

// 修复：改字段而非替换索引
function fixedField() {
  arr.value[0].name = arr.value[0].name + '*'
  log(`arr.value[0].name 改为 ${arr.value[0].name}`)
}

// 修复：reactive 数组
function fixedReactive() {
  reactiveArr[0].name = reactiveArr[0].name + '*'
  log(`reactiveArr[0].name = ${reactiveArr[0].name}`)
}

function reset() {
  arr.value = [{ name: 'A', id: 1 }, { name: 'B', id: 2 }]
  reactiveArr.splice(0, reactiveArr.length, { name: 'A', id: 1 }, { name: 'B', id: 2 })
  logs.value = []
}
</script>

<template>
  <div class="demo">
    <p class="badge">响应式数组索引</p>

    <div class="state">
      <div><strong>ref 数组:</strong> {{ arr.map(x => x.name).join(', ') }}</div>
      <div><strong>reactive 数组:</strong> {{ reactiveArr.map(x => x.name).join(', ') }}</div>
    </div>

    <div class="actions">
      <button @click="brokenReplace">错误：arr.value[0] = {...}</button>
      <button @click="fixedField">修复：改字段 name</button>
      <button class="primary" @click="fixedReactive">修复：reactive 数组</button>
      <button @click="reset">重置</button>
    </div>

    <ul class="log">
      <li v-for="(l, i) in logs" :key="i">{{ l }}</li>
    </ul>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 500px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #fdecea; color: #c0392b; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.state { background: #f6f8fa; padding: 8px; border-radius: 8px; font-size: 0.78rem; margin-bottom: 10px; line-height: 1.6; }
.actions { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
button { padding: 5px 10px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.72rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.log { list-style: none; padding: 6px 10px; margin: 0; background: #f6f8fa; border-radius: 6px; font-size: 0.72rem; max-height: 160px; overflow-y: auto; font-family: ui-monospace, monospace; }
.log li { padding: 1px 0; }
</style>
