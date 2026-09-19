<script setup>
import { ref, defineAsyncComponent, onMounted, h } from 'vue'

const mode = ref('broken')

const AsyncUser = defineAsyncComponent(() => {
  return new Promise(resolve => {
    setTimeout(() => resolve({
      setup() {
        return () => h('div', { class: 'user' }, '用户详情（已加载）')
      },
    }), 1200)
  })
})

const state = ref('idle')
const eventLog = ref([])
function log(m) { eventLog.value.unshift(m); if (eventLog.value.length > 8) eventLog.value.length = 8 }

onMounted(() => {
  log('App mounted')
})

function useBroken() {
  // 模拟「外层 await」错误用法
  state.value = 'pending'
  setTimeout(() => { state.value = 'done'; log('外层 setTimeout 完成（无 fallback 切换）') }, 1000)
}
</script>

<template>
  <div class="demo">
    <p class="badge">async setup + Suspense</p>

    <div class="switch">
      <button :class="{ active: mode === 'broken' }" @click="mode = 'broken'">错误：外层直接 await</button>
      <button :class="{ active: mode === 'fixed' }" @click="mode = 'fixed'">修复：Suspense 包裹</button>
    </div>

    <div v-if="mode === 'broken'" class="broken">
      <p>外层不挂 Suspense，子组件一直 pending：</p>
      <div class="stage broken-stage">{{ state }}</div>
      <button @click="useBroken">模拟外层等待 1s</button>
    </div>

    <div v-else class="fixed">
      <p>Suspense 包裹：</p>
      <Suspense>
        <AsyncUser />
        <template #fallback>
          <div class="stage fallback">加载中…</div>
        </template>
      </Suspense>
    </div>

    <ul class="log">
      <li v-for="(l, i) in eventLog" :key="i">{{ l }}</li>
    </ul>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #fdecea; color: #c0392b; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.switch { display: flex; gap: 6px; margin-bottom: 10px; }
.switch button { flex: 1; padding: 5px 8px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.74rem; }
.switch button.active { background: #42b883; color: #fff; border-color: #42b883; }
.stage { background: #f6f8fa; padding: 14px; border-radius: 8px; text-align: center; font-weight: 600; }
.fallback { color: #b78103; }
.broken-stage { color: #888; }
.user { background: #e8f8f0; color: #27ae60; padding: 14px; border-radius: 8px; text-align: center; font-weight: 600; }
button { padding: 5px 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.78rem; margin-top: 6px; }
.log { list-style: none; padding: 6px 10px; margin: 8px 0 0; background: #f6f8fa; border-radius: 6px; font-size: 0.72rem; max-height: 120px; overflow-y: auto; font-family: ui-monospace, monospace; }
.log li { padding: 1px 0; }
</style>
