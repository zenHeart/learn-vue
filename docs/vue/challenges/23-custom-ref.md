# Custom Ref

> 🔴 hard | #Composition API, #Reactivity:Advanced | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

防抖函数在输入框操作场景中非常有用。在 Vue.js 中，一个防抖 ref 更加灵活。

## 挑战代码

```vue
<script setup>
import { watch } from "vue"

/**
 * Implement the function
*/
function useDebouncedRef(value, delay = 200) {

}
const text = useDebouncedRef("hello")

/**
 * Make sure the callback only gets triggered once when entered multiple times in a certain timeout
*/
watch(text, (value) => {
  console.log(value)
})
</script>

<template>
  <input v-model="text" />
</template>
```

## 答案

```vue
<script setup>
import { customRef } from "vue"

function useDebouncedRef(value, delay = 200) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      }
    }
  })
}

const text = useDebouncedRef("hello")

watch(text, (value) => {
  console.log(value)
})
</script>

<template>
  <input v-model="text" />
</template>
```

## 解释

`customRef` 是 Vue 提供的自定义 ref 工厂函数。接收一个工厂函数，返回一个有明确 get/set 追踪逻辑的 ref。`track()` 告诉 Vue 需要追踪这个值的变化，`trigger()` 通知 Vue 重新渲染。

这个实现通过在 `set` 中使用 `setTimeout` 实现防抖：只有当用户在 `delay` 时间内停止输入后，值才会真正更新并触发响应。
