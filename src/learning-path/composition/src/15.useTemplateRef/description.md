> 版本: Vue 3.5+ | RFC: 0021-use-template-ref | 状态: stable (3.5+)

# useTemplateRef 模板 ref

Vue 3.5 引入了 `useTemplateRef()`，用于替代 3.x 之前的字符串 ref（`ref="el"` + `const el = ref(null)`）。它在编译期感知模板字符串字面量，给出更好的类型推断。

## 这是什么

```vue
<template>
  <input ref="inputRef" />
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
inputRef.value?.focus()
</script>
```

旧写法（3.5 之前仍兼容）：

```ts
import { ref } from 'vue'
const inputEl = ref<HTMLInputElement | null>(null)
```

## Vue 怎么实现

- 入口：`packages/runtime-core/src/apiTemplateRef.ts` 的 `useTemplateRef`
- 实现：内部创建一个 `ref(null)`，并通过 `template ref="..."` 的字符串 key 绑定；编译期额外注入 SSR 占位
- 类型推断：`useTemplateRef<T>` 中的 T 是目标元素的类型，IDE 可以基于此推断 `.value`

## 实战中什么时候用 / 什么时候不用

**用**：

- 表单聚焦、富文本编辑器、命令面板等命令式 DOM 操作
- 业务组件内部需要子组件实例

**不用**：

- 响应式数据流的场景——继续用 `ref()` + `v-model`
- 子组件通信：使用 `defineExpose` + `ref` 暴露 API

## 官方文档延伸阅读

- https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref
- https://cn.vuejs.org/guide/essentials/template-refs.html

## 常见踩坑

- 字符串 key 必须与模板中的 `ref="..."` 一致
- 在 `v-for` 中使用 `useTemplateRef` 不直接支持；需要用 `ref` + 数组管理
- SSR 场景：模板 ref 在 setup 期间不可用，因为 DOM 还未生成

## 延伸阅读

- https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref
- https://cn.vuejs.org/guide/essentials/template-refs.html
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiTemplateRef.ts
- https://github.com/vuejs/rfcs/discussions/557
- https://github.com/vuejs/core/blob/main/CHANGELOG.md (3.5 release)
- [Vue 源码洞察：模板 ref 在 v-for 中的收集顺序与异步包装](_analysis/vue-source-insights.md#模板-ref-在-v-for-中的收集顺序与异步包装) | `packages/runtime-core/src/rendererTemplateRef.ts:24-58` 引用
