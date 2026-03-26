# losing reactivity

> 🟢 easy | #Composition API, #Reactivity:Utilities | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

在 JavaScript 中我们经常解构/展开对象。在 Vue.js 中也可以对 `reactive` 对象进行解构，但解构后的属性会失去响应性。

如何确保解构后的属性仍然保持响应性？

## 挑战代码

```vue
<script setup lang="ts">
import { reactive } from "vue"

function useCount() {
  const state = reactive({
    count: 0,
  })

  function update(value: number) {
    state.count = value
  }

  return {
    state,
    update,
  }
}

// Ensure the destructured properties don't lose their reactivity
const { state: { count }, update } = useCount()

</script>

<template>
  <div>
    <p>
      <span @click="update(count-1)">-</span>
      {{ count }}
      <span @click="update(count+1)">+</span>
    </p>
  </div>
</template>
```

## 答案

使用 `toRefs` 将 reactive 对象的所有属性转为 ref：

```vue
<script setup lang="ts">
import { reactive, toRefs } from "vue"

function useCount() {
  const state = reactive({
    count: 0,
  })

  function update(value: number) {
    state.count = value
  }

  return {
    state,
    update,
  }
}

// toRefs 保证解构后的属性保持响应性
const { state, update } = toRefs(useCount())
const count = state.value.count // 需要通过 .value 访问
</script>
```

或者更简洁地：

```vue
<script setup lang="ts">
import { reactive, toRefs } from "vue"

function useCount() {
  const state = reactive({
    count: 0,
  })

  function update(value: number) {
    state.count = value
  }

  return toRefs({ state, update })
}

const { state, update } = useCount()
</script>

<template>
  <div>
    <p>
      <span @click="update.value(state.count - 1)">-</span>
      {{ state.count }}
      <span @click="update.value(state.count + 1)">+</span>
    </p>
  </div>
</template>
```

## 解释

`toRefs` 将 reactive 对象的每个属性转换为关联的 ref，保持响应性关联。解构 reactive 对象时，如果不使用 `toRefs`，得到的只是原始值而非响应式 ref，视图不会自动更新。
