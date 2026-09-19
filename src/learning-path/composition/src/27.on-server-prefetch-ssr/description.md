# onServerPrefetch 完整 SSR 数据预取 {#on-server-prefetch-ssr}

> **版本**：Vue 3.0+ | **状态**：stable | **源码**：`packages/runtime-core/src/apiLifecycle.ts:91-97` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/composition-api-lifecycle.html#onserverprefetch) | [Vue SSR 文档](https://vuejs.org/guide/scaling-up/ssr.html)

`onServerPrefetch(hook)` 用来注册**只在 SSR 期间**执行的异步数据预取 hook。它的语义是：

1. 仅在 `renderToString()` / `pipeToNodeWritable()` 期间被调用；客户端 `createApp` 不会触发。
2. 返回值是 Promise（函数体 async 或显式 `return promise`）；多个 hook 会并行执行。
3. 所有 hook resolve 之后，Vue 才把组件树渲染成 HTML —— 避免「数据回来再二次渲染」。

## 这是什么 {#what}

```ts
import { onServerPrefetch } from 'vue'

onServerPrefetch(async () => {
  const res = await fetch(`/api/user/${props.id}`)
  user.value = await res.json()
})
```

可以同时注册多个：

```ts
onServerPrefetch(async () => { /* 拉用户 */ })
onServerPrefetch(async () => { /* 拉权限 */ })
onServerPrefetch(async () => { /* 拉通知 */ })
// 三个并行；任何一个 reject 都会让组件挂掉（除非包 try/catch）
```

## 源码走读 {#source}

```ts
// packages/runtime-core/src/apiLifecycle.ts:91-97
export const onServerPrefetch: CreateHook = createHook(
  'sp',  // server-prefetch
  (hook, instance) => {
    const p = hook() as Promise<void> | void
    if (p && p.then) {
      // 把它挂到 instance.asyncPreFns 数组
      ;(instance.asyncResolved || (instance.serverPrefetchPromises ??= []))
      instance.serverPrefetchPromises.push(p as Promise<void>)
    }
  },
)
```

核心机制：

- 每个 `onServerPrefetch` 调用都会把返回的 Promise 推到 `instance.serverPrefetchPromises`。
- SSR renderer 用 `Promise.all(promises).then(() => render())` 串起「等待 → 渲染」。
- **hook 同步抛错会被 Promise reject**，从而中断整个 SSR 流程；要在 hook 内 `try/catch` 自己处理。

## 实战场景 {#production}

1. **首屏数据预取**：列表页 / 详情页在 SSR 期间拉数据，HTML 已经带上内容。
2. **多源并行**：`onServerPrefetch` 注册多次，对应后端多个独立接口。
3. **错误传播**：hook reject 会让 SSR 返回 500 状态 —— 要么自己 try/catch、要么配合 `<Suspense>` + fallback。
4. **避免客户端二次请求**：通过 `useState()` 把预取结果传到客户端，让客户端 hydrate 时跳过重复请求。

## 常见踩坑 {#pitfalls}

- **同步函数体也要返回 Promise**：写成 `onServerPrefetch(() => syncCall())` Vue 会忽略返回值；写成 async 或显式 return Promise 才会被等待。
- **hook 中调用 setTimeout / setInterval**：SSR 不会运行；浏览器才有，要用 composable 分开处理。
- **不要把 ref 写在外层模块**：会被多个 SSR 请求共享；要在 setup 内 ref() 局部创建。
- **错误处理**：未捕获 reject 会让整次 SSR 失败 —— 用 try/catch 兜底。
- **不能注册在 setup 外面**：`onServerPrefetch` 必须在 setup 同步阶段注册才会被收集。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/composition-api-lifecycle.html#onserverprefetch) | API 文档 |
| [Vue SSR 文档](https://vuejs.org/guide/scaling-up/ssr.html) | SSR 完整流程 |
| [Vue 源码 · apiLifecycle.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiLifecycle.ts) | createHook('sp', ...) |
| [Vue 源码洞察：SSR 数据预取的等待与错误传播](_analysis/vue-source-insights.md#onserverprefetch-xxx) | 隐式经验 |