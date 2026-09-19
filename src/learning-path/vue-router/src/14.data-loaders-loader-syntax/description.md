> 版本: Vue Router 4.5+ (experimental) | RFC: https://github.com/vuejs/router/discussions | 状态: experimental | 源码: vue-router/packages/router/src/experimental/data-loaders/{defineLoader,navigation-guard,types-config}.ts
> 延伸: [Vue Router 实验数据加载器](https://router.vuejs.org/guide/experimental/data-loaders.html) | [defineLoader 类型定义](https://github.com/vuejs/router/blob/main/packages/router/src/experimental/data-loaders/defineLoader.ts)

# 14 · 实验性数据加载器 (loader 字段)

Vue Router 4.4 起,官方把"路由级数据获取"从"写在 navigation guard 里"逐步上移到一个独立的 `loader` 字段。**注意**:截至 4.5.x,数据加载器仍标记为 **experimental**,需要从 `vue-router/experimental` 显式导入,而不是从 `vue-router` 主入口。

## 这是什么

`loaders` 是路由记录上的一个数组,每项都是一个由 `defineLoader()` 创建的 `UseDataLoader`。导航过程中 vue-router 会自动并行执行这些 loader,把结果注入到目标组件的 `useLoaderData()` 钩子里,从而彻底替代 `beforeRouteEnter` 里写 `await fetch()` 的模式。

```ts
// vue-router/packages/router/src/types/index.ts:265
export interface RouteMeta extends Record<PropertyKey, unknown> {
  /** 路由级数据加载器 */
  loaders?: UseDataLoader[]
  // ...
}
```

## 源码走读

`defineLoader(name, fn)` 接受路由名与一个返回 Promise 的函数,返回一个带 `data / error / pending / refresh` 的 composable:

```ts
// vue-router/packages/router/src/experimental/data-loaders/defineLoader.ts:45
export function defineBasicLoader<Name extends keyof RouteMap, Data>(
  name: Name,
  loader: DefineLoaderFn<Data, DataLoaderContext, RouteLocationNormalizedLoaded<Name>>,
  options?: DefineDataLoaderOptions_DefinedData,
): UseDataLoaderBasic_DefinedData<Data>
```

`navigation-guard.ts:40` 把所有 loader 收集到 `meta.loaders`,在导航 resolve 之前等待,期间通过 `LOADER_SET_KEY` 维护当前记录的 loader 集合并允许 abort:

```ts
// vue-router/packages/router/src/experimental/data-loaders/navigation-guard.ts:80
// guard to add the loaders to the meta property
record.meta[LOADER_SET_KEY] ??= new Set(record.meta.loaders || [])
```

## 实战场景

1. **真实场景** — 列表页进入前并行拉取"列表 + 用户权限 + 配置":不再需要为每个组件各自写 `onMounted` 抓数据,也不会出现"组件先渲染再被数据替换"的闪烁。
2. **边界场景** — 用户从 `/orders/1` 快速点 `/orders/2`:通过 loader 内部的 `AbortController` 自动取消上一次请求;`refresh()` 可以在不离开路由的情况下强制重新拉取。

## 常见踩坑

- **导入路径**:必须从 `vue-router/experimental` 导入 `defineLoader`,普通 `vue-router` 主入口还没暴露它。源码里 `experimental/index.ts:1` 单独 re-export。
- **lazy 组件的影响**:用 `() => import('./Foo.vue')` 时,loader 写在组件文件顶部 (`export const xxxLoader = defineLoader(...)`) 会被 unplugin 自动收集到路由;纯 `loaders: []` 数组只在没用懒加载时方便。
- **Suspense 还是老骨架屏**:`defineLoader` 的设计优先与 `<Suspense>` 协同;老 demo 里手写的 `pending` 标志也能用,但会让代码重复。
- **TypeScript 路由名**:要享受 `name` 字段的强类型,需要开启 unplugin 的 `typedRoutes: true`,否则 `keyof RouteMap` 永远为空。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue Router 实验 loader 指南](https://router.vuejs.org/guide/experimental/data-loaders.html) | defineLoader / useLoaderData / refresh 用法 |
| [vue-router 源码 defineLoader.ts](https://github.com/vuejs/router/blob/main/packages/router/src/experimental/data-loaders/defineLoader.ts) | 入口函数与类型 |
| [vue-router 源码 navigation-guard.ts](https://github.com/vuejs/router/blob/main/packages/router/src/experimental/data-loaders/navigation-guard.ts) | loader 的执行时机 |
| [vue-router 源码 types/index.ts](https://github.com/vuejs/router/blob/main/packages/router/src/types/index.ts) | `RouteMeta.loaders` 字段 |
| [Pinia 配合 loader 的范式](https://pinia.vuejs.org/) | 用 store 缓存 loader 结果 |
