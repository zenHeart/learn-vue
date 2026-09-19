> 版本: Vitest 1.x+ | RFC: — | 状态: stable | 概念: Vitest 响应式单元测试

# Vitest 响应式单元测试

## 你会学到什么

不挂载组件，**直接测试 reactivity 原语**——`ref` / `computed` / `watch` / `effect`。这种测试更快、更聚焦，特别适合测业务逻辑里的派生状态。

## ref / computed

```ts
import { describe, it, expect } from 'vitest'
import { ref, computed } from 'vue'

describe('cart total', () => {
  it('sums prices', () => {
    const items = ref([{ price: 10 }, { price: 20 }])
    const total = computed(() => items.value.reduce((s, i) => s + i.price, 0))
    expect(total.value).toBe(30)
  })

  it('updates reactively', () => {
    const items = ref([{ price: 10 }])
    const total = computed(() => items.value.length)
    items.value.push({ price: 99 })
    expect(total.value).toBe(2)
  })
})
```

## watch

```ts
import { watch } from 'vue'

it('watches source', async () => {
  const count = ref(0)
  const seen = []
  watch(count, (v) => seen.push(v))
  count.value = 1
  count.value = 2
  await nextTick()
  expect(seen).toEqual([1, 2])
})
```

## 假时钟

时间相关代码用 `vi.useFakeTimers()`：

```ts
import { vi } from 'vitest'

it('debounces after 300ms', async () => {
  vi.useFakeTimers()
  const fn = vi.fn()
  const debounced = useDebounceFn(fn, 300)
  debounced('a')
  debounced('b')
  vi.advanceTimersByTime(299)
  expect(fn).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  expect(fn).toHaveBeenCalledWith('b')
})
```

## 动手试

右侧 REPL 演示上述三个用例的运行结果。

## 最佳实践

| 实践 | 说明 |
|---|---|
| `beforeEach(() => setActivePinia(createPinia()))` | 每个用例独立 pinia 实例 |
| `vi.useFakeTimers()` + `vi.useRealTimers()` | 时间相关测试前后清理 |
| `await nextTick()` 后断言 DOM | watch 默认 flush='pre' |
| 不依赖 DOM、不挂载组件 | 测试粒度细、跑得快 |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vitest 假时钟](https://vitest.dev/guide/mocking.html#timers) | `vi.useFakeTimers` |
| [测试 Pinia store](https://pinia.vuejs.org/cookbook/testing.html) | 配合 setActivePinia |
| [Vue 官方测试指南](https://vuejs.org/guide/scaling-up/testing.html) | 分层方法论 |
