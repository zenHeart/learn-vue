# 集合类型响应式：Map / Set / shallow 与 markRaw {#reactive-collection}

> 版本: Vue 3.x | RFC: 0001-composition-api | 状态: stable

`reactive()` 对常见内置集合（`Map`、`Set`、`WeakMap`、`WeakSet`）做了**特殊处理**：Vue 在 `collectionHandlers.ts` 中通过为这些集合的方法（`get`、`set`、`add`、`delete`、`has` 等）打补丁来触发 `trigger`，并保证迭代器方法（`forEach`、`values`、`keys`、`entries`、`Symbol.iterator`）也能被追踪。

但要注意：

- `WeakMap` / `WeakSet` 的键必须是**对象**，且因为是弱引用无法枚举，因此没有迭代器 trap。
- `shallowReactive()` 只代理**第一层**属性，集合本身不会被包装，集合内部的方法变更不会触发响应。
- `markRaw(obj)` 把对象标记为**永远不应该被代理**，Vue 在 `createReactiveObject` 中遇到 `__v_skip` 标记的对象会直接返回原对象。常用于第三方类实例（避免 Proxy 包装破坏内部状态）。
- 配合 `shallowRef` 持有大型 `Map` 可避免深遍历带来的性能开销（详见 21.reactive-vs-ref-perf demo）。

## 关键陷阱 {#pitfalls}

1. **赋值原始 Map 给 reactive**：可以工作但仅追踪外层引用。直接 `reactive(new Map())` 才能让 `set`/`delete`/`has` 触发更新。
2. **`shallowReactive` 不递归**：集合内部增删元素**不触发**渲染，但替换整个集合（`state.map = newMap`）会。
3. **`markRaw` 不可逆**：标记后即使再 `reactive()` 也不会包装。
4. **迭代安全**：Vue 把迭代结果存为快照，迭代过程中修改集合不会影响本次循环（避免无限循环）。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · Reactive Proxy of Collection Types](https://vuejs.org/api/reactivity-core.html#reactive)
- [Vue 官方文档 · shallowReactive / markRaw](https://vuejs.org/api/reactivity-advanced.html#shallowreactive)
- [Vue 3 源码 · collectionHandlers](https://github.com/vuejs/core/blob/main/packages/reactivity/src/collectionHandlers.ts)
- [RFC 0001 Composition API](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0001-composition-api.md)
- [Vue 源码洞察：reactive 对 Array / Map / Set / WeakMap 的代理限制](_analysis/vue-source-insights.md#reactive对arraymapsetweakmap的代理限制) | `packages/reactivity/src/reactive.ts:52-66,267-300` 引用
- [Vue 源码洞察：arrayInstrumentations 处理副作用读取](_analysis/vue-source-insights.md#arrayinstrumentations处理arrayconcatincludesindexof等副作用读取) | `packages/reactivity/src/arrayInstrumentations.ts:42-60` 引用

<!-- description.md -->
