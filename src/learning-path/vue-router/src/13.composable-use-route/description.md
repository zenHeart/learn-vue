> 版本: Vue Router 4.x | RFC: — | 状态: stable | 概念: useRoute / useRouter 组合式 API

# 13 · useRoute 的组合式封装

`useRoute()` 每次访问 `route.params.xxx` / `route.query.xxx` 都要写完整路径，组件散落后多处取值难以追踪。

把对路由的访问封装成组合式函数 `useRouteParam(name)` / `useRouteQuery(name)`：

- 返回 `ComputedRef`，自动响应 URL；
- 提供类型安全的 `parse` 转换（数字、布尔、枚举）；
- 集中的 schema 校验，便于接入 zod / valibot。

本 demo 给出一个轻量实现，并演示一个"搜索栏"页面通过 query 驱动分页。