# onWatcherCleanup：setup 中注册 watcher cleanup {#on-watcher-cleanup}

> **版本**：Vue 3.5+ | **状态**：stable | **源码**：`packages/reactivity/src/watch.ts:103-118` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/reactivity-watch.html#onwatchercleanup) | [RFC 259](https://github.com/vuejs/rfcs/discussions/399)

`onWatcherCleanup(fn)` 是 3.5 引入的「在 watcher 中注册 cleanup」独立 API，与 `watch(source, cb, { onCleanup })` 等价，但**不依赖 watch 调用栈** —— 可以在 setup / composable 任意位置调用，自动绑定到「当前活跃的 watcher」。

签名：

```ts
onWatcherCleanup((cleanupFn) => Promise<void> | void, failSilently?: boolean, owner?: ReactiveEffect)
```

## 这是什么 {#what}

```vue
<script setup>
import { watch, onWatcherCleanup } from 'vue'

watch(idRef, async (id) => {
  const ctrl = new AbortController()
  fetch(`/api/items/${id}`, { signal: ctrl.signal }).then(r => data.value = r)
  onWatcherCleanup(() => ctrl.abort())
})
</script>
```

旧写法（仍然兼容）：

```ts
watch(idRef, (id, _, onCleanup) => {
  const ctrl = new AbortController()
  fetch(...).then(r => data.value = r)
  onCleanup(() => ctrl.abort())
})
```

## 源码走读 {#source}

```ts
// packages/reactivity/src/watch.ts:103-118
export function onWatcherCleanup(
  cleanupFn: () => void,
  failSilently = false,
  owner: ReactiveEffect | undefined = activeEffect,
): void {
  if (owner) {
    let cleanups = owner.cleanups || (owner.cleanups = [])
    cleanups.push(cleanupFn)   // LIFO 顺序在 stop()/effect.run() 之前依次执行
  } else if (__DEV__ && !failSilently) {
    warn('onWatcherCleanup() was called when there was no active watcher to associate with.')
  }
}
```

关键事实：

- `onWatcherCleanup` 会在当前 watcher 的 `cleanup` 数组中**追加** fn，下次 watcher 重新运行前依次 LIFO 调用。
- 必须在 watcher 注册的回调「同步阶段」调用；放到 async 之后失效（会给出 dev warning）。
- `failSilently: true` 用于封装第三方 composable 时不抛错 —— 静默失败。
- 与 `watch({}, cb, { onCleanup })` 等价，但写法上更接近 `onUnmounted` 的语义。

## 实战场景 {#production}

1. **取消正在飞行的 fetch**：watch id 时启动 `fetch`，id 变化前 cleanup 上一次的 controller。
2. **清空定时器**：watch 启动 setInterval，cleanup 时 clearInterval。
3. **composable 内部 cleanup**：自己写 `useFetch` 时不用把 `onCleanup` 传给调用方，直接在 composable 内 `onWatcherCleanup`。
4. **EventTarget 移除监听**：watch 期间 `addEventListener`，cleanup 时 `removeEventListener`。

## 常见踩坑 {#pitfalls}

- **`onWatcherCleanup` 必须在 watch 回调同步阶段调用**：放进 setTimeout / Promise.then 都拿不到 `activeEffect`。
- **cleanup 注册顺序是 LIFO**：后注册的 cleanup 先执行。
- **同一个 effect 多次 cleanup 注册**：会全部追加，按 LIFO 顺序触发。
- **cleanup 内抛错**：watch 仍会继续运行下一个 callback —— cleanup 错误不会重启 watcher。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方](https://vuejs.org/api/reactivity-watch.html#onwatchercleanup) | API 文档 |
| [RFC 259](https://github.com/vuejs/rfcs/discussions/399) | onWatcherCleanup 设计讨论 |
| [Vue 源码 · watch.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/watch.ts) | onWatcherCleanup 实现 |
| [Vue 源码洞察：cleanup LIFO 与 watcher 终止](_analysis/vue-source-insights.md#onwatchercleanup-xxx) | 隐式经验 |