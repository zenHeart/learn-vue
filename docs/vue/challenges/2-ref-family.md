# ref family

> 🟢 easy | #Composition API, #Reactivity:Core | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要使用 `Reactivity API: ref` 来解决问题。

## 挑战代码

```vue
<script setup lang="ts">
import { ref, Ref, reactive } from "vue"

const initial = ref(10)
const count = ref(0)

// Challenge 1: Update ref
function update(value) {
  // impl...
}

/**
 * Challenge 2: Checks if `count` is a ref object.
 * Make the output to be 1
*/
console.log(
  // impl ? 1 : 0
)

/**
 * Challenge 3: Unwrap ref
 * Make the output to be true
*/
function initialCount(value: number | Ref<number>) {
  // Make the output to be true
  console.log(value === 10)
}

initialCount(initial)

/**
 * Challenge 4:
 * create a ref for a property on a source reactive object.
 * The created ref is synced with its source property:
 * mutating the source property will update the ref, and vice-versa.
 * Make the output to be true
*/
const state = reactive({
  foo: 1,
  bar: 2,
})
const fooRef = ref() // change the impl...

// mutating the ref updates the original
fooRef.value++
console.log(state.foo === 2)

// mutating the original also updates the ref
state.foo++
console.log(fooRef.value === 3)

</script>

<template>
  <div>
    <h1>msg</h1>
    <p>
      <span @click="update(count-1)">-</span>
      {{ count }}
      <span @click="update(count+1)">+</span>
    </p>
  </div>
</template>
```

## 答案

```vue
<script setup lang="ts">
import { ref, Ref, reactive, toRef } from "vue"

const initial = ref(10)
const count = ref(0)

// Challenge 1: Update ref
function update(value) {
  count.value = value
}

/**
 * Challenge 2: Checks if `count` is a ref object.
*/
console.log(isRef(count) ? 1 : 0)

/**
 * Challenge 3: Unwrap ref
*/
function initialCount(value: number | Ref<number>) {
  console.log(unref(value) === 10)
}

initialCount(initial)

/**
 * Challenge 4: toRef
*/
const state = reactive({
  foo: 1,
  bar: 2,
})
const fooRef = toRef(state, 'foo')

// mutating the ref updates the original
fooRef.value++
console.log(state.foo === 2)

// mutating the original also updates the ref
state.foo++
console.log(fooRef.value === 3)
</script>
```

## 解释

- **Challenge 1**: `ref` 的值通过 `.value` 属性访问和修改。
- **Challenge 2**: 使用 `isRef()` 判断是否为 ref 对象。
- **Challenge 3**: 使用 `unref()` 自动解包 ref。
- **Challenge 4**: 使用 `toRef()` 为 reactive 对象的某个属性创建关联的 ref，两者的修改会互相同步。
