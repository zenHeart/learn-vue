# effectScope API

> 🟡 medium | #Composition API, #Reactivity:Advanced | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要使用 `effectScope` API，将多个 effect（watch、watchEffect）集中管理，使其在触发一次后一起停止。

## 挑战代码

```vue
<script setup lang="ts">
import { ref, computed, watch, watchEffect } from "vue"

const counter = ref(1)
const doubled = computed(() => counter.value * 2)

// use the `effectScope` API to make these effects stop together after being triggered once

watch(doubled, () => console.log(doubled.value))
watchEffect(() => console.log("Count: ", doubled.value))

counter.value = 2

setTimeout(() => {
  counter.value = 4
})

</script>

<template>
  <div>
    <p>
      {{ doubled }}
    </p>
  </div>
</template>
```

## 答案

```vue
<script setup lang="ts">
import { ref, computed, watch, watchEffect, effectScope } from "vue"

const counter = ref(1)
const doubled = computed(() => counter.value * 2)

const scope = effectScope()

scope.run(() => {
  watch(doubled, () => console.log(doubled.value))
  watchEffect(() => console.log("Count: ", doubled.value))
})

counter.value = 2

setTimeout(() => {
  scope.stop() // 一次性停止 scope 内所有 effect
  counter.value = 4 // 不再触发 watch
}, 100)
</script>
```

## 解释

`effectScope()` 创建一个作用域，将多个响应式 effect（watch、watchEffect、computed）绑定在一起。通过 `scope.run()` 在作用域内运行 effect，通过 `scope.stop()` 一次性停止所有在作用域内创建的 effect，比单独管理每个 watcher 更方便。
