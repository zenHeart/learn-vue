# watch vs watchEffect 横向对比 {#watch-vs-watcheffect}

> 版本: Vue 3.x | RFC: 0001-composition-api | 状态: stable

两者都是用于**响应式副作用**的 API，区别在于：

| 维度 | `watch(source, cb, options?)` | `watchEffect(fn, options?)` |
|---|---|---|
| 依赖追踪 | **显式**：传入 ref / reactive / getter | **隐式**：执行 fn 时自动收集依赖 |
| 立即执行 | 默认**否**；可设 `immediate: true` | **是**（默认就立刻跑一次） |
| 旧值/新值 | 提供 `(newVal, oldVal)` | 不提供 |
| 副作用清理 | `cb` 第 3 参数 `onCleanup` 或 watchEffect `onCleanup` | watchEffect `onCleanup`（Vue 3.5+ 直接作为参数） |
| 多源监听 | 支持数组 `watch([a, b], cb)` | 不支持 |
| `once: true` | 支持 | 不支持 |
| 数组解构旧值 | 支持 `cb = ([na, nb], [oa, ob]) => {}` | 不支持 |
| flush 时机 | pre / post / sync | pre / post / sync |

## flush 时机 {#flush-timing}

- `'pre'`（默认）：组件 DOM 更新**前**触发（在 `beforeUpdate` 钩子之前），可访问旧 DOM。
- `'post'`：DOM 更新**后**触发，对应 `updated` 钩子之后；适合读 layout。
- `'sync'`：**同步**触发，依赖变化立刻跑；会破坏 batching，仅在特殊场景使用。

## 关键陷阱 {#pitfalls}

1. **`watch` 默认懒执行**：容易在测试中错过首次调用；想要立即跑用 `immediate: true`。
2. **`watchEffect` 没有旧值**：仅适合"我要响应依赖跑逻辑"的场景，不适合"数据从 A 变 B 后做差异处理"。
3. **数组解构陷阱**：`watch([ref1, ref2], ([n1, n2]) => ...)` Vue 已自动用 Proxy 保持引用稳定，但仍建议明确写出全部参数。
4. **`once` 与 `immediate` 可同时设置**：但 `once` 在 `immediate` 之后的第一次变更触发一次。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · watch](https://vuejs.org/api/reactivity-core.html#watch)
- [Vue 官方文档 · watchEffect](https://vuejs.org/api/reactivity-core.html#watcheffect)
- [Vue 官方文档 · 副作用清理](https://vuejs.org/guide/essentials/watchers.html#callback-flush-timing)
- [RFC 0001 Composition API](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0001-composition-api.md)
- [Vue 源码洞察：watchEffect / watch 的调度时机](_analysis/vue-source-insights.md#watcheffectwatch的调度时机) | `packages/runtime-core/src/apiWatch.ts, scheduler.ts:88-117` 引用

<!-- description.md -->
