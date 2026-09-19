> 版本: Vue Router 4.x | RFC: — | 状态: stable | 概念: scrollBehavior 滚动行为

# 12 · 滚动行为

`createRouter({ scrollBehavior(to, from, savedPosition) })` 在导航完成后决定视口的滚动位置。

- `savedPosition`：浏览器前进/后退触发时 vue-router 自动保存的位置；
- `{ el, top, behavior }`：滚动到指定元素（典型 hash 锚点）；
- 返回 `false` 保留当前位置。

常见组合：

- 后退时还原到上次滚动位置：`return savedPosition`；
- 锚点：`if (to.hash) return { el: to.hash, behavior: 'smooth' }`；
- 长列表场景：根据 `to.meta.saveScroll` 自定义坐标；
- 延迟滚动：返回 Promise，等待异步数据加载完成再滚动。