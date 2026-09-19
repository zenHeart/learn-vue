> 版本: Pinia 2 + Vitest | RFC: — | 状态: stable | 概念: 测试隔离

# Pinia store 跨用例状态污染

## 你会学到什么

- 不在 `beforeEach` 创建新 pinia 实例，state 会在测试间共享
- `setActivePinia(createPinia())` 每次都重置
- store 是单例，跨测试可能复用了旧 state

## 错误示例

```js
import { setActivePinia, createPinia } from 'pinia'
// 忘了调用 setActivePinia → 用例间共享全局 pinia

describe('counter', () => {
  it('start at 0', () => {
    const store = useCounterStore()  // 来自「上一次」测试
    expect(store.count).toBe(0)  // 可能失败
  })
})
```

## 修复版本

```js
beforeEach(() => {
  setActivePinia(createPinia())  // 每个用例新 pinia
})

it('start at 0', () => {
  const store = useCounterStore()
  expect(store.count).toBe(0)
})
```

## 动手试

1. 点击「错误：跨用例共享」 — 第二个用例看到累计值
2. 切换「修复：setActivePinia」 — 每个用例独立

## 根因

Pinia 内部维护一个 active pinia 实例，所有 `useXxxStore()` 都基于这个实例创建。Vitest 不重置全局状态，导致用例间污染。

## 修复 / 选型

- 每个 `describe` 加 `beforeEach(() => setActivePinia(createPinia()))`
- 或用 `createPinia()` 在每个测试构造
- Nuxt 项目：用 `@pinia/nuxt` 的 auto-import 不会自动重置

## 延伸阅读

- [Pinia — Testing](https://pinia.vuejs.org/cookbook/testing.html)

## 小结

1. **现象**：测试用例互相影响。
2. **复现**：错误版本累积 count。
3. **修复**：`setActivePinia(createPinia())`。
