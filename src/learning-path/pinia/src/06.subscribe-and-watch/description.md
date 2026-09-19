> 版本: Pinia 2.x | RFC: — | 状态: stable | 概念: $subscribe 监听 store 变化

# 06 · 订阅 store 与 mutation 监听

`store.$subscribe((mutation, state) => {}, { detached })` 在 store 每次变化后触发，回调参数：

- `mutation.events`：变化来源（`direct` / `patch object` / `patch function` / `action ...`）；
- `mutation.type`：更可读的分类；
- `mutation.storeId`：定位 store；
- `state`：当前完整 state 快照。

典型用途：

- 持久化到 localStorage / IndexedDB；
- 跨页面 BroadcastChannel；
- 调试与埋点。

与 `store.$watch`（按字段监听）配合可实现精细的响应式逻辑。

本 demo 演示一个"自动持久化到 localStorage 的草稿 store"。