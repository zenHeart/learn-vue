# hasInjectionContext 跨组件边界

> 版本：Vue 3.3+ | 状态：stable | 源码：`packages/runtime-core/src/apiInject.ts` | 延伸阅读：[Vue 官方：hasInjectionContext](https://cn.vuejs.org/api/composition-api-dependency-injection.html#hasinjectioncontext)

## 这是什么

`hasInjectionContext()` 是 Vue 3.3 引入的**内部 API**，返回 boolean 表示「当前调用是否在有效的 `inject()` 上下文内」。它用于判断当前栈是否处于 setup 同步阶段、是否有活跃的 component instance。

典型用途：

- 编写跨组件通用工具时，区分「setup 内调用」与「普通函数调用」；
- 与 `app.runWithContext()` 搭配（Vue 3.3+），脱离组件树也能临时构造出注入上下文。

## 源码走读

```ts
// packages/runtime-core/src/apiInject.ts:24
export function hasInjectionContext(): boolean {
  return !!(currentApp || currentInstance)
}
```

`currentApp` 由 `app.runWithContext()` 设置；`currentInstance` 在 setup 同步阶段被赋值。

## 实战场景

1. composable 内部需要访问 `inject()` 提供的能力，先 `hasInjectionContext()` 守护；
2. 与 `app.runWithContext()` 配合，在异步回调（如 setTimeout、Promise.then）中临时启用 inject；
3. 在组件库开发中判断调用方是不是「被组件包裹」。

## 常见踩坑

- `currentInstance` 仅在 setup **同步**执行期存在；await 之后即丢失；
- 若想跨 await 访问 inject，必须用 `app.runWithContext(fn)` 显式构造上下文；
- 该 API 文档标注为"advanced / internal"，未来可能调整——避免依赖。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方：hasInjectionContext](https://cn.vuejs.org/api/composition-api-dependency-injection.html#hasinjectioncontext) | API |
| [Vue 官方：app.runWithContext](https://cn.vuejs.org/api/application.html#app-runwithcontext) | 上下文延续 |
| [Vue 源码：apiInject.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiInject.ts) | 24 行 |