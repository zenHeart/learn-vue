# app.runWithContext：在组件外执行 provide/inject {#app-run-with-context}

> 版本: Vue 3.3+ | RFC: 0021-app-run-with-context | 状态: stable

`provide()` 默认只能在组件 `setup()` 内调用 —— 因为它依赖**当前激活的组件实例**（`currentInstance`）作为 provide 的归属者。`app.runWithContext(cb)` 让你在**组件外的纯函数/工具代码**里也能访问当前 app 注册过的 `provide`。

## 用法 {#usage}

```ts
const app = createApp(Root)
app.provide('API_URL', 'https://api.example.com')

// 组件外（工具函数 / store / 插件）
function fetchApi(path: string) {
  return app.runWithContext(() => {
    const url = inject('API_URL') as string
    return fetch(url + path)
  })
}
```

`runWithContext` 临时把当前 `appContext` 设为激活态，**只在回调内有效**；不会污染其他代码。

## 为什么需要它 {#why}

Vue 3.3 之前，组件外调用 `inject()` 会抛：
> `inject() can only be used inside setup() or functional components.`

常见需求：

- **composable 工厂**：被组件调用，但内部异步获取了 token 后想再次 inject 上下文值。
- **Store / Pinia 外部初始化**：拿不到 currentInstance。
- **工具函数库**：想用 `inject('i18n')` 但不希望每个调用点都包一层组件。

## 关键陷阱 {#pitfalls}

1. **`app` 必须是同一个 app 实例**（同一 `createApp` 返回值）。多 root app 互不可见。
2. **回调内同步使用**：`runWithContext` 不等待异步；超过 `await` 后激活态已经退出，**await 之后再 inject 会失效**。需要多次拿值：同步读出变量后再用。
3. **嵌套**：内层 `runWithContext` 临时覆盖外层；返回后自动还原。
4. **`runWithContext` 不会**创建组件实例，只是借用 provide map。

## 实战对比 {#production}

```ts
// ❌ 旧写法（3.3 之前）：报 "no current instance"
import { inject } from 'vue'
export function useI18n() { return inject('i18n') }

// ✅ 3.3+：显式接受 app 实例
import { inject } from 'vue'
import type { App } from 'vue'
export function useI18n(app: App) {
  return app.runWithContext(() => inject('i18n'))
}
```

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · app.runWithContext](https://vuejs.org/api/application.html#app-runwithcontext)
- [Vue 3 源码 · apiInject.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiInject.ts)
- [RFC 0021 app.runWithContext](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0021-inject-in-functional-component.md)

<!-- description.md -->
