# writable computed

> 🟢 easy | #Composition API, #Reactivity:Core | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要创建一个可写的 computed ref。

## 挑战代码

```vue
<script setup lang="ts">
import { ref, computed } from "vue"

const count = ref(1)
const plusOne = computed(() => count.value + 1)

/**
 * Make the `plusOne` writable.
 * So that we can get the result `plusOne` to be 3, and `count` to be 2.
*/

plusOne.value++

</script>

<template>
  <div>
    <p>{{ count }}</p>
    <p>{{ plusOne }}</p>
  </div>
</template>
```

## 答案

为 `computed` 添加 `get` 和 `set` 函数，使其可写：

```vue
<script setup lang="ts">
import { ref, computed } from "vue"

const count = ref(1)
const plusOne = computed({
  get: () => count.value + 1,
  set: (val) => { count.value = val - 1 }
})

plusOne.value = 3 // count.value 变为 2, plusOne 变为 3
</script>

<template>
  <div>
    <p>{{ count }}</p>
    <p>{{ plusOne }}</p>
  </div>
</template>
```

## 解释

`computed()` 默认只接收一个 getter 函数，返回只读的响应式值。传入一个带有 `get` 和 `set` 的对象时，computed ref 就变为可写的：读取时调用 `get`，写入时调用 `set`。
