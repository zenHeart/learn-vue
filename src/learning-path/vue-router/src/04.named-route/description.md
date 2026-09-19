> 版本: Vue Router 4.x | RFC: — | 状态: stable | 概念: 命名路由

# 04 · 命名路由

`<router-link :to="{ name: 'order-detail', params: { id: orderId }, query: { from: 'cart' } }">`

比起拼接字符串路径，命名路由的优势：

- **重构友好**：URL 变化不影响调用点；
- **参数显式**：未提供必要 param 时 vue-router 会报警；
- **强类型**：TypeScript 配合 `typedRoutes: true` 可生成 `RouteLocationRaw` 类型；
- **query 编码零负担**：不必手动 `encodeURIComponent`。

本 demo 模拟一个"订单列表 → 详情"页，提供两种写法对比：直接路径 vs 命名路由。注意"路径字符串"模式下若漏掉 `?` 或参数，最终 URL 可能根本不会匹配。