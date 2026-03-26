# Next DOM Update Flush

> 🟢 easy | #Global API:General | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

当修改响应式状态时，DOM 的更新不会同步生效。Vue.js 提供了一个工具函数来等待下一次 DOM 更新刷新后执行回调。

## 挑战代码

```vue
<script setup>
import { ref } from "vue"

const count = ref(0)

function increment() {
  count.value++

  /**
   * DOM is not yet updated, how can we make sure that the DOM gets updated
   * Make the output be true
  */

  console.log(+document.getElementById("counter").textContent === 1)
}
</script>

<template>
  <button id="counter" @click="increment">
    {{ count }}
  </button>
</template>
```

## 答案

```vue
<script setup>
import { ref, nextTick } from "vue"

const count = ref(0)

async function increment() {
  count.value++

  await nextTick()

  console.log(+document.getElementById("counter").textContent === 1)
}
</script>
```

## 解释

`nextTick()` 是 Vue 3 的全局 API，用于等待 DOM 更新完成后再执行后续代码。状态变更后 Vue 会异步更新 DOM，`nextTick()` 返回一个 Promise，确保代码在 DOM 更新完成后再执行。

Vue 2 中对应的 API 是 `Vue.nextTick()`。
