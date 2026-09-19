> 版本: Vue Router 4.5+ (typed-routes unplugin) | RFC: https://github.com/vuejs/router/discussions | 状态: experimental | 源码: vue-router/packages/router/src/typed-routes/{route-map,route-records,route-location}.ts
> 延伸: [typed-routes unplugin](https://router.vuejs.org/guide/advanced/typed-routes.html) | [RouteMap 类型](https://github.com/vuejs/router/blob/main/packages/router/src/typed-routes/route-map.ts)

# 15 · 强类型 Router / Route

Vue Router 4 默认导出的 `useRoute()` 返回 `RouteLocationNormalizedLoaded`,`router.push({ name })` 的 `params` 是 `Record<string, any>` —— 一旦写错参数名,运行时报 "no match" 才知道。

`vue-router/typed-routes` unplugin 会在构建时扫描你的路由表,生成 `RouteMap` 类型,把它注入到 `declare module 'vue-router'` 里,让 `useRoute()` 的 `params`、`useRouter().push({ name })` 的 `params` 都按名字严格校验。

## 这是什么

构建期插件读取 routes 数组 → 生成 `interface RouteMap { '/users/:id': { params: { id: string } } ... }` → 自动注入到项目里。运行时无开销,只在 IDE 与编译期起作用。

```ts
// vue-router/packages/router/src/typed-routes/route-map.ts
export interface RouteMap {
  // 由 unplugin 在构建时填充
}
```

```ts
// vue-router/packages/router/src/typed-routes/route-records.ts
// RouteRecordRaw 在 typed-routes 开启时被映射成 RouteRecordRawFor<RouteMap>
```

## 源码走读

`route-location.ts` 把 `useRoute()` 的返回类型用 `RouteLocationNormalizedLoaded<Name>` 重载,Name 由 `RouteMap` 的键推导:

```ts
// vue-router/packages/router/src/typed-routes/route-location.ts
export type RouteLocationNormalizedLoaded<Name extends keyof RouteMap = keyof RouteMap> =
  _RouteLocationNormalizedLoaded<Name>
```

实际项目里通常这样:

```ts
// vite.config.ts
import VueRouter from 'vue-router/typed-routes'
plugins: [VueRouter({ routesFolder: 'src/pages' })]

// 业务代码
router.push({ name: 'user', params: { id: 123 } })
//                       ^^^^^^^^ 类型 'number' 不可赋给 'string'
```

## 实战场景

1. **真实场景** — 后台管理系统里几十个路由,新增一个参数忘了写,IDE 立刻画红线,比 e2e 测试先发现错误。
2. **边界场景** — 文件式路由下,unplugin 自动读 `src/pages/**` 生成 RouteMap;手写 routes 数组时,需要把 routes 抽到一个 `typed-router.ts` 文件里。

## 常见踩坑

- **unplugin 没有扫到 routes 文件**:返回的 `RouteMap` 是空 interface,所有 `name` 都退化为 `never`。把 routes 放到固定目录或在 `plugins` 里显式声明入口文件。
- **`path-to-regexp` 升级**:typed-routes 会用路由路径推导 params,Vue Router 4.5 之后用 `path-to-regexp@8`,路径里 `:id(\\d+)` 的类型会变成 `number`,不是 `string`。
- **`meta` 不参与强类型**:`meta` 是 `RouteMeta extends Record<string, unknown>`,需要自己在项目里 `declare module 'vue-router' { interface RouteMeta { requiresAuth?: boolean } }` 扩展。
- **dev 启动速度**:typed-routes 走 Vite 插件管道,在大项目里增加约 1-2 秒冷启动时间。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [typed-routes 文档](https://router.vuejs.org/guide/advanced/typed-routes.html) | unplugin 配置 |
| [vue-router 源码 typed-routes/](https://github.com/vuejs/router/tree/main/packages/router/src/typed-routes) | 全部类型源码 |
| [Pinia + typed routes](https://pinia.vuejs.org/cookbook/options-api.html) | store 内 router 调用的类型增强 |
| [unplugin-vue-router](https://github.com/posva/unplugin-vue-router) | 配套的文件路由解析器 |
