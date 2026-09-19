> 版本: Vue Router 4.x | RFC: — | 状态: stable | 概念: 全局守卫 / beforeEach

# 07 · 全局守卫

`router.beforeEach((to, from) => boolean | undefined | RouteLocationRaw)` 是最常用的权限拦截点。

要点（Vue Router 4 之后）：

- 不再需要 `next` 函数。返回 `true` 通过、`false` 中止、返回新位置则重定向；不返回（`undefined`）也表示放行,等价于 `return true`;
- `await` 内部异步调用后再返回，能阻断"渲染前完成检查"的竞态；
- 不要同时"返回 + 调用 next()",会触发 dev 警告 `VUE_ROUTER_R0023`;
- `nextTick` 之后才允许调用 `next()` 是旧版兼容逻辑，4.x 已不适用。

源码:`navigationGuards.ts:139-200` 的 `guardToPromiseFn` 把 guard 包成 Promise,`guard.length < 3` 时把返回值喂给 `next`,`__DEV__` 下 `guard.length > 2` 且返回值非 undefined 时报警。`NavigationGuardReturn` 类型(`typed-routes/navigation-guards.ts:15`)为 `void | Error | boolean | RouteLocationRaw`。

本 demo 模拟一个简易 CMS：进 `/admin` 之前先异步读取"权限 token"，没有就重定向到登录页并保留 `redirect` 参数。