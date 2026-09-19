> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/reactivity/src/effectScope.ts:47-62, 162-195` | **延伸阅读**：[Vue 官方 · effectScope](https://cn.vuejs.org/api/reactivity-advanced.html#effectscope)

# `effectScope(true)` detached / parent / 二次 `onScopeDispose`

## 这是什么

`effectScope(detached?: boolean)` 接受一个可选参数：

- `detached: false`（默认）：scope 注册到当前活跃 scope（组件 scope）的 `scopes[]` 中，父 scope 停止时**递归 stop 子 scope**。
- `detached: true`：scope **不**注册到父 scope，独立存活——父 scope 停止不影响它。

源码 `effectScope.ts:47-62`：

```ts
constructor(public detached = false) {
  if (!detached && activeEffectScope) {
    if (activeEffectScope.active) {
      this.parent = activeEffectScope
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1
    } else {
      // 父 scope 已 stop，子 scope 不能成为 detached 的活 scope
      this._active = false
      this._warnOnRun = false
    }
  }
}
```

`onScopeDispose(fn, failSilently?)` 第二个参数 `failSilently: true` 用于**异步上下文**：当 scope 已 stop 或不在 scope 内时，不打印警告（常用于 SSR / 异步分支的清理）。

## 与 SSR 关系

在 SSR 渲染期间没有真实 DOM，`onScopeDispose` 注册的清理函数**不会**在请求结束时自动触发——需要手动 `scope.stop()`。`failSilently: true` 让你在 setup 异步分支（`await` 之后）注册清理时不会因 scope 已 stop 而报警。

## 实战场景

1. **跨请求数据隔离**：`scope = effectScope()` 配合 `app.runWithContext()` 在每个 SSR 请求里独立创建，结束时统一 stop。
2. **store 内部独立 scope**：Pinia store 自带 detached scope，组件卸载不影响 store 状态。
3. **异步任务管理**：用 `scope.run(async () => { ... })` 注册多个 watcher / computed，请求完成 `scope.stop()`。

## 常见踩坑

- **`scope.run(fn)` 之外创建的 effect** 不会注册到 scope——它们会绑定到上层 scope（或 detached 状态），导致清理错位。
- **detached scope 不被父 stop**：不要把它当成"短生命周期"使用，否则会内存泄漏。
- **`scope.parent` 只读**：`scope.stop(fromParent?: boolean)` 接受 fromParent 参数标记"是从父 scope 递归调用"——手动调用别传这个参数。
- **`scope.parent` 仅对非 detached 有效**：detached scope 的 `.parent` 永远是 `undefined`。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · effectScope](https://cn.vuejs.org/api/reactivity-advanced.html#effectscope) | API 文档 |
| [Vue 官方 · getCurrentScope](https://cn.vuejs.org/api/reactivity-advanced.html#getcurrentscope) | 当前 scope |
| [Vue 源码 · effectScope.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/effectScope.ts) | 完整实现 |
| [Pinia 源码 · setupStore](https://github.com/vuejs/pinia/blob/main/packages/pinia/src/store.ts) | 真实世界里 detached scope 的使用 |

<!-- description.md -->
