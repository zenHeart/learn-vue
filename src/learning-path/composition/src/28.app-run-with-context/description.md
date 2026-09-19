# app.runWithContext：跨边界 inject 工具函数 {#app-run-with-context}

> **版本**：Vue 3.3+ | **状态**：stable | **源码**：`packages/runtime-core/src/apiCreateApp.ts:470-485` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/application.html#app-runwithcontext) | [RFC 21](https://github.com/vuejs/rfcs/discussions/386)

`app.runWithContext(fn)` 让「**组件外的普通函数**」也能拿到 `inject()` 的能力。它把当前 `app.provide` 临时设为「活跃 provide」，然后调用 fn —— `fn` 内部任何 `inject(key)` 都会按正常路径解析。

适用场景：

1. **库作者**：composable 工具在用户组件外调用也能拿 provide。
2. **插件 install 钩子**：注册全局资源时立刻调用 provide。
3. **跨组件的 helper 函数**：不接收 props 参数，直接 inject。

## 这是什么 {#what}

```ts
const app = createApp(...)
app.provide('API_URL', 'https://api.example.com')

// 普通工具函数：组件外也能 inject
function fetchFromApi() {
  return app.runWithContext(() => {
    const url = inject('API_URL')
    return fetch(url + '/list')
  })
}
```

## 源码走读 {#source}

```ts
// packages/runtime-core/src/apiCreateApp.ts:470-485
runWithContext(fn) {
  const prevContext = currentApp
  currentApp = this
  try {
    return fn()
  } finally {
    currentApp = prevContext
  }
}

// inject.ts
export function inject(key, defaultValue, treatDefaultAsFactory) {
  const instance = currentInstance || currentApp._context  // 优先 instance，其次 currentApp
  // ...
}
```

关键事实：

- `inject` 内部 fallback：从 `currentInstance`（组件 setup）取不到时，从 `currentApp._context` 取。
- `runWithContext` 用 try/finally 保证还原；即使 fn 抛错也安全。
- **跨 await 边界失效**：await 之后再调用 `inject` 时 `currentInstance` 已经为 undefined；`runWithContext` 的 set/reset 也是同步的，await 后 `currentApp` 也被还原。

## 实战场景 {#production}

1. **库作者**：把 `useApi()` 写成 `function useApi() { return app.runWithContext(() => inject('api')) }`。
2. **动态 install 插件**：插件 install 期间注册全局资源，立刻被应用内任意组件 inject。
3. **跨 SSR 请求隔离**：每个 SSR 请求都新建一个 `createApp()`，自带新 `currentApp`；不同请求互不污染。

## 常见踩坑 {#pitfalls}

- **跨 await 边界失效**：await 之后 `currentApp` 已被 reset；要保留的话得在 await 之前把 `app.runWithContext` 包在另一个函数里、把函数调用推迟。
- **仅同步有效**：`runWithContext` 只在「同步函数栈」有效 —— 异步链里 `currentApp` 会回到调用前。
- **多应用场景**：每个 `createApp()` 的 `currentApp` 独立；做微前端时记得拿到对应子应用的 `app` 实例。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/application.html#app-runwithcontext) | API 文档 |
| [RFC 21](https://github.com/vuejs/rfcs/discussions/386) | runWithContext 设计讨论 |
| [Vue 源码 · apiCreateApp.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiCreateApp.ts) | 入口实现 |
| [Vue 源码洞察：currentApp 的生命周期与边界](_analysis/vue-source-insights.md#runwithcontext-xxx) | 隐式经验 |