> 版本: Pinia 2.x | RFC: — | 状态: stable | 概念: $subscribe 监听 store 变化

# 06 · 订阅 store 与 mutation 监听

`store.$subscribe((mutation, state) => {}, { detached })` 在 store 每次变化后触发，回调参数：

- `mutation.type`：分类(`MutationType.direct` / `patchObject` / `patchFunction` / `action object` / `action function`);
- `mutation.storeId`：定位 store；
- `mutation.events`：**仅 DEV 环境存在**的 Vue 反应式调试事件(`DebuggerEvent`),用于 Pinia DevTools 与 Vue reactivity 调试,**不要在生产代码里读它**;
- `state`：当前完整 state 快照。

典型用途：

- 持久化到 localStorage / IndexedDB；
- 跨页面 BroadcastChannel；
- 调试与埋点。

与 `store.$watch`（按字段监听）配合可实现精细的响应式逻辑。

本 demo 演示一个"自动持久化到 localStorage 的草稿 store"。