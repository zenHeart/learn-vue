# Lifecycle Hooks

> 🟢 easy | #Composition API, #Lifecycle | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战关于生命周期钩子。当子组件被切换时，定时器会异常工作，需要修复此问题。

## 挑战代码

```vue
// Child.vue

<script setup lang="ts">
import { onMounted, inject } from "vue"

const timer = inject('timer')
const count = inject('count')

onMounted(() => {
  // The timer will work abnormally when the child component is toggled. Lets fix it.
  timer.value = window.setInterval(() => {
    count.value++
  }, 1000)
})

</script>

<template>
  <div>
    <p>
      Child Component: {{ count }}
    </p>
  </div>
</template>
```

## 答案

在组件卸载时清除定时器：

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, inject } from "vue"

const timer = inject('timer')
const count = inject('count')

onMounted(() => {
  timer.value = window.setInterval(() => {
    count.value++
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer.value)
})
</script>
```

## 解释

`onUnmounted()` 在组件卸载时调用。当子组件被移除（如 v-if 切换）时，组件实例会被销毁，此时必须清除定时器，否则：
1. 定时器仍在后台运行（内存泄漏）
2. 重新挂载组件会创建新的定时器（多个定时器同时运行）

Vue 3 还提供 `onBeforeUnmount()` 在卸载前执行清理操作。
