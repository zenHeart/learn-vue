> 版本: Pinia 2.x + Vitest 1.x+ | RFC: — | 状态: stable | 概念: Pinia store 单元测试

# 11 · 测试 Pinia store（Vitest）

测试 store 的关键 API：

- `setActivePinia(createPinia())`：每次测试前建立独立 Pinia 实例，避免状态串扰；
- `useStore()` 必须先 `setActivePinia`，否则 store 会挂到 `app.config.globalProperties` 缺失的应用下；
- mock actions：直接在 store 上重新赋值 `store.fetch = vi.fn()`；
- 组件测试：用 `@vue/test-utils` 的 `mount` 配合 `createPinia()`；
- 异步 action：`await store.load()` 后断言。

本 demo 以代码片段形式给出测试用例集合，便于读者直接复制到 Vitest 项目。