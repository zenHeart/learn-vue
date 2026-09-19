<script setup lang="ts">
import { ref } from 'vue'

/* ============================================================
 * 极简 nextTick：Promise.resolve().then + currentFlushPromise 复用
 * 仿 packages/runtime-core/src/scheduler.ts
 * ============================================================ */

let currentFlushPromise: Promise<void> | null = null
const resolvedPromise = Promise.resolve()

const events = ref<string[]>([])
let t = 0
function now() { return ++t }
const log = (s: string) => events.value.unshift(`t=${now()} ${s}`)

function nextTick(fn?: () => void): Promise<void> {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(fn) : p
}

// 模拟调度器 flush
function triggerFlush(label: string) {
  if (currentFlushPromise) {
    log(`flush 已在进行中，${label} 附加到 currentFlushPromise`)
    return
  }
  currentFlushPromise = resolvedPromise.then(async () => {
    log(`>> flushJobs 开始（${label}）`)
    await Promise.resolve()  // 模拟一次微任务让出
    log(`<< flushJobs 结束（${label}）`)
    currentFlushPromise = null
  })
}

/* ============================================================
 * 演示
 * ============================================================ */

const counter = ref(0)

async function demoMerge() {
  events.value = []
  log('用户代码：连续改 3 次 state')
  counter.value++
  counter.value++
  counter.value++
  log('调用 nextTick(cb1)、nextTick(cb2)、nextTick(cb3)')
  nextTick(() => log('  cb1: DOM 已刷新，DOM-Text = ' + counter.value))
  nextTick(() => log('  cb2: 再次读取 counter = ' + counter.value))
  nextTick(() => log('  cb3: 仍读到同一份最终值 = ' + counter.value))
  triggerFlush('render')
}

async function demoAwait() {
  events.value = []
  log('await nextTick() 等到更新完成')
  counter.value = 100
  await nextTick()
  log('await 完成后 counter = ' + counter.value)
}

async function demoCoalesce() {
  events.value = []
  log('用户在多次 setTimeout 里调用 nextTick')
  setTimeout(() => {
    counter.value = 1
    nextTick(() => log('  setTimeout1 里的 cb 执行'))
    triggerFlush('setTimeout1')
  }, 0)
  setTimeout(() => {
    counter.value = 2
    nextTick(() => log('  setTimeout2 里的 cb 执行'))
    triggerFlush('setTimeout2')
  }, 0)
}

function clear() { events.value = [] }
</script>

<template>
  <div class="nexttick-demo">
    <h3>10 · nextTick 微任务</h3>

    <div class="row">
      <button @click="demoMerge">A · 多次修改合并更新</button>
      <button @click="demoAwait">B · await nextTick</button>
      <button @click="demoCoalesce">C · 跨 tick 复用 promise</button>
      <button @click="clear">清空</button>
      <span>counter = {{ counter }}</span>
    </div>

    <div class="hint">
      关键观察：① 同步代码里多次 nextTick 合并到一次微任务；② 同一 flush 内 DOM 只重渲染一次；③ 跨 setTimeout 触发新一轮 flush。
    </div>

    <section>
      <h4>nextTick trace</h4>
      <ul class="log">
        <li v-for="(l, i) in events.slice(0, 40)" :key="i">{{ l }}</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.nexttick-demo { padding: 1rem; font-family: 'JetBrains Mono', monospace; }
.row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; margin-bottom: .75rem; }
button { padding: .35rem .8rem; border: 1px solid #888; background: #fff; border-radius: 4px; cursor: pointer; }
.hint { font-size: .8rem; color: #555; background: #fffbe6; padding: .5rem .75rem; border-radius: 4px; margin-bottom: 1rem; }
section { background: #fafafa; padding: .75rem; border-radius: 6px; }
section h4 { margin: 0 0 .5rem; font-size: .9rem; }
.log { max-height: 360px; overflow: auto; font-size: .78rem; padding-left: 1rem; }
</style>
