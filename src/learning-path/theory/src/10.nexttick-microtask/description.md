> 版本: Vue 3.x | 源码: packages/runtime-core/src/scheduler.ts | 难度: 中等

# 10 · nextTick 的浏览器兼容性策略

## 原理是什么

`nextTick(callback)` 把回调压入 postFlushCbs，并通过一个 Promise.resolve().then() 进入微任务队列。Vue 3.x 选择微任务而非 setTimeout 的核心原因：用户代码里"修改数据 → nextTick(callback → 读取 DOM)"是一个常见模式，微任务在当前 task 结束后立即执行，比 setTimeout(fn, 0) 早一个事件循环 tick，从而更快得到更新后的 DOM。

但 `Promise.resolve().then` 在老 IE 不可用，因此 Vue 源码内部用 `getPromiseResolve` 做能力探测：

```ts
const resolvedPromise = /*#__PURE__*/ Promise.resolve()
let currentFlushPromise: Promise<void> | null = null

export function nextTick(fn?: () => void) {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(this ? fn.bind(this) : fn) : p
}
```

对不支持 Promise 的环境（理论），Vue 2.x 时代曾 fallback 到 MessageChannel 或 setTimeout；Vue 3.x 因为放弃 IE，最低支持到 ES2015 浏览器，Promise.resolve 通用可用。

## 一步步走读源码

源码定位：

- `packages/runtime-core/src/scheduler.ts` 第 280-330 行：`nextTick` 实现。
- `packages/shared/src/general.ts` 第 14-22 行：`getPromiseResolve` 工具（Vue 2.x 时期）。

关键片段：

```ts
// scheduler.ts
export function nextTick<T = void>(
  this: T,
  fn?: () => void
): Promise<void> {
  const p = currentFlushPromise || resolvedPromise
  return fn
    ? p.then(this ? fn.bind(this) : fn)
    : p
}

// Vue 2.x 兼容写法（保留在 general.ts 中以理解历史）
let pResolve: Promise<any> | null = null
let pReject: Promise<any> | null = null
const resolvedPromise: Promise<any> = new Promise((resolve, reject) => {
  pResolve = resolve
  pReject = reject
})
function flushCallbacks() { pResolve!() }
// 如果环境不支持 Promise，则 fallback 到 MessageChannel
if (typeof Promise !== 'function') {
  const channel = new MessageChannel()
  channel.port1.onmessage = flushCallbacks
  // 把 flushCallbacks 注册到 channel
}
```

## 为何这样设计

- **微任务优先**：DOM 更新属于"用户可观察"的事件，微任务 flush 后立即得到最新 DOM，体验更好。
- **currentFlushPromise 复用**：当调度器正在 flush 时调用 nextTick，回调会附加在当前 flush 的 promise 上；flush 结束后才 resolve，行为可预测。
- **能力探测 + fallback**：Vue 2 时期要支持 IE，Vue 3 时期可以放心用 Promise。

## 性能与权衡

- 微任务开销 < 0.1ms，几乎无成本；
- 若回调里做重计算（同步阻塞），会卡住当前 task；建议分批；
- 与 setTimeout(0) 比较：setTimeout 至少 4ms 延迟（浏览器最小间隔），微任务即时。

## Vue 官方延伸阅读

- 官方文档: <https://cn.vuejs.org/api/general.html#nexttick>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/scheduler.ts>

## 对应 RFC

无单独 RFC，作为 scheduler 的对外接口存在。

## 延伸：可手写极简版本验证

demo `10.nexttick-microtask/App/App.vue` 演示连续多次 nextTick 调用会按顺序合并到当前 flush 的同一个微任务。

## 参考资料

- 《Vue.js 设计与实现》霍春阳，第 14 章「组件异步更新与 nextTick」
- 《Vue 技术揭秘》next-tick 篇 <https://ustbhuangyi.github.io/vue-analysis/extend/next-tick.html>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/scheduler.ts>

## 源码洞察（延伸阅读）

- [Vue 源码洞察：渲染器异步批处理：queueJob + flushJobs](_analysis/vue-source-insights.md#渲染器异步批处理queuejob--flushjobs) | `packages/runtime-core/src/scheduler.ts:62-67` 引用
