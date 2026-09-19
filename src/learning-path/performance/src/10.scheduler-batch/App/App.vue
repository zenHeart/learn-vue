<script setup>
import { ref, watchEffect, nextTick, flushSync } from 'vue'

const counter = ref(0)
const renderCount = ref(0)

watchEffect(() => {
  void counter.value
  renderCount.value++
})

function bumpNormal() {
  for (let i = 0; i < 100; i++) counter.value++
}

function bumpFlushSync() {
  flushSync(() => {
    for (let i = 0; i < 100; i++) counter.value++
  })
}

async function bumpNextTick() {
  for (let i = 0; i < 100; i++) counter.value++
  await nextTick()
}
</script>

<template>
  <div class="demo">
    <p class="badge">调度批处理 — 100 次写入</p>

    <div class="metrics">
      <div class="metric">
        <span class="label">counter</span>
        <span class="value">{{ counter }}</span>
      </div>
      <div class="metric">
        <span class="label">渲染次数</span>
        <span class="value">{{ renderCount }}</span>
      </div>
    </div>

    <div class="actions">
      <button class="primary" @click="bumpNormal">普通 100 次累加</button>
      <button @click="bumpFlushSync">flushSync 100 次</button>
      <button @click="bumpNextTick">nextTick 等待</button>
    </div>

    <p class="tip">
      普通路径渲染次数只 +1（批处理合并），flushSync 路径 +100。
    </p>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 10px; }
.metric { background: #f6f8fa; border-radius: 8px; padding: 8px 10px; }
.label { display: block; font-size: 0.7rem; color: #888; }
.value { display: block; font-size: 1.2rem; font-weight: 700; margin-top: 2px; }
.actions { display: flex; gap: 6px; flex-wrap: wrap; }
button { padding: 5px 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.78rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.tip { font-size: 0.78rem; color: #666; margin: 8px 0 0; }
</style>
