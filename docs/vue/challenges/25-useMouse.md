# useMouse

> 🟡 medium | #Composable Function | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

使用 Vue.js 时应该关注可复用性。Composable 是实现这一点的绝佳方式。

## 挑战代码

```vue
<script setup lang="ts">

// Implement ...
function useEventListener(target, event, callback) {

}

// Implement ...
function useMouse() {
  useEventListener(window, "mousemove", () => {})
}
const { x, y } = useMouse()
</script>

<template>Mouse position is at: {{ x }}, {{ y }}</template>
```

## 答案

```vue
<script setup lang="ts">
import { ref } from "vue"

function useEventListener(target, event, callback) {
  target.addEventListener(event, callback)
}

function useMouse() {
  const x = ref(0)
  const y = ref(0)

  useEventListener(window, "mousemove", (e: MouseEvent) => {
    x.value = e.clientX
    y.value = e.clientY
  })

  return { x, y }
}

const { x, y } = useMouse()
</script>

<template>Mouse position is at: {{ x }}, {{ y }}</template>
```

## 解释

`useMouse` 组合式函数封装了鼠标位置追踪的逻辑：
1. `useEventListener` 封装了 `addEventListener`，用于注册事件监听
2. `useMouse` 通过 `useEventListener` 监听 `mousemove` 事件，更新 `x` 和 `y` 坐标

这两个 composable 都展示了组合式函数的核心思想：封装和复用有状态逻辑。
