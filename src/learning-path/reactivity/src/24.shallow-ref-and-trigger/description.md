# shallowRef / triggerRef：浅层 ref 与强制触发 {#shallow-ref-and-trigger}

> 版本: Vue 3.0+ | RFC: 0001-composition-api | 状态: stable

`shallowRef(value)` 创建的 ref **只对 `.value` 自身进行响应式追踪**，内部持有的大对象不会被 deep 代理。与 `ref(obj)` 相比：

| 行为 | `ref(obj)` | `shallowRef(obj)` |
| --- | --- | --- |
| 整体替换 `ref.value = newObj` | 触发更新 | 触发更新 |
| 修改内部字段 `ref.value.x = 1` | 触发更新 | **不触发** |
| 持有大对象代理成本 | 高（递归 Proxy） | 几乎为 0 |

`triggerRef(ref)` 用于**强制**通知依赖该 ref 的 effect 重跑 —— 通常用于 shallowRef 内部数据已变但你手动改了字段、希望同步刷新视图的场景。

## 常见用法 {#usage}

- **大对象 / 第三方实例**：ECharts 配置项、monaco editor model、地图 tile 数据。整体替换+trigger 比深代理便宜得多。
- **不可变数据结构**：`shallowRef(immutableList)`，只在 push/splice 后整体替换。
- **手动控制更新节奏**：表单输入防抖（修改数据后 `triggerRef` 一次性更新）。

## 关键陷阱 {#pitfalls}

1. **`shallowRef.value` 整体替换触发更新**；修改内部字段不触发。
2. **`shallowRef` 内部如果本身就是 ref / reactive**，那些深层的响应式仍会生效（因为它们各自有自己的 track/trigger）。`shallowRef` 只是**不再 deep 探测**。
3. **`triggerRef` 必须真的发生了变化才调用**，否则可能造成重复渲染；Vue 内部没有去重。
4. **`shallowRef` 与 `shallowReactive` 是两套 API**：前者管 `.value`，后者管对象属性；二者不可互相替代。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · shallowRef](https://vuejs.org/api/reactivity-advanced.html#shallowref)
- [Vue 官方文档 · triggerRef](https://vuejs.org/api/reactivity-advanced.html#triggerref)
- [Vue 3 源码 · ref.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/ref.ts)
- [Vue 3 源码 · shallowRef 实现](https://github.com/vuejs/core/blob/main/packages/reactivity/src/ref.ts#L74-L91)

<!-- description.md -->
