> 版本: Vue 3.0+ | RFC: 0001-composition-api | 状态: stable | 概念: computed / reactive 状态字段

# computed 作为 reactive state 的内部属性

把 `computed` 直接挂在 `reactive` 对象上，可以在模板里像普通属性一样访问，不必写 `.value`。

## 你会学到什么

- reactive 对象的每个字段可以是 ref、computed 或普通值。
- 模板访问 reactive 字段时，Vue 会自动解包，无需 `.value`。
- 与单独返回 `const double = computed(...)` 相比，这种写法更接近「内聚的 store」。

## 动手试

1. 点击按钮修改 `state.count`，观察 `state.double` 是否同步更新。
2. 打开 DevTools 控制台，看到 watchEffect 的回调输出。
3. 试着把 `computed` 改成 `ref`，看模板是否还能直接访问。

## 关键陷阱

- 不要在 computed getter 内修改其他响应式状态（会触发循环更新）。
- computed 会缓存结果：依赖未变时重复读取不会重新计算。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方文档 - computed](https://vuejs.org/api/reactivity-core.html#computed) | API 详细说明 |
| [Vue 官方文档 - reactive](https://vuejs.org/api/reactivity-core.html#reactive) | 深度代理行为 |