<template>
  <section class="r24">
    <h2>shallowRef / triggerRef：浅层 ref 与强制触发</h2>

    <div class="card">
      <h3>① shallowRef 内部字段修改不触发</h3>
      <p>count：{{ state.count }}</p>
      <p>render tick：{{ tick }}</p>
      <button @click="state.count++">改字段（不触发）</button>
      <button @click="state = { count: state.count + 1 }">整体替换（触发）</button>
      <button @click="triggerState">手动 triggerRef（触发）</button>
    </div>

    <div class="card">
      <h3>② shallowRef vs ref：代理成本</h3>
      <p>ref 深代理耗时：{{ refMs.toFixed(2) }} ms</p>
      <p>shallowRef 耗时：{{ shallowMs.toFixed(2) }} ms</p>
      <button @click="benchProxy">运行基准（10k 字段）</button>
    </div>

    <div class="card">
      <h3>③ 实战：表单草稿（防抖保存）</h3>
      <textarea v-model="draft" rows="4" placeholder="输入会写到 shallowRef，按钮触发更新" />
      <p>已保存快照：{{ snapshot }}</p>
      <button @click="saveDraft">保存（triggerRef）</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, shallowRef, triggerRef, watchEffect } from 'vue'

/* === ① shallowRef 行为 === */
const state = shallowRef({ count: 0 })
const tick = ref(0)
watchEffect(() => {
  // 只追踪 .value，不追踪内部 count
  state.value
  tick.value++
})
function triggerState() {
  // 手动触发一次
  triggerRef(state)
}

/* === ② 代理成本基准 === */
const refMs = ref(0)
const shallowMs = ref(0)
function benchProxy() {
  const big = (): Record<string, number> => {
    const o: Record<string, number> = {}
    for (let i = 0; i < 10000; i++) o['k' + i] = i
    return o
  }
  const t0 = performance.now()
  ref(big())
  const t1 = performance.now()
  shallowRef(big())
  const t2 = performance.now()
  refMs.value = t1 - t0
  shallowMs.value = t2 - t1
}

/* === ③ 防抖保存 === */
const draft = ref('')
const snapshotRef = shallowRef('')
const snapshot = snapshotRef // 模板直接读取
function saveDraft() {
  snapshotRef.value = draft.value
  // draft 是 ref, .value 已经是响应式的，但这里展示 triggerRef 用于非 ref 字段场景
  triggerRef(snapshotRef)
}
</script>

<style scoped>
.r24 { font-family: system-ui; padding: 1rem; }
.r24 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r24 button { margin-right: 0.4rem; }
.r24 textarea { width: 100%; box-sizing: border-box; }
</style>
