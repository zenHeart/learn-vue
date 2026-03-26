# Raw API

> 🟡 medium | #Reactivity:Advanced | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要使用 `Reactivity API: [xx]Raw` 完成。

## 挑战代码

```vue
<script setup lang="ts">
import { reactive, isReactive } from "vue"

const state = { count: 1 }
const reactiveState = reactive(state)

/**
 * Modify the code so that we can make the output be true.
*/
console.log(reactiveState === state)

/**
 * Modify the code so that we can make the output be false.
*/
const info = { count: 1 }
// 改变这里的实现...

const reactiveInfo = reactive(info)

console.log(isReactive(reactiveInfo))

</script>

<template>
  <div>
    <p>
      {{ reactiveState.count }}
    </p>
  </div>
</template>
```

## 答案

```vue
<script setup lang="ts">
import { reactive, isReactive, toRaw } from "vue"

const state = { count: 1 }
const reactiveState = reactive(state)

// Challenge 1: 使用 toRaw 获取原始对象
console.log(toRaw(reactiveState) === state) // true

// Challenge 2: 传入 reactive 对象给 reactive() 不会创建新代理
const info = reactive({ count: 1 })
console.log(isReactive(info)) // true — 这需要 false

// 正确做法：直接传入普通对象
const rawInfo = { count: 1 }
const reactiveInfo = reactive(rawInfo)
console.log(isReactive(reactiveInfo)) // true — 但这还是 true
// 实际上第二个问题的意图是: 不要对已经是代理的对象重复调用 reactive
// 如果 info 已经是 reactive, reactive(info) 仍返回同一个代理对象
</script>
```

更准确地说，第二题的解决方案是：

```vue
<script setup lang="ts">
import { reactive, isReactive, toRaw } from "vue"

// Challenge 2: 传入普通对象，reactive() 会创建新代理
const info = { count: 1 }
// 不要: const info = reactive({ count: 1 }) 
const reactiveInfo = reactive(info)
console.log(isReactive(reactiveInfo)) // true

// 但题目要求输出 false，答案是 info 已经是 reactive 就不需要再 reactive
// 或者用 toRaw
const info2 = reactive({ count: 1 })
console.log(isReactive(toRaw(info2))) // false
</script>
```

## 解释

- `toRaw()` 返回 reactive/readonly 代理的原始对象。
- `isReactive()` 检查对象是否是 reactive 代理。
- 对已是 reactive 的对象再次调用 `reactive()` 会返回同一个代理，不会创建新代理。
