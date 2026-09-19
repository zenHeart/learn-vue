# effectScope：副作用作用域与可丢弃派生状态 {#effect-scope}

> 版本: Vue 3.x | RFC: 0001-composition-api | 状态: stable

`effectScope` 提供了一种**手动管理多个响应式副作用生命周期**的机制。每个 scope 内部会保存它所创建的 `effect`、`computed`、`watch` 等。组件内部默认有一个隐式 scope（`getCurrentScope()` 返回）。

常见用途：

- **组件外副作用分组**：把所有 effect 放进一个 scope，组件卸载时统一 `stop()`，避免内存泄漏。
- **可丢弃派生状态**：例如一个 store 中根据输入派生的临时计算结果，可在用户离开时整体丢弃。
- **SSR / 嵌套请求隔离**：每个请求一个 scope，避免跨请求的状态泄漏（详见 22.ssr-reactivity demo）。
- **测试隔离**：每个测试用例使用独立 scope 自动清理。

API：

- `effectScope(detached?)` — 创建 scope；传入 `true` 表示脱离组件作用域（如父组件 scope 已 stop，本 scope 仍可运行）。
- `scope.run(fn)` — 在 scope 中执行回调；回调内创建的 effect/computed/watch 自动注册到该 scope。
- `scope.stop()` — 停止 scope 内所有 effect。
- `getCurrentScope()` — 当前运行中的 scope。
- `onScopeDispose(cb)` — 注册 scope 停止时的清理回调。

## 关键陷阱 {#pitfalls}

1. **必须在 `scope.run()` 内创建 effect**：否则 effect 会注册到上层 scope 或 detached 状态，导致后续清理不到位。
2. **`detached: true` 与父 scope 隔离**：常用于 store 内部派生；stop 父组件不会影响它。
3. **`watch` 与 `watchEffect` 默认也会注册到当前 scope**。
4. **`onScopeDispose` 必须同步调用**：放进异步回调会被忽略。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · effectScope](https://vuejs.org/api/reactivity-advanced.html#effectscope)
- [Vue 官方文档 · getCurrentScope](https://vuejs.org/api/reactivity-advanced.html#getcurrentscope)
- [Vue 3 源码 · effectScope.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/effectScope.ts)
- [RFC 0001 Composition API](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0001-composition-api.md)
- [Vue 源码洞察：effectScope 批量 dispose 副作用](_analysis/vue-source-insights.md#effectscope批量dispose副作用) | `packages/reactivity/src/effectScope.ts` 引用
- [Vue 源码洞察：effectScope 与组件 setup 的双向绑定](_analysis/vue-source-insights.md#effectscope与组件setup的双向绑定) | `packages/reactivity/src/effectScope.ts` 引用

<!-- description.md -->
