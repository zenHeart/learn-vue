> 版本: Pinia 2.x + VueUse 11+ | RFC: — | 状态: stable | 源码: pinia/packages/pinia/src/store.ts (subscribe / watch) + @vueuse/rxjs(useSubscription)
> 延伸: [Pinia $subscribe](https://pinia.vuejs.org/api/interfaces/pinia.store.html#subscribe) | [VueUse useObservable](https://vueuse.org/rxjs/useObservable/) | [RxJS 官方](https://rxjs.dev/)

# 14 · Pinia × RxJS / 外部订阅源

Pinia 原生只提供 `$subscribe` / `$watch` / `$onAction` 三个订阅入口。当外部数据源是 RxJS Subject、WebSocket 消息流、EventBus 时,需要在 store 内部把流"接进来"。

两种典型做法:

1. **从外部推**:组件 mount 时 `useSubscription(stream$, value => store.set(value))`,在 setup store 内 `watch` 桥接。
2. **从 store 推**:store action 内部订阅外部事件,`onScopeDispose` 里取消订阅,防止泄漏。

## 这是什么

```ts
import { defineStore } from 'pinia'
import { ref, onScopeDispose } from 'vue'
import { Subject } from 'rxjs'

const ticker$ = new Subject<number>()

export const useTickerStore = defineStore('ticker', () => {
  const value = ref(0)
  const sub = ticker$.subscribe((v) => { value.value = v })
  onScopeDispose(() => sub.unsubscribe())
  return { value }
})
```

配合 VueUse 的 `useObservable(stream$)` 可以**反向** —— 把 store 内的 ref 暴露成 Observable,给非 Vue 模块订阅。

## 源码走读

Pinia 的 `store.ts:480` 把 `$subscribe / $watch / $onAction` 三个方法挂到 store 实例。Setup Store 写法不受这套限制,可以自由用 `ref / watch / onScopeDispose`,RxJS Subject 是普通的"事件流对象",用 `subscribe()` 即可消费。

```ts
// pinia/packages/pinia/src/store.ts (附近行号)
const $subscribe = (callback, options) => { ... }
// 而 RxJS 反向暴露则在 setup 内自己实现
```

## 实战场景

1. **真实场景** — WebSocket 行情推送:外部 `socket.onmessage` 解码后 `subject.next(tick)`,store 内 `subscribe` 更新 `price.value`,组件用 `computed` 派生指标。
2. **边界场景** — store 内用 `useObservable` 把 ref 转成 Observable,给 Canvas/Three.js 等非 Vue 渲染管线喂数据 —— 这样可避免组件模板与命令式渲染共用同一个数据源时出现"两套订阅"。

## 常见踩坑

- **忘记 `onScopeDispose`**:store 内 `subject.subscribe(...)` 创建的订阅没解绑,store $dispose 后回调仍在触发 → 内存泄漏与 ghost update。
- **多次创建 store**:单例模式下每个 `useXxxStore()` 都共享同一订阅,不会重复;多 pinia 实例时(SSR)要在每个 pinia 内单独订阅。
- **`useObservable` 必须传 ref**:VueUse 的 `useObservable` 接受 `Ref<T>`,内部用 `watch` 桥接;如果你想订阅的是 Subject,先用 `pipe(...)` 转成 ref-friendly 的结构。
- **节流**:高频外部流(>60fps)进入 store 后,组件渲染会爆。可以在 store 内用 `watchDebounced` 或 RxJS `throttleTime`。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Pinia $subscribe API](https://pinia.vuejs.org/api/interfaces/pinia.store.html#subscribe) | 监听 store 变化 |
| [VueUse useObservable](https://vueuse.org/rxjs/useObservable/) | ref → Observable |
| [RxJS API 速查](https://rxjs.dev/api) | Subject / BehaviorSubject / share |
| [VueUse useSubscription](https://vueuse.org/rxjs/useSubscription/) | Observable → cleanup 友好的订阅 |
| [Pinia 源码 store.ts](https://github.com/vuejs/pinia/blob/main/packages/pinia/src/store.ts) | $subscribe / $watch 实现 |
