# useId 在 SSR 中的稳定 id 生成 {#use-id-ssr}

> **版本**：Vue 3.5+ | **状态**：stable | **源码**：`packages/runtime-core/src/helpers/useId.ts:1-30` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/composition-api-helpers.html#useid) | [RFC 236](https://github.com/vuejs/rfcs/discussions/345)

`useId()` 是 Vue 3.5 新增的稳定 id 生成器，专门解决两个问题：
1. **多个同名组件**在同一页面需要互不冲突的 id（label / aria / form）；
2. **SSR 注水**时客户端和服务端生成的 id 必须一致，否则 hydration mismatch 会丢失表单状态、aria 关联。

它使用组件层级作为种子，配合 `<App useId="...">` 嵌套上下文来保证稳定 —— 跟「随机数 + 同步等待」「递增计数器」这些手动方案相比，它免费拿到了 SSR 一致性 + 自动清理。

## 这是什么 {#what}

```vue
<template>
  <label :for="id">Name</label>
  <input :id="id" v-model="name" />
</template>

<script setup>
import { useId, ref } from 'vue'
const id = useId()                       // 服务端 / 客户端均产生 "v-0"
const name = ref('')
</script>
```

如果同一页面出现两次 `<MyField />`，它们拿到的 id 分别是 `v-0`、`v-1`，互不干扰。

## 源码走读 {#source}

```ts
// packages/runtime-core/src/helpers/useId.ts
export function useId(): string {
  const i = getCurrentInstance()
  if (!i) return ''
  // 取组件层级深度 + 节点路径，作为 id 种子
  const appId = i.appContext.app._appId ?? ''  // 父 appId 用于跨 SSR/CSR 对齐
  const treeId = (i.ids ?? []).join('+')
  return `${appId}-${treeId}`
}
```

实现细节：

- 服务端 `renderToString` 期间，组件按渲染顺序被编号；同一颗渲染树产生的 id 在不同请求间互不污染（用 `app._appId` 做隔离）。
- 客户端 hydrate 时，复用服务端已经在 `instance.ids` 里写好的路径，确保客户端 `useId()` 重新调用拿到的是同一个值。

## 实战场景 {#production}

1. **表单 label / aria 关联**：`<label :for="id">` + `<input :id="id">` —— 不再需要外层传入 prop。
2. **同一页面多个表单实例**：搜索条件表单、模态框表单之间不会 id 冲突。
3. **SSR 安全**：服务端 / 客户端拿到的 id 是稳定的，避免 hydration mismatch 把 `<select>` 的 `selected` 状态丢光。
4. **调试区分**：`id` 是确定性的，可以直接 grep 组件树定位。

## 常见踩坑 {#pitfalls}

- **不要和 Math.random() 混用**：hydration 阶段客户端会重新生成随机 id，导致 mismatch。
- **不要用作 v-for 的 :key**：每次列表顺序变化时 id 也会变，破坏 diff；用 `item.id` 才是稳定 key。
- **scope 内重复创建组件**：比如一个循环里 `<MyField v-for />`，每次 `useId()` 都会拿到一个新值；这是预期的。
- **appId 重置**：每次 `createApp()` 都有独立 `appId`；手动写测试时同一组件在两个 `createApp` 下会得到不同 id。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/composition-api-helpers.html#useid) | API 文档 |
| [RFC 236](https://github.com/vuejs/rfcs/discussions/345) | useId 设计讨论 |
| [Vue 源码 · useId.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/helpers/useId.ts) | 入口实现 |
| [Vue 源码洞察：useId 的 SSR 稳定种子](_analysis/vue-source-insights.md#useid-xxx) | 隐式经验 |