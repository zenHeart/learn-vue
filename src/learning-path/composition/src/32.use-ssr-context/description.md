> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/component.ts:550-560`

# `useSSRContext()`

## 这是什么

`useSSRContext()` 让 setup 内能识别当前是否处于 SSR 环境，并拿到 SSR 阶段的「全局上下文对象」。client 端调用返回 `undefined`。

```ts
import { useSSRContext } from 'vue'

const ssrCtx = useSSRContext()
if (ssrCtx) {
  // 服务端：可以读 ssrCtx.req / ssrCtx.res 等用户塞进去的对象
} else {
  // 客户端：跳过
}
```

服务端调用方通过 `renderToString(app, context)` 的第二参数注入上下文：

```ts
// entry-server.ts
import { renderToString } from 'vue/server-renderer'

export async function render(url, manifest) {
  const app = createSSRApp(App)
  const ctx = { url, req, manifest, user }   // 任意对象
  const html = await renderToString(app, ctx) // ctx 就是 setup 里 useSSRContext() 拿到的对象
  return { html }
}
```

`import.meta.client` / `import.meta.server`（3.5+）是更轻量的「二选一判断」——只关心环境、不需要传数据时用它。

## 源码走读

```ts
// packages/runtime-core/src/component.ts
export function useSSRContext<T = Record<string, any>>(): T | undefined {
  const instance = getCurrentInstance()
  if (!instance) return undefined
  return instance.appContext.provides[ssrContextKey] as T
}

// ssrContextKey 在 server-renderer 包中通过 app.provide() 注入：
// packages/server-renderer/src/render.ts
appContext.provides[ssrContextKey] = context
```

也就是说 `useSSRContext` 本质上是「读 ssrContextKey 这个特殊的 provide」。同一份组件在 client 调用时 `ssrContextKey` 没有被注入，返回 `undefined`。

## 实战场景

1. **请求级数据透传**：服务端读 `req.headers` 注入 ctx；组件中拿 token 决定显示什么。
2. **预渲染与动态 SSR 切换**：dev 时打 `useSSRContext()` 日志，看到 context 就知道是 ssr 模式。
3. **降级处理**：`const ctx = useSSRContext() ?? { url: '/' }`，让组件既能在 server 也能在 client 跑。
4. **`<script setup>` 中读取请求 URL**：`useRoute()` 在 SSR 下用不到；用 `useSSRContext()` 拿到 url 自己解析。

## 与 import.meta.client / server 的边界

| API | 关心什么 | 适合场景 |
|---|---|---|
| `useSSRContext()` | 是否在 SSR 阶段 + 拿数据 | 想读服务端塞进 ctx 的对象 |
| `import.meta.client` | 是否在客户端 | 编译期消除分支；推荐用于「确定不要跑」的纯副作用 |
| `import.meta.server` | 是否在服务端 | 同上 |
| `typeof window !== 'undefined'` | 是否在浏览器 | 兼容非 SSR 构建（不推荐，编译期不可消除） |

`import.meta.client/server` 由 Vite / Nuxt 等在编译时替换为字面量 `true` / `false`，死代码消除效果最好。

## 常见踩坑

- **`useSSRContext()` 在 client 永远返回 undefined**：不能用作「拿数据接口」。
- **不要把 ctx 当 store 用**：跨请求会共享，应放 request-scoped 字段。
- **hydration 后 ctx 失效**：setup 只跑一次，hydrate 后再调用 `useSSRContext` 仍然返回 undefined——不要在 watchEffect 里依赖它做副作用。
- **onMounted 在 SSR 下不会跑**：`onMounted` 内 `useSSRContext()` 永远是 undefined；要在 setup 顶层用。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://cn.vuejs.org/api/composition-api-helpers.html#usessrcontext) | API 文档 |
| [Vue 官方 SSR](https://cn.vuejs.org/guide/scaling-up/ssr.html) | renderToString 第二参数 |
| [Vue 源码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/component.ts) | `useSSRContext` 实现 |
| [Nuxt useRequestFetch](https://nuxt.com/docs/api/composables/use-request-fetch) | Nuxt 用 SSR ctx 做请求复用 |