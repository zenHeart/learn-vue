# 调度器、队列与 flushSync {#scheduler-and-queue}

> 版本: Vue 3.x | RFC: 0001-composition-api | 状态: stable

Vue 的更新机制默认走**异步批处理**（batching）。当 `trigger` 被调用时，effect 不会立刻执行，而是被 push 进一个 `queue` 并通过 `Promise.resolve().then(flushJobs)`（由 `queueFlush()` 在 `scheduler.ts:119-123` 触发）合并到下一个 microtask 中执行。

这意味着：

```js
count.value = count.value + 1
count.value = count.value + 1
count.value = count.value + 1
// 同一个 tick 内多次写，只触发一次更新
```

## 关键 API {#key-apis}

- `flushSync(fn?)`：**强制同步刷新**调度队列，渲染也会同步完成。用于需要立即读 DOM 的场景（如测量布局后立即渲染）。
- `nextTick(cb?)`：等待下一次 DOM 更新后执行回调，返回 Promise。
- `queuePostFlushCb(cb)`：注册 post flush 回调，在所有 DOM patch 完成后执行。

## 调度优先级 {#priority}

Vue 内部维护三个队列：

1. **Pre 队列**（watch flush: 'pre'）：组件更新前。
2. **Component update 队列**：scheduler 调度 component rerender。
3. **Post 队列**（watch flush: 'post' + queuePostFlushCb）：组件更新后。

Post 队列在 DOM 更新之后才执行。

## 关键陷阱 {#pitfalls}

1. **`flushSync` 性能差**：每个调用会立即同步 flush，破坏批处理；只在"必须立刻读 DOM 写入"时使用。
2. **同步任务中的状态不可见**：`flushSync` 之前的 `ref.value = x` 是同步写入的；但若需要拿到 DOM 更新结果，必须在 `flushSync` 的回调内部读取。
3. **`nextTick` 是异步的**：在测试中需要 `await nextTick()` 才能看到 DOM 更新。
4. **scheduler 在 SSR 中被替换**：浏览器环境走 microtask；Node SSR 走 `setImmediate`。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · nextTick](https://vuejs.org/api/general.html#nexttick)
- [Vue 官方文档 · flushSync](https://vuejs.org/api/reactivity-core.html#flushsync)
- [Vue 官方文档 · 调度机制](https://vuejs.org/guide/extras/reactivity-in-depth.html#scheduling)
- [Vue 3 源码 · scheduler.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/scheduler.ts)
- [RFC 0001 Composition API](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0001-composition-api.md)
- [Vue 源码洞察：渲染器异步批处理：queueJob + flushJobs](_analysis/vue-source-insights.md#渲染器异步批处理queuejob--flushjobs) | `packages/runtime-core/src/scheduler.ts:56-67,99-117,119-123` 引用

<!-- description.md -->
