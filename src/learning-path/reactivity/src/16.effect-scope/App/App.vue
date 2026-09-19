<template>
  <section class="r16">
    <h2>effectScope：副作用作用域管理</h2>

    <div class="card">
      <h3>① 派生状态 scope：可整体丢弃</h3>
      <p>base: {{ base }}</p>
      <p>derived: {{ derived.label }} (count={{ derived.count }})</p>
      <button @click="base++">base++</button>
      <button @click="dispose">丢弃派生 scope</button>
      <p>scope 已 stop？ {{ String(isStopped) }}</p>
    </div>

    <div class="card">
      <h3>② detached scope：脱离组件 scope</h3>
      <p>独立 counter: {{ independent }}</p>
      <button @click="independent.value++">独立 counter++</button>
    </div>

    <div class="card">
      <h3>③ onScopeDispose 清理回调</h3>
      <pre>{{ cleanupLog }}</pre>
      <button @click="dispose">dispose</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, effectScope, onScopeDispose, computed } from 'vue'

const base = ref(1)

/* === ① 普通 scope：派生状态 === */
let scope = effectScope()
let isStopped = ref(false)
let derived!: { label: string; count: number }
let _labelRef = ref('')

scope.run(() => {
  const labelRef = computed(() => `derived-${base.value}`)
  const countRef = computed(() => base.value * 10)
  derived = {
    get label() { return labelRef.value },
    get count() { return countRef.value }
  }
  // 同步注册清理
  onScopeDispose(() => {
    isStopped.value = true
  })
})

function dispose() {
  scope.stop()
  // 重新创建以便继续演示
  scope = effectScope()
  isStopped.value = false
  scope.run(() => {
    const labelRef = computed(() => `derived-${base.value}`)
    const countRef = computed(() => base.value * 10)
    derived = {
      get label() { return labelRef.value },
      get count() { return countRef.value }
    }
    onScopeDispose(() => { isStopped.value = true })
  })
}

/* === ② detached scope：脱离父组件 === */
const detached = effectScope(true)
let ind = ref(0)
detached.run(() => {
  // 不注册清理函数，因此 detach 永远不会被自动 stop
})
function getInd() { return ind.value }
const independent = computed({
  get: () => ind.value,
  set: v => { ind.value = v }
})

/* === ③ 清理回调日志 === */
const cleanupLog = ref('')
const logScope = effectScope()
logScope.run(() => {
  onScopeDispose(() => { cleanupLog.value += '| sync dispose 1' })
  Promise.resolve().then(() => {
    // 异步调用会被忽略（在 onScopeDispose 同步阶段已被收集过）
  })
})
// 复用上面的 dispose 按钮统一演示
function resetLog() { cleanupLog.value = '' }
function disposeAndLog() {
  logScope.stop()
}
</script>

<style scoped>
.r16 { font-family: system-ui; padding: 1rem; }
.r16 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r16 button { margin-right: 0.4rem; }
.r16 pre { background: #f6f8fa; padding: 0.4rem; font-size: 12px; }
</style>
