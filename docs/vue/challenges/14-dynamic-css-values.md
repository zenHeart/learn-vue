# Dynamic CSS Values

> 🟢 easy | #CSS Features | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

SFC 的 `<style>` 标签支持将 CSS 值绑定到动态组件上。你知道怎么做吗？

## 挑战代码

```vue
<script setup>
import { ref } from "vue"
const theme = ref("red")

const colors = ["blue", "yellow", "red", "green"]

setInterval(() => {
  theme.value = colors[Math.floor(Math.random() * 4)]
}, 1000)

</script>

<template>
  <p>hello</p>
</template>

<style scoped>
/* Modify the code to bind the dynamic color */
p {
  color: red
}
</style>
```

## 答案

```vue
<script setup>
import { ref } from "vue"
const theme = ref("red")

const colors = ["blue", "yellow", "red", "green"]

setInterval(() => {
  theme.value = colors[Math.floor(Math.random() * 4)]
}, 1000)
</script>

<template>
  <p>hello</p>
</template>

<style scoped>
p {
  color: v-bind(theme)
}
</style>
```

## 解释

Vue 3 支持在 `<style>` 中使用 `v-bind(cssProperty)` 将 CSS 属性绑定到组件的响应式变量。变量的值变化时，CSS 属性会自动更新。这比内联样式更优雅，且仍然受 scoped 限制。
