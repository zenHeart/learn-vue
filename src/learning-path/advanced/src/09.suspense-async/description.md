> 版本: Vue 3.x | 状态: stable (3.5+ 增加了 onPending / onResolve / onFallback 事件)

# Suspense 异步加载与回退

`<Suspense>` 是 Vue 3 用于管理异步依赖的内置组件。它会在树中所有 async setup / async component 完成前显示 `#fallback`，完成后切换到 `#default`。

## 这是什么

```vue
<Suspense>
  <template #default>
    <AsyncPage />
  </template>
  <template #fallback>
    <Loading />
  </template>
</Suspense>
```

触发 Suspense 的条件：

1. 子组件 `setup` 是 `async` 函数（顶层 await）
2. 子组件通过 `defineAsyncComponent` 异步加载，且 `suspensible: true`
3. 递归地：子组件的子组件同样需要异步

## Vue 怎么实现

- 入口：`packages/runtime-core/src/components/Suspense.ts`
- 渲染器维护 `pendingBranch` / `activeBranch`：组件 patch 阶段检测到 async 状态时挂起，挂起时显示 fallback
- 3.5+ 增加 `onPending` / `onResolve` / `onFallback` 事件，可在 `<script setup>` 中通过 `on()` 监听

## 实战中什么时候用 / 什么时候不用

**用**：

- 顶层 `<Suspense>` 包裹 async setup 的页面
- 路由级别 fallback
- 嵌套异步组件时让外层统一等待

**不用**：

- 普通同步组件树
- 与 loading 状态混淆——Suspense 只在初始加载时显示 fallback

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/built-ins/suspense.html
- https://cn.vuejs.org/api/built-in-components.html#suspense

## 常见踩坑

- `<Suspense>` 的 fallback 仅在初始加载时显示；后续异步不会重新显示
- `v-if` 切换重新创建子组件时会再次触发 Suspense 等待
- 嵌套 Suspense 时，内层 resolve 后外层才 resolve

## 延伸阅读

- https://cn.vuejs.org/guide/built-ins/suspense.html
- https://cn.vuejs.org/api/built-in-components.html#suspense
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/Suspense.ts
- https://github.com/vuejs/rfcs/discussions/270
- https://github.com/vuejs/rfcs/discussions/571 (3.5 增强)
- [Vue 源码洞察：Suspense 异步边界与 fallback 触发时机](_analysis/vue-source-insights.md#suspense异步边界与-fallback-触发时机) | `packages/runtime-core/src/components/Suspense.ts:191-220` 引用
