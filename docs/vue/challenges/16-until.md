# until

> 🟡 medium | #Utility Function | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

我们经常需要依赖异步返回的结果来执行下一步操作，`until` 函数在这种情况下非常有用。

## 挑战代码

```vue
<script setup lang='ts'>
import { ref } from "vue"

const count = ref(0)

/**
 * Implement the until function
*/

function until(initial) {
  function toBe(value) {

  }

  return {
    toBe,
  }
}

async function increase() {
  count.value = 0
  setInterval(() => {
    count.value++
  }, 1000)
  await until(count).toBe(3)
  console.log(count.value === 3) // Make sure the output is true
}

</script>
```

## 答案

```vue
<script setup lang='ts'>
import { ref, watch } from "vue"

const count = ref(0)

function until(initial) {
  function toBe(value) {
    return new Promise((resolve) => {
      watch(initial, (newVal) => {
        if (newVal === value) {
          resolve(newVal)
        }
      }, { immediate: true })
    })
  }

  return { toBe }
}

async function increase() {
  count.value = 0
  setInterval(() => {
    count.value++
  }, 1000)
  await until(count).toBe(3)
  console.log(count.value === 3)
}
</script>
```

## 解释

`until` 函数返回一个带有 `toBe` 方法的对象，`toBe` 返回一个 Promise。当监听的 ref 值等于目标值时，Promise resolved。这个模式在测试框架（如 Vitest）中很常见，用于等待某个状态满足条件后再继续执行。
