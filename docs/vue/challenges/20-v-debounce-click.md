# v-debounce-click

> 🟡 medium | #Directives | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要实现一个防抖点击指令 `v-debounce-click`，在快速连续点击时只触发一次回调，并支持设置延迟时间。

## 挑战代码

```vue
<script setup lang='ts'>

/**
  * Implement the custom directive
  * Make sure the `onClick` method only gets triggered once when clicked many times quickly
  * And you also need to support the debounce delay time option. e.g `v-debounce-click:ms`
  *
*/

const VDebounceClick = {

}

function onClick() {
  console.log("Only triggered once when clicked many times quickly")
}

</script>

<template>
  <button v-debounce-click:200="onClick">
    Click on it many times quickly
  </button>
</template>
```

## 答案

```vue
<script setup lang='ts'>
import { Directive } from 'vue'

const VDebounceClick: Directive = {
  mounted(el, binding) {
    let timer: ReturnType<typeof setTimeout> | null = null
    const delay = binding.arg ? parseInt(binding.arg as string) : 500

    el.addEventListener('click', () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        binding.value()
      }, delay)
    })
  }
}

function onClick() {
  console.log("Only triggered once when clicked many times quickly")
}
</script>

<template>
  <button v-debounce-click:200="onClick">
    Click on it many times quickly
  </button>
</template>
```

## 解释

- `binding.arg` 获取传递给指令的参数（如 `v-debounce-click:200` 中的 `200`）
- `binding.value` 获取传递给指令的回调函数
- 使用 `setTimeout` + `clearTimeout` 实现防抖逻辑：在指定延迟内再次点击会清除前一个定时器，重新计时
