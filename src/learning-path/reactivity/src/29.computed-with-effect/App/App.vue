<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 默认 effect：直接订阅 computed</h4>
      <p>a = {{ a }}, b = {{ b }}, sum = {{ sum }}</p>
      <p>默认 effect 触发次数: <strong>{{ defaultRuns }}</strong></p>
      <button @click="incA">a++</button>
      <button @click="incB">b++</button>
      <p class="hint">默认 effect 创建时立刻跑一次 + 依赖变化时重跑，与 watchEffect 行为对齐</p>
    </section>

    <section class="card">
      <h4>② lazy effect：按需触发，不立刻跑</h4>
      <p>lazyValue = <code>{{ lazyValue ?? 'null（未主动调用 runner）' }}</code></p>
      <p>手动触发次数: <strong>{{ manualRuns }}</strong></p>
      <button @click="callLazy">调用 runner()</button>
      <button @click="incSource">source++</button>
      <p class="hint">lazy effect 不会自动跑，只有显式调用 runner 时才执行；调用后依赖已订阅，ref 变化自动重跑</p>
    </section>

    <section class="card">
      <h4>③ 自定义 scheduler：把响应式变化路由给第三方 API</h4>
      <p>第三方调用次数: <strong>{{ thirdPartyCalls }}</strong></p>
      <p>最近一次参数: <code>{{ lastArgs }}</code></p>
      <button @click="updateExternal">批量更新两个 ref</button>
      <pre>{{ thirdPartyLog }}</pre>
      <p class="hint">多次同步改动在 scheduler 内部 coalesce 成单次 setOption，符合图表库惯例</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, effect, onScopeDispose, getCurrentScope } from 'vue'

const title = ref('effect 直接读取 computed + 自定义 scheduler')

/* === ① 默认 effect === */
const a = ref(1)
const b = ref(2)
const sum = computed(() => a.value + b.value)

const defaultRuns = ref(0)
const stopDefault = effect(() => {
  defaultRuns.value++
  console.log('[default effect]', sum.value)
})
if (getCurrentScope()) onScopeDispose(() => stopDefault.effect.stop())

const incA = () => a.value++
const incB = () => b.value++

/* === ② lazy effect === */
const source = ref(1)
const lazyValue = ref<number | null>(null)
const manualRuns = ref(0)
const lazyRunner = effect(
  () => {
    manualRuns.value++
    lazyValue.value = source.value * 10
    return lazyValue.value
  },
  { lazy: true },
)
const callLazy = () => lazyRunner()
const incSource = () => source.value++

/* === ③ 自定义 scheduler === */
const width = ref(100)
const height = ref(50)
const thirdPartyCalls = ref(0)
const lastArgs = ref('—')
const thirdPartyLog = ref('')

const schedulerEffect = effect(
  () => ({ w: width.value, h: height.value }),
  {
    scheduler() {
      // 同一 tick 内多次 schedule 合并成单次
      if (schedulerEffect._pending) return
      schedulerEffect._pending = true
      queueMicrotask(() => {
        schedulerEffect._pending = false
        thirdPartyCalls.value++
        const args = { w: width.value, h: height.value }
        lastArgs.value = JSON.stringify(args)
        thirdPartyLog.value += `chart.setOption(${lastArgs.value})\n`
      })
    },
  } as any,
)
schedulerEffect()
if (getCurrentScope()) onScopeDispose(() => (schedulerEffect as any).effect.stop())

const updateExternal = () => {
  width.value += 10
  height.value += 5
  width.value += 10 // 同一 tick 内多次改动 → 合并成 1 次 setOption
  height.value += 5
}
</script>

<style scoped>
.demo {
  max-width: 780px;
  margin: 16px auto;
  padding: 16px;
  color: #213547;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.card {
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #1e293b;
}
.hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: #64748b;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 6px;
}
pre {
  margin-top: 6px;
  padding: 8px;
  background: #0f172a;
  color: #f8fafc;
  border-radius: 4px;
  font-size: 12px;
  max-height: 180px;
  overflow-y: auto;
  white-space: pre-wrap;
}
</style>