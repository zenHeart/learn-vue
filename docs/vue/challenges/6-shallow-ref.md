# shallow ref

> 🟢 easy | #Composition API, #Reactivity:Advanced | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要使用 `Reactivity API: shallowRef` 完成。

## 挑战代码

```vue
<script setup lang="ts">
import { shallowRef, watch } from "vue"

const state = shallowRef({ count: 1 })

// Does NOT trigger
watch(state, () => {
  console.log("State.count Updated")
}, { deep: true })

/**
 * Modify the code so that we can make the watch callback trigger.
*/
state.value.count = 2

</script>

<template>
  <div>
    <p>
      {{ state.count }}
    </p>
  </div>
</template>
```

## 答案

对于 `shallowRef`，更改 `.value` 本身才会触发响应。深层变更不会自动触发 watch：

```vue
<script setup lang="ts">
import { shallowRef, watch, triggerRef } from "vue"

const state = shallowRef({ count: 1 })

watch(state, () => {
  console.log("State.count Updated")
}, { deep: true })

// 手动触发
state.value.count = 2
triggerRef(state)
</script>
```

或者直接替换整个 value：

```vue
<script setup lang="ts">
import { shallowRef, watch } from "vue"

const state = shallowRef({ count: 1 })

watch(state, () => {
  console.log("State.count Updated")
})

// 替换整个对象
state.value = { count: 2 }
</script>
```

## 解释

`shallowRef` 只在 `.value` 的引用改变时才会触发更新。修改 `.value` 内部的嵌套属性（如 `count`）不会自动触发。对于深层变更需要手动调用 `triggerRef(state)` 来强制触发更新。
