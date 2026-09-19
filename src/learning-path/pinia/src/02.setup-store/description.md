> 版本: Pinia 2.x | RFC: — | 状态: stable | 概念: setup 函数式 store

# 02 · Setup Store 写法

`defineStore('cart', () => { ... })` 用组合式 API 描述 store：

- 内部自由使用 `ref / computed / watch / inject`；
- 返回值就是 store 暴露的 state / actions / getters；
- **自动 ref 解包**：访问 store.cart.items.count 不需要再 `.value`。

与 Options Store 的取舍：

- Setup 风格：组合式思维友好、可以复用 `composables/` 下现成逻辑、TS 类型推断更自然；
- Options 风格：迁移成本低、对老 Vuex 用户友好、有显式 `state/getters/actions` 字段。

本 demo 用一个购物车 store 对比两种写法，注意 `state()` 与 `ref()` 都让访问变成 `.count` 而非 `.count.value`。