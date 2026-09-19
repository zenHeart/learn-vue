> 版本: Pinia 2.x (Vue 3.0+) | RFC: 0014 | 状态: stable | 概念: defineStore / state / actions

# Pinia 入门示例

Pinia 是 Vue 官方推荐的状态管理库，作为 Vuex 的继任者。它去除了 mutations，用更直观的 `state / getters / actions` 三段式描述 store。

## 你会学到什么

- `defineStore('main', { state, actions })` 的 options 风格定义。
- `useMainStore()` 在任意组件中拿到单例 store；store.state 字段自动保持响应式。
- 在 actions 内直接通过 `this` 访问 state。
- `createPinia()` 由 `app.use(pinia)` 注册到应用。

## 动手试

1. 点击 "Update Message"，观察 `store.message` 改变并触发视图更新。
2. 打开 DevTools（如果启用）查看 state 历史。
3. 尝试再调用一次 `useMainStore()`：始终返回同一个实例。

## 关键陷阱

- 不要在 setup 外（如模块顶层）调用 `useMainStore()`，必须先 `app.use(pinia)`。
- options 风格的 actions 中 `this` 已正确绑定，不要解构后单独调用。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Pinia 官方文档](https://pinia.vuejs.org/) | 入门与核心概念 |
| [Vue RFC 0014](https://github.com/vuejs/rfcs/discussions/14) | 取代 Vuex 的提案 |