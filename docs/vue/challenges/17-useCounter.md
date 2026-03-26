# useCounter

> 🟡 medium | #Composable Function | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要实现一个功能完整的计数器 composable。

## 挑战代码

```vue
<script setup lang='ts'>

interface UseCounterOptions {
  min?: number
  max?: number
}

/**
 * Implement the composable function
 * 1. inc (+)
 * 2. dec (-)
 * 3. reset
 * 4. min & max option support
 * Make sure the function works correctly
*/
function useCounter(initialValue = 0, options: UseCounterOptions = {}) {

}

const { count, inc, dec, reset } = useCounter(0, { min: 0, max: 10 })

</script>
```

## 答案

```vue
<script setup lang='ts'>
import { ref, computed } from 'vue'

interface UseCounterOptions {
  min?: number
  max?: number
}

function useCounter(initialValue = 0, options: UseCounterOptions = {}) {
  const count = ref(initialValue)

  const inc = () => {
    if (options.max === undefined || count.value < options.max) {
      count.value++
    }
  }

  const dec = () => {
    if (options.min === undefined || count.value > options.min) {
      count.value--
    }
  }

  const reset = () => {
    count.value = initialValue
  }

  return { count, inc, dec, reset }
}

const { count, inc, dec, reset } = useCounter(0, { min: 0, max: 10 })
</script>
```

## 解释

`useCounter` 封装了计数器的所有逻辑：
- `count` 是响应式的计数器值
- `inc()` 增加计数，支持 `max` 边界限制
- `dec()` 减少计数，支持 `min` 边界限制
- `reset()` 重置为初始值

这个挑战展示了组合式函数如何将状态和操作逻辑封装在一起，方便复用。
