> 版本: Pinia 2.x | RFC: — | 状态: stable | 概念: actions 中的异步处理

# 05 · Action 与异步

Action 是 Pinia 中**唯一推荐放副作用**的位置：

- 可以是同步函数、异步函数、返回 Promise、调用其它 action；
- 组件用 `await store.fetchUser()` 等待结果；
- 配合 `<Suspense>`：async setup 内直接 await 即可由外层 Suspense 接管 loading。

与 Vue Query / SWR 的取舍（**不引战，只给参考**）：

- 数据量小、不需要缓存失效与后台刷新：Pinia action 足够；
- 复杂列表、需要去重、轮询、optimistic update：建议引入 Vue Query / Pinia Colada。

本 demo 用一个"用户档案"展示 action + loading + error 三态。