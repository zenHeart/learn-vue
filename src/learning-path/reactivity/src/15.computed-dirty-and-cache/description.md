# computed 的 dirty 标记、缓存与嵌套依赖 {#computed-dirty-and-cache}

> 版本: Vue 3.x | RFC: 0010-computed-api, 0001-composition-api | 状态: stable

`computed` 的实现本质上是一个**特殊的 effect**：

- 它持有 `value` 和 `dirty: boolean` 两个内部状态。
- 第一次访问 `.value` 时执行 getter 收集依赖，并把 `dirty` 置为 `false`。
- 当依赖变化时（其他 effect 调用 `trigger`），调度器把 `dirty` 重新置为 `true`，**但不会立刻重算**。
- 下次访问 `.value` 时如果 `dirty === true` 才重新执行 getter，体现 **lazy 求值**。
- 多个 computed 嵌套形成**依赖链**，下游 computed 仅在上游 dirty 时才重新收集依赖。

对比 `effect(fn)`：默认立即执行一次并同步重算；`computed` 仅在被读取且依赖 dirty 时才执行。

## 关键陷阱 {#pitfalls}

1. **不要在 getter 内修改其他 ref**：会形成**循环依赖**，触发"computed value cannot be used as a side effect"警告；极端情况下导致栈溢出。这是官方明确禁止的反模式（Vue 编译器与 `ComputedRefImpl` 中均有检测）。
2. **不要在 computed 内做异步**：因为异步完成时 `dirty` 状态可能已变化，结果不确定。
3. **错误的"反向同步"**：用 `watch(value, v => other.value = v)` 是单向同步，**不要**用 `computed({ get, set })` 把另一个 ref 写入 getter。
4. **嵌套 computed 的重算次数**：依赖链上游只变更一次，下游每次访问 `.value` 才会重算，不会自动 batch。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · computed](https://vuejs.org/api/reactivity-core.html#computed)
- [Vue 官方文档 · 计算属性 缓存 vs 方法](https://vuejs.org/guide/essentials/computed.html)
- [Vue 3 源码 · computed.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/computed.ts)
- [RFC 0010 Composition API: Computed Properties](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0010-composition-api-dfa.md)
- [Vue 源码洞察：computed 的 dirty 标记与缓存策略](_analysis/vue-source-insights.md#computed的dirty标记与缓存策略) | `packages/reactivity/src/computed.ts:97-122` 引用

<!-- description.md -->
