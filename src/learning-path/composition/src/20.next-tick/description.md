# nextTick：等待 DOM 更新 {#next-tick}

> 版本: Vue 3.0+ | 状态: stable

`nextTick(cb?)` 返回 `Promise<void>`，让你在**响应式状态变更触发的 DOM 更新完成之后**执行回调。

## 为什么需要它 {#why}

Vue 默认**异步批处理** DOM 更新。在同一 tick 内多次修改响应式状态只会触发**一次**渲染。如果你在同步代码里改了状态、立刻读 DOM，看到的还是旧值。

```ts
count.value++                // 同步修改
console.log(document.querySelector('.count').textContent)  // 旧值！
await nextTick()             // 等下一次微任务
console.log(document.querySelector('.count').textContent)  // 新值
```

## 实现机制 {#mechanism}

- Vue 把渲染任务放入 `queueJob`，然后 `Promise.resolve().then(flushJobs)` 进入微任务。
- `nextTick` 内部其实就是 `Promise.resolve().then(fn)` 链 —— 但它和 Vue 的渲染 flushJob 共享同一个微任务队列，所以顺序确定：先用户 cb，后渲染。

## 实战场景 {#production}

1. **修改状态后立即读 DOM**：表单校验、滚动到底部、聚焦输入。
2. **外部库集成**：ECharts 在容器尺寸变化后需要 resize。
3. **测试断言**：vue-test-utils `await wrapper.vm.$nextTick()` 后再断言 DOM。

## 关键陷阱 {#pitfalls}

1. **不要在 setup 顶层直接 `await nextTick()`**：会挂起 setup 执行、组件无法挂载。
2. **`nextTick()` 返回的 Promise 会在下一个渲染 tick 后 resolve**，但同一 tick 内多次 await 会**复用同一个 Promise**——保证只 flush 一次。
3. **`flush: 'post'` 的 watcher 已自动在更新后跑**，大多数场景下不需要 nextTick + watch。
4. **不要用 `setTimeout(cb, 0)` 代替**：渲染 flush 走微任务，`setTimeout` 是宏任务，**晚一拍**。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · nextTick](https://vuejs.org/api/general.html#nexttick)
- [Vue 3 源码 · scheduler.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/scheduler.ts)
- [Vue 官方 · 异步更新队列](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#dom-update-timing)

<!-- description.md -->
