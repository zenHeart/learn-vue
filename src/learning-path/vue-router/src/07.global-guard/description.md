> 版本: Vue Router 4.x | RFC: — | 状态: stable | 概念: 全局守卫 / beforeEach

# 07 · 全局守卫

`router.beforeEach((to, from) => boolean | undefined | RouteLocationRaw)` 是最常用的权限拦截点。

要点（Vue Router 4 之后）：

- 不再需要 `next` 函数。返回 `true` 通过、`false` 中止、返回新位置则重定向；
- `await` 内部异步调用后再返回，能阻断"渲染前完成检查"的竞态；
- 必须返回一个真值或具名位置，否则守卫不调用，路由进入"挂起"状态；
- `nextTick` 之后才允许调用 `next()` 是旧版兼容逻辑，4.x 已不适用。

本 demo 模拟一个简易 CMS：进 `/admin` 之前先异步读取"权限 token"，没有就重定向到登录页并保留 `redirect` 参数。