> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-dom/src/modules/events.ts:34-152` | **延伸阅读**：[Vue 官方 · 事件处理](https://cn.vuejs.org/guide/essentials/event-handling.html)

# 事件 handler 缓存：`_vts` 时间戳 + `invoker.attached`

## 这是什么

Vue 3 在元素上挂载事件监听器时，**不会**直接把用户写的 inline 函数当 listener——而是包装成一个 `invoker` 函数：

源码 `events.ts:95-152`：

```ts
function createInvoker(initialValue, instance) {
  const invoker: Invoker = (e: Event & { _vts?: number }) => {
    // 解决 vuejs/vue#6566：异步递归触发导致 handler 被多次调用
    if (!e._vts) {
      e._vts = Date.now()    // 第一次到达：盖时间戳
    } else if (e._vts <= invoker.attached) {
      return                  // 事件来自更早 attach 之前：忽略
    }
    const value = invoker.value   // ← 关键：每次读最新 value
    // ... 调用 value.call(...)
  }
  invoker.value = initialValue
  invoker.attached = getNow()
  return invoker
}
```

`events.ts:46-50`（patch 时）：

```ts
if (nextValue && existingInvoker) {
  existingInvoker.value = sanitizeEventValue(nextValue, rawName)
}
```

也就是说：

1. **DOM 上始终是同一个 invoker 函数引用**（不重新 `addEventListener`）。
2. **`invoker.value` 是可变的**：组件 re-render 时只更新 `invoker.value`，不需要 remove + addEventListener。
3. **`invoker.attached` 记录 attach 时刻**：解决 vuejs/vue#6566——异步派发的事件如果触发 patch，导致 handler 在 attached 之前已被 dispatch，第二次不会再触发。

## 缓存 getNow 的实现（events.ts:90-93）

```ts
let cachedNow: number = 0
const p = Promise.resolve()
const getNow = () =>
  cachedNow || (p.then(() => (cachedNow = 0)), (cachedNow = Date.now()))
```

微任务里重置 `cachedNow`——同一 tick 内多次 createInvoker 共享一个时间戳。

## 实战场景

1. **避免 removeEventListener / addEventListener**：组件每次 re-render 不会导致 listener 抖动。
2. **异步递归更新**：用 ref 拿 DOM 直接 `el.dispatchEvent(new Event('click'))`，handler 只会触发一次（attached 守卫）。
3. **handler 内 inline 函数 vs 函数引用**：都通过 invoker 包一层，差别只在于 invoker.value 是否每次重建——但函数引用开销更低（可被 GC）。

## 常见踩坑

- **DOM 上看 .onclick 永远是 invoker**，不是用户函数。debug 时要从 invoker.value 反推。
- **多个组件实例绑同一元素**：每个组件的 listener 独立 invoker；共用元素时各自 invoke 各自 instance。
- **数组 handler `e.stopImmediatePropagation`**：`@click="[a, b]"` 时按顺序调用，前一个 stop 后续跳过。
- **`_vts` 跨 iframe 时钟漂移**：原生事件 `e.timeStamp` 不能信任，所以 Vue 用 `Date.now()` 自盖时间戳。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · 事件处理](https://cn.vuejs.org/guide/essentials/event-handling.html) | 基础用法 |
| [Vue 源码 · events.ts](https://github.com/vuejs/core/blob/main/packages/runtime-dom/src/modules/events.ts) | 完整实现 |
| [Issue #6566](https://github.com/vuejs/vue/issues/6566) | invoker.attached 的诞生原因 |
| [Vue 源码 · vOn.ts](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/vOn.ts) | compiler-side cacheHandlers 优化 |

<!-- description.md -->
