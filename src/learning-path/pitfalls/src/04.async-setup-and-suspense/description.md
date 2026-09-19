> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: async setup + Suspense

# async setup 必须包在 Suspense 内

## 你会学到什么

- `async setup()` 是顶层 await，组件挂载被挂起
- `<Suspense>` 的 `#fallback` 在等待时显示
- 外层直接 await 不触发 fallback，因为不是组件挂载流程

## 错误示例

```vue
<template>
  <UserDetail />  <!-- 不会触发 fallback，挂起在父渲染中 -->
</template>
```

## 修复版本

```vue
<template>
  <Suspense>
    <UserDetail />
    <template #fallback>
      <div>加载中…</div>
    </template>
  </Suspense>
</template>
```

## 动手试

1. 看「错误版本」 — 无 fallback，渲染过程卡住
2. 切换「修复版本」 — fallback 出现，主组件完成后替换

## 根因

`async setup()` 把组件对象变成 Promise-like，渲染器需要 `<Suspense>` 协调 fallback / resolved 切换。父级 await 一个组件实例不进入挂载流程。

## 修复 / 选型

- 顶层 await 数据：用 `<Suspense>` 包裹
- 组件内部异步：用 `onMounted` + loading state
- 路由级：用 `defineAsyncComponent` + router 配置

## 延伸阅读

- [Suspense](https://vuejs.org/guide/built-ins/suspense.html)
- [Vue 源码洞察：Suspense 异步边界与 fallback 触发时机](_analysis/vue-source-insights.md#suspense异步边界与-fallback-触发时机) | `packages/runtime-core/src/components/Suspense.ts:191-220` 引用

## 小结

1. **现象**：async setup 不显示加载态。
2. **复现**：错误版本无 fallback。
3. **修复**：用 `<Suspense>` 包裹。
