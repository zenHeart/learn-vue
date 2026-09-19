# nextTick 的 Promise API 与 DOM 更新顺序 {#next-tick-promise}

> **版本**：Vue 3.0+ | **状态**：stable | **源码**：`packages/runtime-core/src/scheduler.ts:56-87` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/general.html#nexttick)

`nextTick` 提供三种调用形态：

```ts
nextTick(() => { /* 回调形式 */ })             // Vue 2 风格
await nextTick()                                  // Promise 形式（推荐）
nextTick().then(() => { /* ... */ })              // then 链形式
```

它的语义是「把回调塞进 Vue 内部队列，等下一个微任务（microtask）统一执行」。这与 `Promise.resolve().then()`（独立微任务）、`requestAnimationFrame`（下一帧）的关系是：

- **nextTick** 跟随 Vue 的**批处理**时机：同一同步 tick 内多次数据变更只 flush 一次 DOM 更新。
- **queueMicrotask** 是独立的微任务，不感知 Vue 的批处理。
- **requestAnimationFrame** 跟帧率挂钩，约为 16ms。
- **`flushSync`** 跳过队列、立即同步 flush DOM —— 但会丢失批处理，慎用。

## 这是什么 {#what}

```ts
import { ref, nextTick } from 'vue'

const count = ref(0)

async function tick() {
  count.value++
  count.value++
  // 此时 DOM 还没更新（同步阶段）
  console.log(document.getElementById('n')?.textContent)  // 还是旧值
  await nextTick()
  // 现在 DOM 已经合并更新一次
  console.log(document.getElementById('n')?.textContent)  // 新值
}
```

## 源码走读 {#source}

```ts
// packages/runtime-core/src/scheduler.ts:56-87
export function nextTick<T = void>(fn?: () => T): Promise<T> {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(this ? fn.bind(this) : fn) : p
}

// resolvedPromise 在 queueJob 完成后被 resolve；同一 tick 内的多次 flush 共享同一个 Promise
let currentFlushPromise: Promise<void> | null = null
function queueJob(job) {
  if (!currentFlushPromise) currentFlushPromise = resolvedPromise.then(flushJobs)
  // ...
}
```

关键事实：

- 每次 flush 结束后 `currentFlushPromise` 被重置；下一次 `nextTick()` 拿到新 Promise。
- `nextTick(fn)` 等价于 `nextTick().then(fn)`，但写法更简洁。
- 当 `nextTick()` 的回调里继续改 ref，会重新排进队列 —— **递归更新**会自动拆批。

## 实战场景 {#production}

1. **数据更新后读 DOM**：v-for 改了 list，等 DOM 更新再 `getBoundingClientRect()` 拿新高度。
2. **第三方 DOM 库初始化**：等 Vue 把容器画好再调 `new Chart(el)`，避免拿到空容器。
3. **单元测试**：watchEffect 改完数据后 `await nextTick()` 再断言渲染结果。
4. **避免 race**：用户操作触发了异步数据回填，await + nextTick 保证视图稳定再触发下一个动作。

## 常见踩坑 {#pitfalls}

- **await nextTick 之后才生效**：如果你只写 `nextTick(fn)` 但忘了 `.then`，fn 不会立即执行；要么 `await` 要么用链式 then。
- **多次 await nextTick 不等价于一次 await**：每次 await 都是独立的「等下一轮 flush」；不要假设它们连续。
- **flushSync 不替代 nextTick**：`flushSync(fn)` 会同步执行 fn，但同时**破坏批处理**；下一行 await nextTick 又是新的一轮。
- **同步赋值后立刻读响应式值**：响应式值是即时更新的（DOM 不是）；不要把 nextTick 用作「等 ref 生效」。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/general.html#nexttick) | API 文档 |
| [Vue 源码 · scheduler.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/scheduler.ts) | nextTick + queueJob |
| [Vue 源码洞察：nextTick 微任务与 flush 队列](_analysis/vue-source-insights.md#nexttick-xxx) | 隐式经验 |
| [Vue 官方 · flushSync](https://vuejs.org/api/general.html#flushsync) | 同步 flush 的对照 |