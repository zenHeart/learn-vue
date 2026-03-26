# Prop Validation

> 🟢 easy | #Components | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

请验证 `Button` 组件的 `type` prop，只接受以下字符串：`primary | ghost | dashed | link | text | default`，默认值为 `default`。

## 挑战代码

```vue
<script setup>
defineProps({
  type: {},
})
</script>

<template>
  <button>Button</button>
</template>
```

## 答案

```vue
<script setup>
defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => {
      return ['primary', 'ghost', 'dashed', 'link', 'text', 'default'].includes(value)
    }
  }
})
</script>

<template>
  <button>Button</button>
</template>
```

## 解释

Vue 的 `defineProps` 支持以下 prop 验证选项：
- `type` — 指定 prop 的类型（String, Number, Boolean, Array, Object, Function, Symbol）
- `default` — 为 prop 设置默认值
- `validator` — 自定义验证函数，返回 `true` 表示通过

当传入无效的 prop 值时，Vue 会在开发环境给出警告。
