# DOM Portal

> 🟢 easy | #Components, #Built-ins | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

Vue.js 提供了一个内置组件，可以将插槽内容渲染到 DOM 的另一部分。你知道是哪个组件吗？

## 挑战代码

```vue
<script setup>

const msg = "Hello World"

</script>

<template>
  <!-- Renders it to a child element of the `body` -->
  <span>{{ msg }}</span>
</template>
```

## 答案

使用 `<Teleport>` 内置组件：

```vue
<script setup>
const msg = "Hello World"
</script>

<template>
  <Teleport to="body">
    <span>{{ msg }}</span>
  </Teleport>
</template>
```

## 解释

`<Teleport>` 是 Vue 3 的内置组件，可以将子组件/HTML 挂载到 DOM 树的其他位置。`to` 属性指定目标元素（CSS 选择器或 DOM 元素）。常用于模态框、Toast 通知等需要脱离当前组件层级的 UI 场景。
