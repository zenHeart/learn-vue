# customRef 实战：debounce / throttle / async fetch {#custom-ref-debounce-async}

> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/reactivity/src/customRef.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/reactivity-advanced.html#customref)

`customRef((track, trigger) => ({ get, set }))` 让你完全控制 ref 的依赖追踪与触发时机。

- **`get()`**：必须调用 `track()` —— 让当前 effect 订阅这个 ref。
- **`set(v)`**：可选择时机调用 `trigger()` —— 通知所有订阅者重新执行。

通过控制 `trigger()` 的时机与策略，可以实现 **debounce**（延迟）、**throttle**（节流）、**async fetch**（异步加载）。

## 这是什么 {#what}

```ts
function useDebouncedRef<T>(initial: T, delay = 300) {
  let value = initial
  let timer: ReturnType<typeof setTimeout> | null = null
  return customRef<T>((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue: T) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        value = newValue
        trigger()
      }, delay)
    },
  }))
}

function useThrottledRef<T>(initial: T, interval = 200) {
  let value = initial
  let lastTrigger = 0
  return customRef<T>((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue: T) {
      value = newValue
      const now = Date.now()
      if (now - lastTrigger >= interval) {
        lastTrigger = now
        trigger()
      } else {
        // 兜底：最后一次一定触发
        setTimeout(() => { lastTrigger = Date.now(); trigger() }, interval - (now - lastTrigger))
      }
    },
  }))
}

function useAsyncRef<T>(loader: () => Promise<T>) {
  let value: T | undefined
  return customRef<T | undefined>((track, trigger) => ({
    get() {
      track()
      if (value === undefined) loader().then((v) => { value = v; trigger() })
      return value
    },
    set() { /* read-only */ },
  }))
}
```

## 源码走读 {#source}

```ts
// packages/reactivity/src/customRef.ts
export function customRef<T>(factory) {
  return new CustomRefImpl(factory) as Ref<T>
}

class CustomRefImpl<T> {
  private dep = new Set()
  private readonly _get
  private readonly _set
  constructor(factory) {
    const { get, set } = factory(
      () => trackRefValue(this),   // track()
      () => triggerRefValue(this)  // trigger()
    )
    this._get = get
    this._set = set
  }
  get value() { return this._get() }
  set value(v) { this._set(v) }
}
```

关键事实：

- **get 必须 track、set 按需 trigger**：不调 track 会丢失响应式；不调 trigger 不会通知订阅者。
- **track 调用时机**：仅在「真正想订阅」的同步代码段调用；不要在异步回调里调 track。
- **trigger 调用时机**：仅当外部订阅者「应该被通知」时调；可批量、可合并。
- **`this` 引用**：customRef 的 factory 不绑定 this；要保存内部 state 必须用 closure 变量。

## 实战场景 {#production}

1. **搜索输入防抖**：用户键入停止 300ms 才触发 fetch；避免每个字符都发请求。
2. **滚动节流**：滚动事件高频触发，throttle 限制回调频率。
3. **异步加载**：路由组件预加载、懒加载数据；ref.get 第一次访问时拉数据。
4. **WebSocket 数据**：`customRef` 把 socket message 包装为响应式 ref（无需 watch）。
5. **IndexedDB / localStorage**：异步读写包装为 ref，trigger 触发 UI 更新。

## 常见踩坑 {#pitfalls}

- **get 不调 track**：effect 无法订阅，看起来「值变了但模板不更新」。
- **set 不调 trigger**：值改了但模板不刷新。
- **trigger 在异步中丢失**：在 await 后调 trigger 时，**部分**场景下 dep 集合可能已失效（如果当前 effect 已卸载）；一般场景无问题。
- **同步触发 vs 异步触发**：debounce/throttle 触发都在异步队列，Vue 不会自动 batch —— 同一 tick 多次异步 trigger 会触发多次更新（但 render 阶段会自动合并）。
- **与 shallowRef 区别**：customRef 完全控制读写逻辑；shallowRef 仅控制是否深代理。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方 · customRef](https://vuejs.org/api/reactivity-advanced.html#customref) | API |
| [Vue 源码 · customRef.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/customRef.ts) | 实现 |
| [`reactivity/14.ref-unboxing`](#) | 基础 customRef 用法 |
| [MDN · setTimeout 节流](https://developer.mozilla.org/docs/Web/API/setTimeout) | 防抖节流基础 |
