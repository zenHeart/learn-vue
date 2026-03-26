# useLocalStorage

> 🟡 medium | #Composable Function | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

我们经常需要使用 `localStorage` API，一个组合式函数可以让它的使用更方便。

## 挑战代码

```vue
<script setup lang='ts'>

import { ref } from "vue"

/**
 * Implement the composable function
 * Make sure the function works correctly
*/
function useLocalStorage(key: string, initialValue: any) {
  const value = ref(initialValue)

  return value
}

const counter = useLocalStorage("counter", 0)

// We can get the localStorage by triggering the getter:
console.log(counter.value)

// And we also can set the localStorage by triggering the setter:

counter.value = 1

</script>
```

## 答案

```vue
<script setup lang='ts'>
import { ref, watch } from "vue"

function useLocalStorage(key: string, initialValue: any) {
  const storedValue = localStorage.getItem(key)
  const value = ref(storedValue !== null ? JSON.parse(storedValue) : initialValue)

  watch(
    value,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  return value
}

const counter = useLocalStorage("counter", 0)
</script>
```

## 解释

`useLocalStorage` 组合式函数：
1. 初始化时从 localStorage 读取已存储的值
2. 使用 `watch` 监听值的变化，自动同步到 localStorage
3. 对返回的 ref 的修改会自动同步到 localStorage

注意使用 `JSON.parse/stringify` 处理对象等复杂类型的序列化。
