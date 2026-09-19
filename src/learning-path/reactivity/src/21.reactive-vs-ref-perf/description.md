# 性能对比：reactive vs ref vs shallowRef {#reactive-vs-ref-perf}

> 版本: Vue 3.x | RFC: 0001-composition-api | 状态: stable

不同响应式 API 的开销差异巨大，主要来自：

1. **`reactive(obj)`**：递归创建 Proxy，每个属性访问都触发 `Reflect.get` + `track`；首次调用还会遍历子对象。
2. **`ref(primitive)`**：仅一个对象 `{ value }`，通过 `Object.defineProperty` 的 getter/setter + 自身 `__v_isRef` 标识触发依赖，访问比 reactive 快约 1.5-3x。
3. **`shallowRef(obj)`**：`value` 不被深代理，仅在 `.value =` 时触发 `trigger`；访问时不收集依赖，性能**接近普通对象**。

## 何时选哪个 {#when-to-choose}

- 大型不可变数据集（图表数据、表单初始值）→ `shallowRef` + `triggerRef`。
- 中小规模可变状态 → `reactive` 或 `ref` 皆可。
- 频繁读写但变更少的对象 → `shallowRef`。

## 关键陷阱 {#pitfalls}

1. **不要用 `reactive` 包裹超大对象**（>10k 属性）：首次创建代理耗时数十 ms，访问每个属性都有额外开销。
2. **`shallowRef` 替换整个值才触发**：若要修改内部字段又保留响应性，必须用 `triggerRef` 手动通知。
3. **测量方式**：仅在浏览器真实环境中测量；用 `performance.now()` 取多次平均减少 GC 干扰。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · 性能优化](https://vuejs.org/guide/best-practices/performance.html)
- [Vue 官方文档 · shallowRef](https://vuejs.org/api/reactivity-advanced.html#shallowref)
- [Vue 3 源码 · ref.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/ref.ts)
- [RFC 0001 Composition API](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0001-composition-api.md)

<!-- description.md -->
