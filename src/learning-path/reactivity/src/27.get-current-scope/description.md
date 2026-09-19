# getCurrentScope 与 effectScope 默认值 {#get-current-scope}

> **版本**：Vue 3.2+ | **状态**：stable | **源码**：`packages/reactivity/src/effectScope.ts:212-220` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/reactivity-advanced.html#getcurrentscope) | [RFC 41](https://github.com/vuejs/rfcs/discussions/209)

`effectScope()` 是 Vue 3.2 引入的「副作用容器」：把一组 `watch` / `watchEffect` / `computed` 收纳到一起，`stop()` 时一并释放。`getCurrentScope()` 则是与之配套的「我现在在哪个 scope 内」查询接口 —— 在 composable 中能判断调用方是否托管了副作用。

## 这是什么 {#what}

```ts
import { effectScope, getCurrentScope } from 'vue'

// 默认 scope：组件 setup 在「隐式」scope 中运行；这里手动开一个子 scope
const scope = effectScope()
scope.run(() => {
  // 在 run 回调里，getCurrentScope() 返回的就是 scope
  console.log(getCurrentScope() === scope) // true
  const stop = watchEffect(() => { /* ... */ })
})

// 离开 run 回调后，又回到外层 scope（或 undefined）
console.log(getCurrentScope()) // 取决于调用点
```

签名：`effectScope(detached?: boolean)`、`getCurrentScope(): EffectScope | undefined`。

## 源码走读 {#source}

```ts
// packages/reactivity/src/effectScope.ts:212-220
export function getCurrentScope(): EffectScope | undefined {
  return activeEffectScope
}

// packages/reactivity/src/effectScope.ts:36-72 (节选)
export class EffectScope {
  detached = false
  constructor(detached = false) {
    if (!detached) {
      recordEffectScope(this, currentScope)   // 父 scope = 当前 scope
    }
  }
  run<T>(fn: () => T): T | undefined {
    if (this._active) {
      const prevScope = activeEffectScope
      activeEffectScope = this
      try { return fn() } finally { activeEffectScope = prevScope }
    }
  }
  stop() { /* 递归释放 _effects / _scopes，调用每条 effect 的 stop */ }
}
```

关键事实：

- `getCurrentScope()` 返回的是模块级变量 `activeEffectScope`，在 `effectScope().run(fn)` 内部被压栈为「当前 scope」。
- 组件 setup 默认在「component scope」里；不需要显式 `run()`，所有副作用自动归到该 scope，组件卸载时被 `stop()`。
- 第三个 scope 参数 `detached: true` 让它**不**挂到父 scope 树中 —— composable 返回的纯 effect 用这个参数避免被调用方意外 stop。

## 实战场景 {#production}

1. **composable 模式**：自定义 `useMouse()` 内部用 `effectScope(true)` 包住 watch，调用方可以自行决定何时 stop。
2. **SSR 跳过副作用**：服务端 setup 期间 `getCurrentScope()` 仍然有值，但 watchEffect / watch 不应该跑 —— `isSSR` 守卫是更直接的做法。
3. **测试隔离**：每个测试 case 套一个独立 scope，结束 `scope.stop()` 一次性清空所有 watch —— 不用手动维护 cleanup 数组。

## 常见踩坑 {#pitfalls}

- `effectScope(detached: true)` 的「detached」指「不挂父 scope」而不是「脱离响应式系统」 —— 内部的 watch 仍然响应式。
- `getCurrentScope()` 在 `run()` 回调**外面**调用，是当前 JS 调用栈的 scope；它不是组件 scope 的长期代理。
- `scope.stop()` 是**幂等**的：重复调用不会重复触发 cleanup。
- composable 直接返回 `scope` 实例时记得标注 `StopHandle` 类型，避免暴露内部细节。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/reactivity-advanced.html#getcurrentscope) | API 文档 |
| [RFC 41](https://github.com/vuejs/rfcs/discussions/209) | effectScope 设计讨论 |
| [Vue 源码 · effectScope.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/effectScope.ts) | EffectScope + getCurrentScope |
| [Vue 源码洞察：EffectScope 的收集时机与批处理](_analysis/vue-source-insights.md#effectscope-xxx) | 隐式经验 |