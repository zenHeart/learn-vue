> 版本: vue-router 4.x (Vue 3.0+) | RFC: — | 状态: stable | 概念: createRouter / createMemoryHistory

# vue-router 历史模式

vue-router 4 是 Vue 3 的官方路由库。本 demo 演示用 `createMemoryHistory()` 在沙盒环境中创建不依赖 URL 的内存路由。

## 你会学到什么

- `createRouter({ history, routes })` 是创建路由实例的统一入口。
- `createMemoryHistory()` 不读写 location，适合 SSR、单元测试、REPL 沙盒。
- 路由配置 `routes` 是 path → component 的数组。
- 顶层用 `<RouterLink to="...">` 和 `<router-view />` 渲染链接与匹配组件。

## 动手试

1. 点击 Home/About 链接，观察 `<router-view />` 切换组件。
2. 在 DevTools 里查看 `router.currentRoute.value`，理解响应式路由对象。
3. 把 `createMemoryHistory` 改成 `createWebHistory()`，体验真实 URL 模式。

## 关键陷阱

- 内存路由刷新页面会丢失状态；生产环境用 `createWebHistory()`。
- 路由实例必须在 `app.use(router)` 之后才能 `useRoute()` 取到。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [vue-router 官方文档](https://router.vuejs.org/) | 入门与高级用法 |
| [Vue Router GitHub](https://github.com/vuejs/router) | 源码与 issue |