# createSSRApp 与 isCustomElement 配置

> 版本：Vue 3.x | 状态：stable | 源码：`packages/runtime-core/src/apiCreateSSRApp.ts` | 延伸阅读：[Vue 官方：服务端渲染](https://cn.vuejs.org/guide/scaling-up/ssr.html)

## 这是什么

`createSSRApp` 与 `createApp` 的区别在于**是否启用 hydration 路径**：SSR 创建的实例会在客户端走 `hydrate` 而不是 `mount`。同一个组件可以双端复用，入口代码只需要分支判断。

`app.config.compilerOptions.isCustomElement` 用于告诉 Vue「这个标签是 Web Component」，避免尝试解析它的属性、子节点或附加 `data-v-xxx`。在嵌入第三方 web component（如 `<my-chart>`、`<icon-ify>`）时必备。

## 源码走读

```ts
// packages/runtime-core/src/apiCreateSSRApp.ts:13
export function createSSRApp(
  rootComponent: Component,
  rootProps?: Record<string, any>
): SSRApp {
  const app = createApp(rootComponent, rootProps)
  const ctx: SSRContext = {}
  ;(app as SSRApp)._context.ctx = ctx
  ;(app as SSRApp).runWithContext = (fn) => runWithContext(ctx, fn)
  return app as SSRApp
}
```

```ts
// packages/runtime-core/src/index.ts 顶部：识别 isCustomElement
function isCustomElement(tag: string) {
  return tag.startsWith('my-')
}
app.config.compilerOptions.isCustomElement = isCustomElement
```

## 实战场景

1. 同一份组件在 SSR 与 CSR 间复用，仅入口分支判断 `import.meta.env.SSR`。
2. 集成第三方 Web Component 库（如 Shoelace、Lit 元素）时关闭解析、避免 `data-v-xxx` 污染。
3. SSR 入口导出 `render` 函数，使用 `renderToString(createSSRApp(App))`。

## 常见踩坑

- `isCustomElement` 必须**在 `mount` 之前**设置；运行时修改无效（编译器已读取）。
- SSR 下 `window` / `document` / `localStorage` 不存在——必须 `import.meta.client` 或 `onMounted` 守卫。
- `createSSRApp` 实例在客户端不会自动调用 `mount`，必须显式调用。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方：createSSRApp](https://cn.vuejs.org/api/application.html#createssrapp) | API 入口 |
| [Vue 官方：isCustomElement](https://cn.vuejs.org/api/application.html#app-config-compileroptions) | compilerOptions 配置 |
| [Vue 官方：SSR 总览](https://cn.vuejs.org/guide/scaling-up/ssr.html) | 整体流程 |
| [Vue 源码：apiCreateSSRApp.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiCreateSSRApp.ts) | 仅 13 行，挂在 ctx 上 |