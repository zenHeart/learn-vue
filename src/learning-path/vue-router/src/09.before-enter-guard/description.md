> 版本: Vue Router 4.x | RFC: — | 状态: stable | 概念: beforeEnter 守卫深入

# 09 · 路由独享守卫与权限拦截

`beforeEnter` 直接挂在路由配置上，与全局守卫相比：

- 范围更小：只对该路由生效；
- 不需要 `next()`：返回 `true/false/位置` 即可；
- 适用场景：单页级别的权限拦截、特定入口的预加载、特定路由的来源校验。

本 demo 用一个"订单详情"路由演示：

- 进入 `/orders/:id/secret` 必须匹配特定来源（来自 `/orders`）；
- 用 `meta.roles` 表达路由所需权限；
- `beforeEnter` 内部可访问 Pinia / 浏览器存储读取权限信息。