# watch family

> 🟢 easy | #Composition API, #Reactivity:Core | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要使用 `Reactivity API: watch` 完成三个子挑战。

## 挑战代码

```vue
<script setup lang="ts">
import { ref, watch } from "vue"

const count = ref(0)

/**
 * Challenge 1: Watch once
 * Make sure the watch callback is only triggered once
*/
watch(count, () => {
  console.log("Only triggered once")
})

count.value = 1
setTimeout(() => count.value = 2)

/**
 * Challenge 2: Watch object
 * Make sure the watch callback is triggered
*/
const state = ref({
  count: 0,
})

watch(state, () => {
  console.log("The state.count updated")
})

state.value.count = 2

/**
 * Challenge 3: Callback Flush Timing
 * Make sure visited the updated eleRef
*/

const eleRef = ref()
const age = ref(2)
watch(age, () => {
  console.log(eleRef.value)
})
age.value = 18

</script>

<template>
  <div>
    <p>
      {{ count }}
    </p>
    <p ref="eleRef">
      {{ age }}
    </p>
  </div>
</template>
```

## 答案

```vue
<script setup lang="ts">
import { ref, watch } from "vue"

const count = ref(0)

// Challenge 1: Watch once — 使用 { once: true }
watch(count, () => {
  console.log("Only triggered once")
}, { once: true })

count.value = 1
setTimeout(() => count.value = 2)

// Challenge 2: Watch object — 添加 { deep: true }
const state = ref({
  count: 0,
})

watch(state, () => {
  console.log("The state.count updated")
}, { deep: true })

state.value.count = 2

// Challenge 3: Flush timing — 使用 { flush: 'post' }
const eleRef = ref()
const age = ref(2)
watch(age, () => {
  console.log(eleRef.value)
}, { flush: 'post' })

age.value = 18
</script>
```

## 解释

- **Challenge 1**: `watch` 的第三个选项参数中添加 `{ once: true }`，使监听器只触发一次。
- **Challenge 2**: `watch` 默认按引用深度比较。对于嵌套对象，需要 `{ deep: true }` 才能监听深层变化。
- **Challenge 3**: 默认情况下 watch 回调在状态变更前执行，此时 DOM 还未更新。使用 `{ flush: 'post' }` 让回调在 DOM 更新后执行。
