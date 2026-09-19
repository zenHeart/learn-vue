> 版本: Vue Router 4.x | RFC: — | 状态: stable | 概念: router-view 插槽

# 06 · router-view 插槽与过渡

`<router-view>` 支持作用域插槽 `v-slot="{ Component, route }"`：

- 可在路由切换时插入 `<transition>`、`<KeepAlive>`；
- 通过 `Component` 直接拿到 VNode，便于埋点或 ref 化；
- 通过 `route` 可以在 slot 内拿到当前匹配的路由对象。

本 demo 模拟一个"商品详情"页，三个商品切换时：

- 用 `<Transition>` 做淡入淡出；
- 用 `<KeepAlive>` 缓存用户已查看过的商品 tab；