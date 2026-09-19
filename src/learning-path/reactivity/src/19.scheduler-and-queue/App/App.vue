<template>
  <section class="r19">
    <h2>调度器、队列与 flushSync</h2>

    <div class="card">
      <h3>① 同 tick 内多次写只触发一次渲染</h3>
      <p>n = {{ n }} — watcher 触发次数: {{ renderLog.length }}</p>
      <button @click="burst">连续 100 次写</button>
    </div>

    <div class="card">
      <h3>② flushSync 强制同步刷新</h3>
      <p>k = {{ k }} — flushSync 触发次数: {{ syncRenderLog.length }}</p>
      <button @click="burstSync">flushSync 包住 100 次写</button>
    </div>

    <div class="card">
      <h3>③ nextTick 等到 DOM 更新</h3>
      <p>m = {{ m }} — 通过 nextTick 读到的最新 DOM 文本</p>
      <button @click="awaitNext">m++ + await nextTick</button>
    </div>

    <div class="card">
      <h3>④ queuePostFlushCb：在 patch 后执行</h3>
      <p>p = {{ p }} — postFlush 日志: {{ postLog }}</p>
      <button @click="p++">p++</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, flushSync, queuePostFlushCb } from 'vue'

/* === ① 同 tick 合并 === */
const n = ref(0)
const renderLog = ref<number[]>([])
watch(n, () => { renderLog.value.push(renderLog.value.length) })
function burst() {
  for (let i = 0; i < 100; i++) n.value++
}

/* === ② flushSync === */
const k = ref(0)
const syncRenderLog = ref<number[]>([])
watch(k, () => { syncRenderLog.value.push(syncRenderLog.value.length) })
function burstSync() {
  flushSync(() => {
    for (let i = 0; i < 100; i++) k.value++
  })
  // 此时 DOM 已同步更新
}

/* === ③ nextTick === */
const m = ref(0)
async function awaitNext() {
  m.value++
  await nextTick()
  // 此时模板已经重新渲染
}

/* === ④ queuePostFlushCb === */
const p = ref(0)
const postLog = ref('')
queuePostFlushCb(() => { postLog.value += `| init post` })
watch(p, () => {
  // 在 watch 内调用 queuePostFlushCb 会延后到 patch 完成后
  queuePostFlushCb(() => { postLog.value += `| p=${p.value}` })
})
</script>

<style scoped>
.r19 { font-family: system-ui; padding: 1rem; }
.r19 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r19 button { margin-right: 0.4rem; }
</style>
