# watch 源的三种形式与 deep 选项 {#watch-source-form}

> 版本: Vue 3.x (3.5+ 支持 `deep: number`) | RFC: 0001-composition-api | 状态: stable

`watch` 的第一个参数（源）支持三种形式：

1. **ref**：直接监听 ref 的 `.value` 变化。
2. **reactive 对象**：Vue 会**隐式启用深度监听**（无需 `deep: true`）。返回值的 new/old 总是**同一个引用**（reactive 代理）。
3. **getter 函数 `() => obj.x`**：Vue 只在 getter 返回值变化时触发；返回基本类型则按值比较，返回对象则按**引用**比较（除非 `deep: true`）。

## `deep` 选项的细节 {#deep-option}

- 省略：ref → 只监听引用替换；getter → 只比较返回值。
- `deep: true`（Vue 3.0+）：递归监听对象内部所有属性。**代价**：会遍历整棵树收集依赖，性能成本与对象大小线性相关。
- `deep: number`（**Vue 3.5+ 新增**）：只深度监听前 N 层。
- 监听 `reactive` 对象时即使不写 `deep` 也会深度追踪，但旧值/新值引用相同。

## 关键陷阱 {#pitfalls}

1. **`watch(reactiveObj, cb)` 的 new === old**：因为返回的是同一个代理对象；要获取"差异"应传入 getter 或开启 `deep`。
2. **getter 返回新对象陷阱**：`() => ({ x: state.x })` 每次返回新对象，会被判定为变化（除非 `deep: true`）。
3. **大对象 + `deep: true`**：N=1000+ 的对象首次执行会慢，且后续每次改动都遍历。优先用 `shallowRef` + `triggerRef`。
4. **`deep: 1`**：仅追踪一层属性变更，比 `deep: true` 快很多但仍有差异盲区。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · watch](https://vuejs.org/api/reactivity-core.html#watch)
- [Vue 3.5 changelog](https://github.com/vuejs/core/blob/main/CHANGELOG.md)
- [RFC 0001 Composition API](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0001-composition-api.md)
- [Vue 3.5 发布博客 · 深度监听限制](https://blog.vuejs.org/posts/vue-3-5)
- [Vue 源码洞察：watchEffect / watch 的调度时机](_analysis/vue-source-insights.md#watcheffectwatch的调度时机) | `packages/runtime-core/src/apiWatch.ts, scheduler.ts:88-117` 引用

<!-- description.md -->
