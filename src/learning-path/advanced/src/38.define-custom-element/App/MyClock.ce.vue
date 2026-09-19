<template>
  <div class="clock">
    <span class="label">当前时间</span>
    <span class="time">{{ time }}</span>
    <span class="hint">ShadowRoot 中</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useHost, useShadowRoot } from 'vue'

// useHost / useShadowRoot 只能在 defineCustomElement 内部使用
// 它们返回对应 DOM 节点；非 Shadow DOM 模式下 useShadowRoot 返回 null
const host = useHost()
const root = useShadowRoot()

const time = ref(formatNow())
let timer: number | null = null

function formatNow() {
  const d = new Date()
  return d.toTimeString().slice(0, 8)
}

function tick() {
  time.value = formatNow()
}

defineExpose({ tick })

onMounted(() => {
  // 给宿主一个 id，便于父组件查询
  if (host && !host.id) host.id = 'demo-clock'
  // 给 shadowRoot 一个 class，便于 querySelector
  if (root && !root.className) root.classList.add('my-clock-root')

  timer = window.setInterval(tick, 1000)
})

onBeforeUnmount(() => {
  if (timer !== null) clearInterval(timer)
})
</script>

<style scoped>
.clock {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 14px;
  background: #1e293b;
  color: #f1f5f9;
  border-radius: 8px;
  font-family: ui-monospace, monospace;
  font-size: 14px;
}
.label { color: #94a3b8; font-size: 12px; }
.time { font-weight: 600; font-size: 18px; letter-spacing: 2px; }
.hint { color: #64748b; font-size: 11px; margin-left: 6px; }
</style>