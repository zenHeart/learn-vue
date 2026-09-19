> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/apiAsyncComponent.ts:48-269` | **延伸阅读**：[Vue 官方 · 异步组件](https://cn.vuejs.org/guide/components/async.html)

# `defineAsyncComponent` 三阶段：retry / delay / onError

## 这是什么

`defineAsyncComponent(source)` 接受两种 source：

1. **函数**：`defineAsyncComponent(() => import('./Comp.vue'))`
2. **对象**：`defineAsyncComponent({ loader, loadingComponent, errorComponent, delay, timeout, suspensible, onError })`

源码 `apiAsyncComponent.ts:48-269` 内部创建一个名为 `AsyncComponentWrapper` 的占位组件，通过 reactive refs 切换状态：

```ts
const loaded = ref(false)
const error = ref()
const delayed = ref(!!delay)

return () => {
  if (loaded.value && resolvedComp) {
    return createInnerComp(resolvedComp, instance)
  } else if (error.value && errorComponent) {
    return createVNode(errorComponent, { error: error.value })
  } else if (loadingComponent && !delayed.value) {
    return createInnerComp(loadingComponent, instance)
  }
  // 否则：返回 undefined（fallback 占位）
}
```

## 三阶段生命周期

| 阶段 | 触发 | 持续时间 |
|---|---|---|
| **delay** | 初始 0 → `delay` ms 后才显示 loadingComponent | 默认 200ms（避免快速 loader 闪烁） |
| **loading** | delay 后到 resolve / error / timeout 之间 | 由 loader 实际时间决定 |
| **error** | loader reject / timeout 超时 | 直到 onError 决定 retry / fail |

源码 `apiAsyncComponent.ts:215-233`：

```ts
if (delay) {
  delayTimer = setTimeout(() => {
    if (instance.isUnmounted) return
    delayed.value = false          // delay 期满，显示 loadingComponent
  }, delay)
}

if (timeout != null) {
  timeoutTimer = setTimeout(() => {
    if (instance.isUnmounted) return
    if (!loaded.value && !error.value) {
      const err = new Error(`Async component timed out after ${timeout}ms.`)
      onError(err)
      error.value = err
    }
  }, timeout)
}
```

## onError retry 机制

源码 `apiAsyncComponent.ts:70-93`：

```ts
let retries = 0
const retry = () => {
  retries++
  pendingRequest = null
  return load()
}

const load = () => {
  let thisRequest: Promise<ConcreteComponent>
  return (
    pendingRequest ||
    (thisRequest = pendingRequest =
      loader()
        .catch(err => {
          err = err instanceof Error ? err : new Error(String(err))
          if (userOnError) {
            return new Promise((resolve, reject) => {
              const userRetry = () => resolve(retry())
              const userFail = () => reject(err)
              userOnError(err, userRetry, userFail, retries + 1)
            })
          } else {
            throw err
          }
        })
        // ...
  )
}
```

`onError(err, retry, fail, attempts)` 用户可以：
- 调 `retry()` 重试（attempts 自增）
- 调 `fail()` 抛错（fallback 到 errorComponent 或 rethrow）
- 既不调 retry 也不调 fail：**Promise 永远 pending**——loader 卡死，需要外部 timeout。

## 与 `<Suspense>` 的边界

源码 `apiAsyncComponent.ts:184-201`：

```ts
if (
  (__FEATURE_SUSPENSE__ && suspensible && instance.suspense) ||
  (__SSR__ && isInSSRComponentSetup)
) {
  return load()
    .then(comp => () => createInnerComp(comp, instance))
    .catch(err => {
      onError(err)
      return () => errorComponent ? createVNode(errorComponent, { error: err }) : null
    })
}
```

**当外层有 `<Suspense>` 且 `suspensible: true`（默认）时**：跳过 loadingComponent 状态，直接走 `<Suspense>` 的 pending 机制。也就是说：

- 单层 `defineAsyncComponent` + loadingComponent：使用 loading 占位。
- 包在 `<Suspense>` 内：使用 Suspense fallback。
- `suspensible: false`：强制走 loadingComponent 路径，即使外层有 Suspense。

## 实战场景

1. **网络重试**：onError 内做指数退避重试（3 次后 fail）。
2. **Code splitting**：路由级 chunk 失败时回退到基础页面。
3. **错误监控**：在 onError 内上报 Sentry / 性能监控。
4. **SSR + Suspense**：服务端异步 setup() 的组件自动 await，无需手动 loading。

## 常见踩坑

- **timeout vs delay**：timeout 必须大于 delay，否则 timeout 触发时 loadingComponent 还没显示。
- **`loader` 必须是 Promise**：同步函数会被当 Promise.then，但同步 throw 的错误不会被捕获（`try/catch` 包裹 loader）。
- **`suspensible: false` 配合 `<Suspense>`**：loadingComponent 与 Suspense fallback 互斥；前者优先级更高。
- **retry() 无限循环**：onError 内如果不调 retry / fail，Promise 一直 pending；务必有 max attempts 限制。
- **chunk 失败（404）**：vite/webpack 默认 5 次失败后停止；onError 仅拦截 loader reject，不处理 HTTP 4xx / 5xx 重试。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · 异步组件](https://cn.vuejs.org/guide/components/async.html) | API 文档 |
| [Vue 官方 · Suspense](https://cn.vuejs.org/guide/built-ins/suspense.html) | 与 Suspense 协作 |
| [Vue 源码 · apiAsyncComponent.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiAsyncComponent.ts) | 完整实现 |
| [Vite · 动态 import 失败](https://vitejs.dev/guide/features.html#dynamic-import) | chunk 失败重试 |
| [RFC 35 · 异步组件](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0035-async-component-improvements.md) | 设计动机 |

<!-- description.md -->
