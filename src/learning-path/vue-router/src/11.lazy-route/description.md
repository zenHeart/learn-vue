> 版本: Vue Router 4.x | RFC: — | 状态: stable | 概念: 路由懒加载

# 11 · 路由懒加载与代码分包

`() => import('./Foo.vue')` 是最常见的分包方式：

- Vite/Rollup 会把 import 目标单独切出一个 chunk；
- 首屏只下载当前路由对应的 chunk；
- 命名 chunk：`() => import('./Foo.vue').then(m => m.default)` 或加 webpackChunkName 注释。

搭配技巧：

- `defineAsyncComponent` 用于组件级异步（无路由场景）；
- 预取（prefetch）：Vite 默认会预取路由 chunk，配合 `<Suspense>` 给出 loading；
- 错误兜底：给 `import` 套一层 Promise reject 处理；或在外层用 `<Suspense>` 的 `#fallback`。

本 demo 模拟三个独立的"报表页"，观察 Network 中的分包请求。