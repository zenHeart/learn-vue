<template>
  <div class="tab-inner">
    <p>Tab C — 后台轮询开关</p>
    <label>
      <input type="checkbox" v-model="pollingOn" /> 启用轮询
    </label>
    <p>本组件看到的 tick: {{ tick }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject, onActivated, onDeactivated, onMounted, onUnmounted } from 'vue'
const append = inject<(s: string) => void>('appendLog')

const pollingOn = ref(false)
const tick = ref(0)

let timer: ReturnType<typeof setInterval> | null = null
function startPolling() {
  if (timer) return
  timer = setInterval(() => { tick.value++ }, 200)
}
function stopPolling() {
  if (timer) { clearInterval(timer); timer = null }
}

watch(pollingOn, (v) => {
  v ? startPolling() : stopPolling()
})

onMounted(() => append?.('C: onMounted'))
onUnmounted(() => {
  append?.('C: onUnmounted')
  stopPolling()
})
onActivated(() => {
  append?.('C: onActivated → polling 启动')
  if (pollingOn.value) startPolling()
})
onDeactivated(() => {
  append?.('C: onDeactivated → polling 停止')
  stopPolling()
})
</script>

<style scoped>
.tab-inner {
  padding: 12px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 4px;
}
</style>