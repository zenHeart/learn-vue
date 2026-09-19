<script setup>
import { ref, nextTick } from 'vue'

const value = ref(0)
const barRef = ref(null)
const lastRead = ref(null)
const rafHandle = ref(null)

async function bumpSync() {
  value.value += 10
  // 同步读 DOM
  lastRead.value = barRef.value?.style.width || `${(value.value / 100) * 100}%`
  log(`同步读 width = ${lastRead.value}`)
}

async function bumpNextTick() {
  value.value += 10
  await nextTick()
  lastRead.value = barRef.value?.style.width || `${(value.value / 100) * 100}%`
  log(`nextTick 后读 width = ${lastRead.value}`)
}

function startRaf() {
  cancelAnimationFrame(rafHandle.value)
  const start = performance.now()
  const duration = 1500
  const from = value.value
  const to = Math.min(100, from + 30)
  function frame(now) {
    const t = Math.min(1, (now - start) / duration)
    value.value = from + (to - from) * t
    if (t < 1) rafHandle.value = requestAnimationFrame(frame)
    else log(`rAF 结束 value = ${value.value.toFixed(1)}`)
  }
  rafHandle.value = requestAnimationFrame(frame)
}

const logs = ref([])
function log(msg) {
  logs.value.unshift(msg)
  if (logs.value.length > 6) logs.value.length = 6
}
</script>

<template>
  <div class="demo">
    <p class="badge">nextTick vs requestAnimationFrame</p>

    <div class="bar-wrap">
      <div ref="barRef" class="bar" :style="{ width: `${value}%` }"></div>
      <span class="pct">{{ value.toFixed(0) }}%</span>
    </div>

    <div class="actions">
      <button class="primary" @click="bumpSync">同步读 width</button>
      <button @click="bumpNextTick">nextTick 后读</button>
      <button @click="startRaf">rAF 动画</button>
    </div>

    <div class="read">最近一次读到的 width: <strong>{{ lastRead ?? '—' }}</strong></div>

    <ul class="log">
      <li v-for="(l, i) in logs" :key="i">{{ l }}</li>
    </ul>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.bar-wrap { position: relative; background: #f6f8fa; border-radius: 8px; height: 28px; margin-bottom: 10px; overflow: hidden; }
.bar { background: linear-gradient(90deg, #42b883, #34a06b); height: 100%; transition: width 60ms linear; }
.pct { position: absolute; top: 6px; right: 8px; font-size: 0.78rem; font-weight: 700; color: #2c8e63; }
.actions { display: flex; gap: 6px; margin-bottom: 8px; }
button { padding: 5px 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.78rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.read { font-size: 0.78rem; color: #444; margin-bottom: 6px; }
.log { list-style: none; padding: 6px 10px; margin: 0; background: #f6f8fa; border-radius: 6px; font-size: 0.72rem; font-family: ui-monospace, monospace; max-height: 120px; overflow-y: auto; }
.log li { padding: 1px 0; }
</style>
