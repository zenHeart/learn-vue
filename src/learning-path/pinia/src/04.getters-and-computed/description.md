> 版本: Pinia 2.x | RFC: — | 状态: stable | 概念: getters 等价于 computed

# 04 · getters 与 computed

Pinia 中：

- **Options Store**：`getters` 字段，类 Vue 的 computed，依赖 state 与其它 getters；
- **Setup Store**：直接用 `computed()`，返回值就是 getter。

要点：

- getter 之间可以相互依赖（依靠 Vue 的依赖收集）；
- getter 返回函数即可"参数化 selector"：`getUserById: (state) => (id) => state.users.find(...)`；
- getter 缓存：依赖不变就不重新计算——和 React 的 `useMemo` 等价，但 Pinia 的 getter **永远是缓存的**，而 `useMemo` 还要开发者保证依赖完整。

本 demo 用一个"商品筛选"场景演示参数化 getter。