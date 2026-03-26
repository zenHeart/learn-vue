# Dependency Injection

> 🟢 easy | #Composition API | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要使用 `Composition API: Dependency Injection` 将父组件的 `count` 值注入到子组件中。

## 挑战代码

```vue
// Child.vue

<script setup lang="ts">
// Add a piece of code to make the `count` value get injected into the child component.
</script>

<template>
  {{ count }}
</template>
```

## 答案

```vue
// Child.vue
<script setup lang="ts">
import { inject } from "vue"

// 注入由父组件 provide 的 count
const count = inject('count')
</script>

<template>
  {{ count }}
</template>
```

父组件中需要使用 provide：

```vue
// Parent.vue
<script setup lang="ts">
import { ref, provide } from "vue"

const count = ref(0)
provide('count', count)
</script>
```

## 解释

- `provide(key, value)` 在父组件中提供数据
- `inject(key)` 在子组件中获取注入的数据
- 形成父子组件间的 "依赖注入" 链，避免层层 prop 传递

`inject` 还可以设置默认值和类型：

```ts
const count = inject('count', defaultValue)
const count = inject<Ref<number>>('count')
```
