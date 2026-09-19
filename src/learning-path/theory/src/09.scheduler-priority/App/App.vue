<script setup lang="ts">
import { ref } from 'vue'

/* ============================================================
 * 极简调度器：queueJob / queuePostFlushCb / dedup
 * 仿 packages/runtime-core/src/scheduler.ts
 * ============================================================ */

type Job = { id: string; uid: number; fn: () => void }

const queue: Job[] = []
const postCbs: (() => void)[] = []
let isFlushPending = false
let isFlushRunning = false

const events = ref<string[]>([])
let step = 0
const log = (s: string) => events.value.unshift(`#${++step} ${s}`)

function queueJob(job: Job) {
  if (queue.indexOf(job) === -1) {
    queue.push(job)
    // uid 升序：父先于子
    queue.sort((a, b) => a.uid - b.uid)
    log(`queueJob(${job.id}) -> 队列 ${queue.map(j => j.id).join('|')}`)
  } else {
    log(`queueJob(${job.id}) -> 已存在，跳过（去重）`)
  }
  if (!isFlushPending) {
    isFlushPending = true
    Promise.resolve().then(flushJobs)
  }
}

function queuePostFlushCb(cb: () => void) {
  postCbs.push(cb)
  log(`queuePostFlushCb -> 计数 ${postCbs.length}`)
  if (!isFlushPending) {
    isFlushPending = true
    Promise.resolve().then(flushJobs)
  }
}

function flushJobs() {
  isFlushPending = false
  isFlushRunning = true
  try {
    log('--- flushJobs 开始 ---')
    for (const job of queue) job.fn()
    queue.length = 0
    log('--- 切到 postFlushCbs ---')
    const cbs = postCbs.splice(0)
    for (const cb of cbs) cb()
    log('--- flushJobs 完成 ---')
  } finally {
    isFlushRunning = false
  }
}

/* ============================================================
 * 演示
 * ============================================================ */

const renderCount = ref(0)

function rerender(componentId: string) {
  queueJob({
    id: componentId,
    uid: Number(componentId.split('-')[1]) || 0,
    fn: () => {
      renderCount.value++
      log(`render: ${componentId}（count=${renderCount.value}）`)
    }
  })
}

function queueMounted(label: string) {
  queuePostFlushCb(() => log(`mounted/post cb: ${label}`))
}

// 场景 1：同一同步代码里多次修改
function burst() {
  log('>>> 同步连续修改：rerender C-3、C-1、C-2、C-1')
  rerender('C-3')
  rerender('C-1')
  rerender('C-2')
  rerender('C-1') // 重复
  // flush 之后才看到结果
}

// 场景 2：混合 mounted + render
function burstWithMount() {
  log('>>> 混合 render + mounted')
  rerender('P-1')
  queueMounted('Root mounted')
  rerender('C-2')
  queueMounted('Child mounted')
  rerender('C-2') // 重复
}

function clear() { events.value = [] }
</script>

<template>
  <div class="sched-demo">
    <h3>09 · 调度器三队列</h3>

    <div class="row">
      <button @click="burst">场景 A：连续修改 4 次（含重复）</button>
      <button @click="burstWithMount">场景 B：render + mounted 混合</button>
      <button @click="clear">清空日志</button>
      <span>累计 render: {{ renderCount }}</span>
    </div>

    <div class="hint">
      关键观察：① 同步代码内的多次 trigger 只 flush 一次；② 同一 job 重复入队被去重；③ 按 uid 排序；④ mounted 钩子在 render 之后才执行。
    </div>

    <section>
      <h4>scheduler trace</h4>
      <ul class="log">
        <li v-for="(l, i) in events.slice(0, 40)" :key="i">{{ l }}</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.sched-demo { padding: 1rem; font-family: 'JetBrains Mono', monospace; }
.row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; margin-bottom: .75rem; }
button { padding: .35rem .8rem; border: 1px solid #888; background: #fff; border-radius: 4px; cursor: pointer; }
.hint { font-size: .8rem; color: #555; background: #fffbe6; padding: .5rem .75rem; border-radius: 4px; margin-bottom: 1rem; }
section { background: #fafafa; padding: .75rem; border-radius: 6px; }
section h4 { margin: 0 0 .5rem; font-size: .9rem; }
.log { max-height: 360px; overflow: auto; font-size: .78rem; padding-left: 1rem; }
</style>
