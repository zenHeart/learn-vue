> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-dom/src/index.ts:34` | **延伸阅读**：[Vue 官方 SSR](https://cn.vuejs.org/guide/scaling-up/ssr.html)

# `createSSRApp` 与 createApp 的边界

## 这是什么

`createSSRApp` 是 `createApp` 的「SSR 友好版」：

```ts
// packages/runtime-dom/src/index.ts:34
export const createSSRApp = ((...args) => {
  const app = createApp(...args)
  // SSR 场景下不走 client mount；只用于把组件树渲染成字符串
  return app
}) as typeof createApp
```

**两者运行时几乎一致**——底层都创建 `App`、注册 plugin、跑 setup。真正的差别在**调用方**：

- `createApp(App).mount('#app')` → 客户端挂载到 DOM
- `createSSRApp(App)` + `renderToString(app)` → 服务端输出 HTML 字符串
- 同一份 `App.vue` 在两者下都能跑；区别只在于**触发场景**与**需要规避的副作用**

`isCustomElement` 选项在两种场景下都生效——它告诉 Vue「遇到这个标签不要尝试当作组件解析」，用于适配 Web Components（如 `<my-chart>`、`<el-button>` 在 SSR 下不会被误解析）。

```ts
const app = (
  import.meta.env.SSR
    ? createSSRApp(App)
    : createApp(App)
)

// 自定义元素：标记后 SSR 不会包 data-v-xxx、不解析成组件
app.config.compilerOptions.isCustomElement = (tag) =>
  tag.startsWith('my-') || tag === 'md-icon'
```

## 源码走读

```ts
// packages/runtime-dom/src/index.ts
export const createApp = ((...args) => createApp(...args))
export const createSSRApp = ((...args) => {
  const app = createApp(...args)         // 走 createApp 完全相同的逻辑
  return app
})

// 关键在 @vue/runtime-core 的 hydrate 流程：
// createApp().mount() 走 client mount 路径（render → patch 到空 DOM）
// createSSRApp() + hydrate() 在已有 DOM 上做「水合」
```

## SSR / 客户端双端代码要点

1. **客户端独有 API 必须守卫**：
   ```ts
   import { ref } from 'vue'
   if (import.meta.client) {                // 编译期消除分支
     const w = window.innerWidth
   }
   // 或：
   if (typeof window !== 'undefined') { ... }
   ```

2. **服务端渲染输出纯净 HTML**：避免在 setup 顶层就调用 `document.title = ...`、`window.scrollTo` 等。

3. **`<ClientOnly>` / `<Suspense>`**：把客户端独有逻辑封装到子组件。

4. **`isCustomElement`**：在 SSR 下尤其重要——服务端不会跑 hydration warning 之外的探测；显式声明能避免 warning 又能去掉 `data-v-xxx` 属性。

## 实战场景

1. **Nuxt / Vite SSG / vite-ssg**：内部都用 `createSSRApp` 而非 `createApp`。
2. **同一份入口服务两端**：`if (import.meta.env.SSR) createSSRApp(App) else createApp(App)`。
3. **自定义元素互操作**：项目里用了 `web-component` 库（Lit / Stencil），通过 `isCustomElement` 让 Vue 不污染它的属性。

## 常见踩坑

- **`createSSRApp` 不调用 `.mount()`**：服务端没有 DOM，`renderToString` 才是正确用法。
- **hydration mismatch**：服务端、客户端渲染同一组件树但结果不一致；详见 `pitfalls/11.ssr-hydration-mismatch`。
- **`app.config.errorHandler` 在 SSR 也会跑**：配合 Sentry 上报时记得只挂 client。
- **`isCustomElement` 不会自动包含 `html` / `body` 等内置元素**：这些由 runtime 内部硬编码白名单处理。
- **Suspense + async setup 在 SSR 下**：服务端会等待 promise resolve 后再 render；超时未 resolve 则抛回 client 重试。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 SSR](https://cn.vuejs.org/guide/scaling-up/ssr.html) | SSR 完整指南 |
| [Vue 官方 API](https://cn.vuejs.org/api/application.html#createssrapp) | createSSRApp 签名 |
| [Vue 源码](https://github.com/vuejs/core/blob/main/packages/runtime-dom/src/index.ts) | `createSSRApp` 定义 |
| [Nuxt 3 入口](https://nuxt.com/) | Nuxt 是 `createSSRApp` 的最典型实践 |