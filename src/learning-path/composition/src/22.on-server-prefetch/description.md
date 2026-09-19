# onServerPrefetch：SSR 数据预取 {#on-server-prefetch}

> 版本: Vue 3.0+ | RFC: 0026-suspense | 状态: stable

`onServerPrefetch(cb)` 在**服务端渲染**期间等待异步数据就绪后才把组件树序列化到 HTML。它是 SSR `<Suspense>` 协议的客户端之一：

1. 服务端遍历组件树时收集所有 `onServerPrefetch` 注册的回调，**并行**调用它们。
2. 所有回调都 resolve 后，组件树才被渲染成 HTML 字符串。
3. 客户端 hydrate 时，由于 HTML 已含数据，组件直接挂载而**不再触发** `onServerPrefetch`。

## API 签名 {#signature}

```ts
onServerPrefetch(async () => {
  const data = await fetch('/api/user').then(r => r.json())
  user.value = data
})
```

- 回调**必须是 async 函数或返回 Promise**。
- **抛错会被 SSR 框架捕获并向上抛**，可能导致整个请求渲染失败。

## 实战场景 {#production}

- **首屏数据预取**：组件挂载就需要的数据。
- **缓存层共享**：与 SWR / Redis 集成避免重复请求。
- **依赖并行**：多个 `onServerPrefetch` 自动并发，无需手动 `Promise.all`。

## 关键陷阱 {#pitfalls}

1. **客户端不会执行** —— 即使没有 SSR 环境，Vue 会静默忽略，所以代码可以原样写到客户端组件里。
2. **回调必须是异步**：同步函数 Vue 会 warning。
3. **不要在回调里修改会引发无限循环的 ref**：例如 `useFetch` 之间互相 trigger。
4. **顶层 await + onServerPrefetch 区别**：
   - 顶层 await 让 Suspense 等该组件本身的 setup 完成。
   - `onServerPrefetch` 是为同一组件（或子组件）抓取数据，挂在 `setup` 之后。
5. **错误处理**：SSR 框架（如 Nuxt）会把 onServerPrefetch reject 当 500 处理；可在回调内 try/catch + 渲染降级 UI。

## 配合 Suspense {#with-suspense}

```vue
<template>
  <Suspense>
    <UserProfile />
    <template #fallback>
      <Skeleton />
    </template>
  </Suspense>
</template>
```

`<UserProfile>` 内部 `onServerPrefetch` 期间 Suspense 显示 Skeleton；resolve 后渲染真实内容。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · onServerPrefetch](https://vuejs.org/api/composition-api-lifecycle.html#onserverprefetch)
- [Vue 官方文档 · SSR](https://vuejs.org/guide/scaling-up/ssr.html)
- [Vue 3 源码 · serverPrefetch 钩子](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiLifecycle.ts)
- [RFC 0026 Suspense](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0026-suspense.md)

<!-- description.md -->
