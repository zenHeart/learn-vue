<script setup>
import { ref, watchEffect } from 'vue'

const count = ref(0)
const flushMode = ref('pre')
const boxRef = ref(null)
const logs = ref([])

function log(msg) {
  logs.value.unshift(`${new Date().toLocaleTimeString()}  ${msg}`)
  if (logs.value.length > 8) logs.value.length = 8
}

watchEffect(() => {
  const c = count.value
  const f = flushMode.value
  // 模拟 watcher 触发时机：直接读 boxRef
  if (boxRef.value) {
    log(`[${f}] count=${c}, 回调时 box 文本 = "${boxRef.value.textContent}"`)
  } else {
    log(`[${f}] count=${c}`)
  }
}, { flush: flushMode })

function bump() {
  count.value++
}
</script>

<template>
  <div class="demo">
    <p class="badge">watchEffect flush 选项</p>

    <div class="controls">
      <label><input type="radio" value="pre" v-model="flushMode" /> pre (默认)</label>
      <label><input type="radio" value="post" v-model="flushMode" /> post</label>
      <label><input type="radio" value="sync" v-model="flushMode" /> sync</label>
    </div>

    <div ref="boxRef" class="box">count = {{ count }}</div>

    <div class="actions">
      <button class="primary" @click="bump">+1</button>
    </div>

    <ul class="log">
      <li v-for="(l, i) in logs" :key="i">{{ l }}</li>
    </ul>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 480px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.controls { display: flex; gap: 10px; margin-bottom: 8px; font-size: 0.78rem; }
.controls label { display: flex; gap: 4px; align-items: center; }
.box { background: #f6f8fa; padding: 16px; border-radius: 8px; text-align: center; font-size: 1.4rem; font-weight: 700; color: #2c8e63; margin-bottom: 10px; }
.actions { margin-bottom: 8px; }
button { padding: 5px 14px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.8rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.log { list-style: none; padding: 6px 10px; margin: 0; background: #f6f8fa; border-radius: 6px; font-size: 0.72rem; font-family: ui-monospace, monospace; max-height: 160px; overflow-y: auto; }
.log li { padding: 1px 0; }
</style>
