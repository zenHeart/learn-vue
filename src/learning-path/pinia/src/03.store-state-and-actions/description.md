> 版本: Pinia 2.x | RFC: — | 状态: stable | 概念: store 的 state 与 actions

# 03 · state 解构与变更

常见问题：

- 直接 `const { count } = useStore()` —— count 失去响应式，因为普通赋值只复制值；
- 应该用 `storeToRefs(store)` 把 state/getters 转成 ref 再解构。

变更方式对比：

- `store.count++` — 单字段直接赋值（Setup 风格支持）；
- `store.$patch({ count: 5 })` — 对象形式批量；
- `store.$patch(state => state.count++)` — 函数形式；
- `store.$reset()` — 重置回 initial state，仅 Options Store 默认支持；Setup Store 可手动实现 `$reset`。