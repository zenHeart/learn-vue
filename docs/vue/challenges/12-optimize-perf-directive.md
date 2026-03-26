# Optimize Performance Directive

> 🟡 medium | #Directives, #Built-ins | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

Vue.js 提供了一个内置指令，只渲染元素和组件一次，并跳过后续更新。你知道是哪个指令吗？

## 挑战代码

```vue
<script setup>
import { ref } from "vue"

const count = ref(0)

setInterval(() => {
  count.value++
}, 1000)
</script>

<template>
  <span>Make it not to change: {{ count }}</span>
</template>
```

## 答案

使用 `v-once` 指令：

```vue
<script setup>
import { ref } from "vue"

const count = ref(0)

setInterval(() => {
  count.value++
}, 1000)
</script>

<template>
  <span v-once>Make it not to change: {{ count }}</span>
</template>
```

## 解释

`v-once` 是 Vue 的内置指令，用于只渲染元素/组件一次。之后的更新会被跳过，不会重新渲染。这对于静态内容或性能优化场景非常有用。注意：`v-once` 会导致渲染结果在首次渲染后被缓存，无法再更新。
