> 版本: Vue 3.x | 源码: packages/runtime-core/src/scheduler.ts | 难度: 中等

# 09 · 调度器三队列与优先级

## 原理是什么

Vue 3 的 scheduler 内部维护三类队列：

- `queueJob`：组件渲染 effect 的待更新队列，按组件 uid 排序，确保父组件先于子组件更新；
- `queuePostFlushCb`：mounted/updated 这类 post 钩子、watch 的 post 回调、Suspense resolve；
- `queueEffectWithSuspense`：与 Suspense 异步依赖相关的特殊队列。

每次进入 scheduler 时，用 `isFlushPending` 标志位把多个 trigger 合并到一次 microtask flush；同一 job 多次入队会去重（用 Set 代替 Array）。

flush 时通过 `currentFlushIndex` 记录当前执行位置，处理组件更新时收集到的 post 回调会被推到下一轮执行，避免递归无限增长。

## 一步步走读源码

源码定位：

- `packages/runtime-core/src/scheduler.ts` 第 35-90 行：三个 queue + `add`、`flush` 状态机。
- 第 110-160 行：`queueJob` 的 dedup 与排序。
- 第 175-210 行：`queuePostFlushCb` 的"二次 flush"逻辑。

关键片段：

```ts
// scheduler.ts
const queue: SchedulerJob[] = []
const postFlushCbs: SchedulerCb[] = []
const pendingPostFlushCbs: SchedulerCb[] = []
let isFlushPending = false
let isFlushRunning = false
let currentFlushIndex = 0

export function queueJob(job) {
  // 1) 去重
  if (queue.indexOf(job) === -1) queue.push(job)
  // 2) 按组件 uid 排序（父先于子）
  queue.sort((a, b) => getId(a) - getId(b))
  // 3) 合并到一次 microtask
  if (!isFlushPending) {
    isFlushPending = true
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

function flushJobs() {
  isFlushPending = false
  isFlushRunning = true
  try {
    // 先 flush queue（组件更新）
    for (let i = 0; i < queue.length; i++) queue[i]()
    // 再 flush postFlushCbs（mounted 钩子等）
    for (let i = 0; i < postFlushCbs.length; i++) postFlushCbs[i]()
    reset()
  } finally {
    isFlushRunning = false
  }
}
```

## 为何这样设计

- **微任务合并**：多次同步修改只触发一次 flush，避免冗余渲染。
- **uid 排序**：父组件 props 变化时先更新父，子组件 props 自动获得最新值；更新方向是"自上而下"。
- **post 与 sync 分离**：render 阶段不执行副作用，把 mounted 这类需 DOM 就绪的钩子延后到 flush 末尾。

## 性能与权衡

- 同 job 多次入队去重：开销从 O(n) 降为 O(1)；
- 排序采用"插入排序"近似（uid 通常连续且单调），整体 O(n log n) 在最坏情况；
- 极端长队列（>1 万）：可以观察"按帧切片"成为优化方向。

## Vue 官方延伸阅读

- 官方文档 nextTick: <https://cn.vuejs.org/api/general.html#nexttick>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/scheduler.ts>

## 对应 RFC

RFC 177: Async Component Update（异步更新的内部契约）

## 延伸：可手写极简版本验证

demo `09.scheduler-priority/App/App.vue` 手写 queueJob / queuePostFlushCb / flushJobs，并在 UI 中显示队列状态、合并次数。

## 参考资料

- 《Vue.js 设计与实现》霍春阳，第 13 章「异步组件与函数式组件」、第 14 章「组件异步更新与 nextTick」
- 《Vue 技术揭秘》next-tick 篇 <https://ustbhuangyi.github.io/vue-analysis/extend/next-tick.html>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/scheduler.ts>

## 源码洞察（延伸阅读）

- [Vue 源码洞察：渲染器异步批处理：queueJob + flushJobs](_analysis/vue-source-insights.md#渲染器异步批处理queuejob--flushjobs) | `packages/runtime-core/src/scheduler.ts:62-67` 引用
- [Vue 源码洞察：watchEffect / watch 的调度时机](_analysis/vue-source-insights.md#watcheffectwatch的调度时机) | `packages/runtime-core/src/apiWatch.ts, scheduler.ts:88-117` 引用
