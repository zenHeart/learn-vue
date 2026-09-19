> 版本: Vue Router 4.x | RFC: — | 状态: stable | 概念: 动态路由匹配

# 02 · 动态路由参数

`path: '/user/:id'` 风格的路由会把冒号段映射到 `route.params`。本 demo 用一个"用户档案"场景演示：

- `useRoute()` 返回的响应式对象能即时反映 URL 变化；
- 同一组件在不同参数间切换时**不会销毁重建**，需要靠 `onBeforeRouteUpdate` 或 `watch(route)` 捕获参数变化；
- 嵌套段（如 `/user/:id/post/:postId`）会以多个键的形式出现。

观察重点：在地址栏切换 `id`，标题会同步更新，但右上角的"组件创建时间"保持不变——这正是参数复用同一组件实例的证据。