# watch 内存泄漏与清理

## 知识点

### 1. watch 只在新值时触发（跳过初始值）

watch 默认配置下不会在初始化时触发回调，只有当被监听的值发生改变时才会执行。

```js
const count = ref(0)

// 默认 immediate: false，不会立即执行
watch(count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} -> ${newVal}`)
})
// count.value++ 时才会触发

// 设置 immediate: true 立即执行
watch(count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} -> ${newVal}`)
}, { immediate: true })
// 创建时立即输出: count changed: undefined -> 0
```

**watch vs watchEffect 初始执行时机区别**：

| 特性 | watch | watchEffect |
|------|-------|-------------|
| 默认初始执行 | 否 | 是 |
| 初始执行控制 | `immediate: true` | 始终立即执行 |
| 延迟初始执行 | - | `flush: 'post'` |

```js
// watchEffect 默认立即执行
watchEffect(() => {
  console.log('立即执行')
})

// watchEffect 延迟到组件更新后执行
watchEffect(() => {
  console.log('组件更新后执行')
}, { flush: 'post' })
```

### 2. 组件卸载时自动清理 watch

Vue 3 提供了多种清理 watch 的方式。

#### onWatcherCleanup (Vue 3.5+)

推荐使用 `onWatcherCleanup` 注册清理函数，在 watch 重新运行或停止时自动调用：

```js
import { watch, onWatcherCleanup } from 'vue'

watch(id, (newId) => {
  const controller = new AbortController()
  fetch(`/api/${newId}`, { signal: controller.signal })

  // 清理函数：下次 watch 回调执行前或组件卸载时调用
  onWatcherCleanup(() => {
    controller.abort()
  })
})
```

#### watch 返回 stop() 函数

```js
const count = ref(0)

const stop = watch(count, (newVal) => {
  console.log(newVal)
})

// 手动停止 watch
stop()

// 组件中通常在 onUnmounted 时调用
import { onUnmounted } from 'vue'

onUnmounted(() => {
  stop()
})
```

#### stopWatch 清理具名 watch

使用 `stop` 函数或 `stopWatch` 清理：

```js
import { watch, stop } from 'vue'

// 使用返回的 stop 函数
const stopWatch1 = watch(source1, callback1)

// 使用 stop 工具函数
stop(watch(source2, callback2))
```

### 3. flush 选项的影响

| 选项 | 触发时机 | 使用场景 |
|------|---------|---------|
| `pre` | 组件更新前（默认） | 大多数场景 |
| `post` | 组件更新后 | 访问更新后的 DOM |
| `sync` | 同步触发 | 不推荐（性能问题） |

```js
import { watch, ref } from 'vue'

const count = ref(0)

// flush: 'pre'（默认）
watch(count, () => {
  // 组件更新前触发
}, { flush: 'pre' })

// flush: 'post' - 用于访问更新后的 DOM
watch(count, () => {
  // 组件更新后触发
  nextTick(() => {
    // DOM 已更新
  })
}, { flush: 'post' })

// flush: 'sync' - 同步触发，不推荐
watch(count, () => {
  // 每次值变化立即触发
}, { flush: 'sync' })
```

### 4. 避免 watch 闭包内存泄漏

watch 回调闭包会捕获外部变量，若不正确清理会导致内存泄漏。

#### 问题场景：定时器未清理

```js
// 错误示例 - 定时器泄漏
watch(userId, (newId) => {
  const timer = setInterval(() => {
    console.log('polling...')
  }, 1000)
  // 每次 userId 变化都创建新定时器，旧定时器未清理
})
```

#### 正确做法：使用 cleanup

```js
// 正确示例
watch(userId, (newId) => {
  const timer = setInterval(() => {
    console.log('polling...')
  }, 1000)

  // cleanup 清理定时器
  onWatcherCleanup(() => {
    clearInterval(timer)
  })
})
```

#### 问题场景：事件监听器未清理

```js
// 错误示例
watch(isActive, (newVal) => {
  if (newVal) {
    window.addEventListener('resize', handleResize)
    // isActive 变为 false 再变 true 时，会注册多个监听器
  }
})

// 正确示例
watch(isActive, (newVal) => {
  if (newVal) {
    window.addEventListener('resize', handleResize)
    onWatcherCleanup(() => {
      window.removeEventListener('resize', handleResize)
    })
  }
})
```

#### 避免在 watch 中创建新订阅

```js
// 错误示例 - 每次触发都创建新订阅
watch(query, (newQuery) => {
  const subscription = api.search(newQuery).subscribe(results => {
    // 处理结果
  })
})

// 正确示例 - 使用 cleanup 清理旧订阅
watch(query, (newQuery) => {
  const subscription = api.search(newQuery).subscribe(results => {
    // 处理结果
  })

  onWatcherCleanup(() => {
    subscription.unsubscribe()
  })
})
```

### 5. 最佳实践

#### 推荐使用 onWatcherCleanup

```js
// 推荐
watch(id, (newId) => {
  const controller = new AbortController()
  fetch(`/api/${newId}`, { signal: controller.signal })
    .then(res => res.json())
    .then(data => {
      // 处理数据
    })

  onWatcherCleanup(() => {
    controller.abort()
  })
})
```

#### 组合式函数中返回 stop 函数

```js
// useDataFetcher.js
import { watch, onWatcherCleanup } from 'vue'

export function useDataFetcher(getId) {
  const data = ref(null)
  const error = ref(null)

  watch(getId, async (id) => {
    try {
      data.value = await fetchData(id)
    } catch (e) {
      error.value = e
    }
  })

  // 返回清理函数
  return { data, error }
}

// 组件中使用
const { data, error } = useDataFetcher(() => userId.value)
```

#### watchEffect 的 cleanup 模式

```js
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log('interval')
  }, 1000)

  // cleanup 函数
  onCleanup(() => {
    clearInterval(timer)
  })
})
```

## 清理机制对比

| 方式 | 适用场景 | 特点 |
|------|---------|------|
| `onWatcherCleanup` | Vue 3.5+ | 官方推荐，语义清晰 |
| `stop()` 返回值 | 所有版本 | 需要手动调用 |
| `onUnmounted` | 所有版本 | 需要手动关联 watch |

## 常见问题

### Q: watch 和 watchEffect 如何选择？

- 需要获取旧值时使用 `watch`
- 只需要响应式依赖变化时使用 `watchEffect`
- watch 默认不执行，需要设置 `immediate: true`

### Q: 如何防止内存泄漏？

1. 涉及定时器、事件监听器时注册 cleanup
2. 涉及订阅/API 调用时清理
3. 组件卸载后不再需要的 watch 不需要额外处理（自动清理）

### Q: watch 监听多个数据源？

```js
// 监听多个源
watch([ref1, ref2, () => computed.value], ([new1, new2, newComp], [old1, old2, oldComp]) => {
  // 处理变化
})
```
