# useToggle

> 🟡 medium | #Composable Function | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战通过实现 `useToggle` 组合式函数来学习 Composable。

## 挑战代码

```vue
<script setup lang='ts'>

/**
 * Implement a composable function that toggles the state
 * Make the function work correctly
*/
function useToggle() {

}

const [state, toggle] = useToggle(false)

</script>

<template>
  <p>State: {{ state ? 'ON' : 'OFF' }}</p>
  <p @click="toggle">
    Toggle state
  </p>
</template>
```

## 答案

```vue
<script setup lang='ts'>
import { ref } from 'vue'

function useToggle(initialValue = false) {
  const state = ref(initialValue)

  function toggle() {
    state.value = !state.value
  }

  return [state, toggle]
}

const [state, toggle] = useToggle(false)
</script>

<template>
  <p>State: {{ state ? 'ON' : 'OFF' }}</p>
  <p @click="toggle">
    Toggle state
  </p>
</template>
```

## 解释

组合式函数（Composable Function）是 Vue 3 的核心概念，通过将相关逻辑封装在函数中实现复用。`useToggle` 返回一个数组 `[state, toggle]`，调用 `toggle()` 时修改 `state.value`。组合式函数遵循命名约定（以 `use` 开头），体现了 Vue 社区的最佳实践。
