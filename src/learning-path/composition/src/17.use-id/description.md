# useId：SSR 安全 ID 生成 {#use-id}

> 版本: Vue 3.5+ | RFC: 0236-use-id | 状态: stable

`useId()` 返回一个**应用内唯一**的字符串 ID，主要解决两个问题：

1. **SSR 水合一致性**：服务端渲染时同一组件树在客户端 hydrate 时必须生成相同的 ID，避免 mismatch warning。
2. **可访问性（a11y）**：`<label for="...">` / `aria-describedby` 需要稳定 ID。

## SSR 行为 {#ssr-behavior}

- **服务端**：`useId()` 在请求内自增生成 `v-0`、`v-1` ...；同一渲染树内多次调用保证确定性。
- **客户端 hydrate**：Vue 会复用服务器传入的 ID，**不会重新生成**。
- **多次挂载（多个 createApp / 多页面）**：每个应用独立计数，全局不冲突。

## 常见用法 {#usage}

```vue
<template>
  <label :for="id">用户名</label>
  <input :id="id" v-model="username" />
</template>

<script setup>
const id = useId()
const username = ref('')
</script>
```

## 关键陷阱 {#pitfalls}

1. **同一 setup 内多次调用**会得到**不同**的 ID（每次自增）。如需稳定 ID for + aria-describedby 双向引用，调用一次存为变量。
2. **不要依赖 ID 格式**：Vue 不保证以 `v-` 开头，未来可能变。
3. **`useId()` 必须在 setup 同步阶段调用**，不能在 watchEffect / 异步回调内。
4. **不应用于 DOM 元素 `id` 属性以外的场景**（如组件 key 或路由参数），Vue 警告。

## 实战对比 {#production}

| 场景 | 用 `useId()` | 用 `nanoid()` / 自增 |
| --- | --- | --- |
| label/input 关联 | ✓ SSR 安全 | 服务端客户端不一致 |
| 测试隔离（每次渲染新 ID） | ✗ 重复 mount 会得到不同 ID | ✓ |
| 唯一 key for v-for | ✗ | ✓（v-for 用 item.id 更合适） |

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · useId](https://vuejs.org/api/composition-api-helpers.html#useid)
- [Vue 3 源码 · useId](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiSetupHelpers.ts)
- [RFC 0236 useId](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0236-use-id.md)

<!-- description.md -->
