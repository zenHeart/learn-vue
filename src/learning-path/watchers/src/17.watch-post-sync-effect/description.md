# watchPostEffect / watchSyncEffect 与 watchEffect flush 对比 {#watch-post-sync-effect}

> **版本**：Vue 3.5+ | **状态**：stable | **源码**：`packages/runtime-core/src/apiWatch.ts:63-86` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/reactivity-watch.html#watchposteffect) | [Vue 官方 · watchSyncEffect](https://vuejs.org/api/reactivity-watch.html#watchsynceffect)

`watchPostEffect(fn)` 与 `watchSyncEffect(fn)` 是 3.5 引入的两个语义糖：分别等价于 `watchEffect(fn, { flush: 'post' })` 与 `watchEffect(fn, { flush: 'sync' })`。

- **`watchEffect`** 默认 `flush: 'pre'`：组件更新前调度，可拿到旧 DOM。
- **`watchPostEffect`**：`flush: 'post'` —— 组件更新**后**调度，DOM 已更新完。
- **`watchSyncEffect`**：`flush: 'sync'` —— 依赖变化**同步**触发 fn（无调度）。

## 这是什么 {#what}

```ts
import { ref, watchEffect, watchPostEffect, watchSyncEffect } from 'vue'

const count = ref(0)

watchEffect(() => { console.log('[pre]', count.value) })      // pre flush
watchPostEffect(() => { console.log('[post]', count.value) })  // post flush
watchSyncEffect(() => { console.log('[sync]', count.value) })  // sync flush

count.value++
// 输出顺序：sync → pre → post
```

## 源码走读 {#source}

```ts
// packages/runtime-core/src/apiWatch.ts:63-86
export function watchPostEffect(cb, options) {
  return doWatch(cb, null, __DEV__ ? assign({}, options, { flush: 'post' }) : options)
}
export function watchSyncEffect(cb, options) {
  return doWatch(cb, null, __DEV__ ? assign({}, options, { flush: 'sync' }) : options)
}
```

关键事实：

- 三者都是 `doWatch` 之上的一层薄包装；行为差异完全来自 `flush` 选项。
- `flush: 'pre'`：依赖触发后被推到 `scheduler` 队列，等「组件渲染前」批量 flush。
- `flush: 'post'`：被推到 `queuePostFlushCb`，等「DOM 更新完成后」执行。
- `flush: 'sync'`：**直接调用 cb**，不走任何调度 —— 同步触发会让组件渲染前出现 N 次函数调用，性能损耗大。

## 实战场景 {#production}

1. **DOM 测量**：`watchPostEffect` 在「DOM 已经渲染」之后读 `getBoundingClientRect()`，拿到的是最新值。
2. **第三方库同步初始化**：要在 ref 变化后立刻调 `chart.setOption(...)`，且不想被批处理合并 —— 用 `watchSyncEffect`。
3. **预先计算**：`watchEffect` 默认在组件渲染前跑，可以在 render 之前把派生值塞到 ref；模板拿到的就是新值。
4. **调试时序**：用三种 flush 各注册一个回调，打印顺序就能看到「同步 → 渲染前 → 渲染后」的全链路。

## 常见踩坑 {#pitfalls}

- **`watchSyncEffect` 会破坏响应式批处理**：依赖的多次同步赋值会**多次**触发 cb，而不是合并成一次。
- **`watchPostEffect` 拿不到模板最新 ref？**：它跑在 DOM 更新之后，但 ref 本身永远是新的 —— 拿 ref.value 没有「旧 vs 新」问题。
- **`pre` + `post` 不能同时跑出循环**：同一个 ref 在 pre flush 里改了另一个 ref，post flush 不会被再触发（除非 dep 链变化）。
- **`flush: 'sync'` 性能损耗大**：10000 个 ref 一次性赋值会让 cb 同步跑 10000 次 —— 仅在必须时使用。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/reactivity-watch.html#watchposteffect) | API 文档 |
| [Vue 官方](https://vuejs.org/api/reactivity-watch.html#watchsynceffect) | watchSyncEffect 文档 |
| [Vue 源码 · apiWatch.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiWatch.ts) | doWatch 与 flush 选项 |
| [Vue 源码洞察：watch flush 三态与调度器](_analysis/vue-source-insights.md#watch-flush-xxx) | 隐式经验 |