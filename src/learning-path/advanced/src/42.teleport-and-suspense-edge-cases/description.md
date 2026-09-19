> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/components/Teleport.ts`、`packages/runtime-core/src/components/Suspense.ts` | **延伸阅读**：[Vue 官方 · Teleport](https://vuejs.org/guide/built-ins/teleport.html) | [Vue 官方 · Suspense](https://vuejs.org/guide/built-ins/suspense.html)

# Teleport 嵌套 + Suspense 错误边界 + Transition 三组合

## 这是什么

Teleport 和 Suspense 都是 Vue 3 的内置组件，但**单独用它们的边界场景**容易踩坑。本节聚焦三个容易出错的复合用法：

1. **Teleport 嵌套**：内层 `<Teleport>` 嵌在外层 `<Teleport>` 内部时，渲染目标是「最近 Teleport 的 to」还是「最终落点」？
2. **Teleport + Transition**：传送节点上的过渡如何保留？传送过程中事件如何触发？
3. **Suspense 错误边界**：异步 setup 抛出错误时，Suspense 的 `errorCaptured` 与 `onErrorCaptured` 谁先收到？

## 源码走读

```ts
// packages/runtime-core/src/components/Teleport.ts
// Teleport 在 patch 阶段把 children 搬到 target 容器，但保留子树的响应式
// 与父组件的 component tree 一致（即子组件仍「属于」父组件）

// packages/runtime-core/src/components/Suspense.ts
// Suspense 内部维护一个 status 状态机：
// pending → resolved → (default 替换 pendingContent)
// pending → fallback (resolvedContent 渲染失败时)
```

## Teleport 嵌套规则

| 结构 | 实际渲染位置 |
|---|---|
| `<Teleport to="#a"><Teleport to="#b">` | 节点落到 `#b` 容器内（内层 Teleport 优先生效） |
| `<Teleport to="#a"><Teleport :to="undefined">` | 节点保留在父组件 DOM 树 |
| `disabled` Teleport 嵌套 | 内层 Teleport 退化为「不传送」 |

> Vue 3.5+ 引入了 `defer` prop，让 Teleport 等到挂载后再传送 —— 用于 SSR 场景避免 hydration mismatch。

## Suspense 错误边界

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncChild />   <!-- 异步 setup 抛错 -->
    </template>
    <template #fallback>
      <Loading />
    </template>
    <template #error="err">
      <ErrorView :err="err" />
    </template>
  </Suspense>
</template>
```

- `onErrorCaptured` 在组件树中**先于** Suspense 的 `#error` 触发。
- 异步错误（`await` 抛出的 Promise rejection）会被 Suspense 捕获；同步错误走 `errorCaptured` 链路。
- 多个 Suspense 嵌套时，最内层先处理错误。

## 三组合：Teleport + Suspense + Transition

实战中常见的「全屏 loading 弹窗」需要三者协作：

```vue
<Suspense>
  <AsyncPage>
    <!-- 内容渲染到 body 下方 -->
    <Teleport to="#modal-root">
      <Transition name="fade">
        <Modal v-if="open" />
      </Transition>
    </Teleport>
  </AsyncPage>
  <template #fallback>
    <Teleport to="#modal-root">
      <Spinner />
    </Teleport>
  </template>
</Suspense>
```

## 实战场景

1. **Modal 库根节点**：`<Teleport to="body">` 让弹窗脱离父组件的 overflow / z-index 上下文。
2. **多 Modal 嵌套**：每层 Teleport 到独立的容器，按优先级排序显示。
3. **路由级 loading**：Suspense 包路由组件，外层显示 skeleton；内层任意组件抛错都被 Suspense 捕获。
4. **Toast / 全局通知**：Teleport 到固定容器，Transition 控制淡入淡出。

## 常见踩坑

- **Teleport 嵌套目标缺失**：内层 Teleport 的 `to` 必须在 DOM 中存在；用 `disabled` prop 兜底。
- **Suspense 异步 setup 错误未捕获**：异步抛错前必须确保父链上有 Suspense，否则错误冒泡到 `app.config.errorHandler`。
- **Teleport + v-if + Transition**：v-if 节点在 Teleport 内部时，Transition 仍然生效；但需要在 Teleport 容器上挂 `<Transition>`，不要挂在 v-if 上。
- **Suspense `suspensible` prop**：默认会让根 Suspense 接收所有异步子组件的 pending；复杂布局慎用。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · Teleport](https://vuejs.org/guide/built-ins/teleport.html) | Teleport 完整 API |
| [Vue 官方 · Suspense](https://vuejs.org/guide/built-ins/suspense.html) | Suspense 异步 setup 模式 |
| [Vue 源码 · Teleport.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/Teleport.ts) | target 容器解析 |
| [Vue 源码 · Suspense.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/Suspense.ts) | pending / resolved 状态机 |