# toRaw / markRaw：脱离响应式 {#toRaw-and-markraw}

> 版本: Vue 3.x | RFC: 0001-composition-api | 状态: stable

`toRaw(obj)` 返回**原始对象**（不被代理）。Vue 内部在以下场景用它：

- 触发更新前对比新旧值（避免递归 deep compare 代理对象）。
- `provide/inject` 跨组件传递非响应式数据。
- 把响应式对象存入 localStorage / IndexedDB 时避免 Proxy 序列化失败。

`markRaw(obj)` 给对象打上 `__v_skip: true` 标记，**告诉 Vue 永远不要把它包装为代理**。当对象被 `reactive()` 包裹后，Vue 看到该标记会直接返回原对象。

## 常见用法 {#usage}

- **第三方类实例**：地图 SDK（Mapbox、AMap）、图表库（ECharts）、Monaco Editor——它们内部状态复杂且会被自身修改，包成 Proxy 会破坏内部行为。
- **大型静态数据**：在初始化时 `markRaw(data)` 后挂到 reactive 状态上，避免后续被代理。
- **跨 worker 通信**：序列化前必须 `toRaw`。

## 关键陷阱 {#pitfalls}

1. **`toRaw` 只剥一层**：嵌套对象仍是代理；需要深拷贝可用 `JSON.parse(JSON.stringify(toRaw(obj)))`（会丢失函数/Symbol）。
2. **`markRaw` 必须早于 `reactive`**：一旦被代理就无效。
3. **`markRaw` 与 `shallowRef` 的区别**：前者**完全不响应**；后者只是不深代理，整体替换仍触发更新。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · toRaw](https://vuejs.org/api/reactivity-advanced.html#toraw)
- [Vue 官方文档 · markRaw](https://vuejs.org/api/reactivity-advanced.html#markraw)
- [Vue 3 源码 · reactive.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/reactive.ts)
- [RFC 0001 Composition API](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0001-composition-api.md)
- [Vue 源码洞察：reactive 对 Array / Map / Set / WeakMap 的代理限制](_analysis/vue-source-insights.md#reactive对arraymapsetweakmap的代理限制) | `packages/reactivity/src/reactive.ts:52-66,267-300` 引用

<!-- description.md -->
