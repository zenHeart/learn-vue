<script setup>
import { ref, onMounted, onServerPrefetch } from 'vue'

const mode = ref('broken')
const width = ref(0)
const error = ref(null)
const logs = ref([])
function log(m) { logs.value.unshift(m); if (logs.value.length > 8) logs.value.length = 8 }

// 错误：setup 顶层访问 window（模拟 SSR）
function brokenAccess() {
  error.value = null
  try {
    // 模拟 SSR 环境：window 不存在
    const fakeWindow = (typeof window === 'undefined') ? undefined : window
    if (!fakeWindow) {
      throw new ReferenceError('window is not defined (服务端渲染)')
    }
    width.value = fakeWindow.innerWidth
  } catch (e) {
    error.value = e.message
    log(`崩溃: ${e.message}`)
  }
}

// 修复：onMounted 内访问（只在客户端 mount 后执行）
onMounted(() => {
  if (typeof window !== 'undefined') {
    width.value = window.innerWidth
    log(`onMounted 读取 window.innerWidth = ${width.value}`)
  }
})

// 修复：import.meta.client 守卫
function guardedAccess() {
  error.value = null
  if (typeof window !== 'undefined') {
    width.value = window.innerWidth
    log(`import.meta.client 守卫通过，width = ${width.value}`)
  } else {
    log('服务端环境跳过 window 访问')
  }
}
</script>

<template>
  <div class="demo">
    <p class="badge">SSR 中访问 window</p>

    <div class="switch">
      <button :class="{ active: mode === 'broken' }" @click="mode = 'broken'">错误：顶层访问</button>
      <button :class="{ active: mode === 'fixed' }" @click="mode = 'fixed'">修复：onMounted</button>
    </div>

    <div v-if="mode === 'broken'" class="card bad">
      <pre>const w = window.innerWidth  // SSR 崩溃</pre>
      <button @click="brokenAccess">触发访问</button>
      <p v-if="error" class="err">{{ error }}</p>
    </div>

    <div v-else class="card good">
      <pre>onMounted(() => { width = window.innerWidth })</pre>
      <button class="primary" @click="guardedAccess">触发访问</button>
      <p class="ok">width = {{ width || '— (服务端不会执行)' }}</p>
    </div>

    <h4>事件日志</h4>
    <ul class="log">
      <li v-for="(l, i) in logs" :key="i">{{ l }}</li>
    </ul>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #fdecea; color: #c0392b; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.switch { display: flex; gap: 6px; margin-bottom: 10px; }
.switch button { flex: 1; padding: 5px 8px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.74rem; }
.switch button.active { background: #42b883; color: #fff; border-color: #42b883; }
.card { padding: 10px; border-radius: 8px; margin-bottom: 8px; }
.card.bad { background: #fff5f5; border: 1px solid #f5c6c6; }
.card.good { background: #f0fff4; border: 1px solid #c6e8d4; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 6px 8px; border-radius: 4px; font-size: 0.72rem; font-family: ui-monospace, monospace; margin: 4px 0; }
button { padding: 5px 10px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.78rem; margin-top: 4px; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.err { color: #c0392b; font-size: 0.74rem; margin-top: 6px; }
.ok { color: #27ae60; font-size: 0.85rem; margin-top: 6px; }
h4 { font-size: 0.85rem; margin: 8px 0 4px; color: #444; }
.log { list-style: none; padding: 6px 10px; margin: 0; background: #f6f8fa; border-radius: 6px; font-size: 0.72rem; max-height: 120px; overflow-y: auto; font-family: ui-monospace, monospace; }
.log li { padding: 1px 0; }
</style>
