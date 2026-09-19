> 版本: Pinia 2.x | RFC: — | 状态: stable | 源码: pinia/packages/pinia/src/store.ts:353-359 (function $dispose)
> 延伸: [Pinia $dispose 官方说明](https://pinia.vuejs.org/api/interfaces/pinia.store.html#dispose) | [测试指南](https://pinia.vuejs.org/cookbook/testing.html)

# 12 · `$dispose()` 手动释放 store

`store.$dispose()` 终止 store 内部的 effect scope、清空 `subscriptions` 与 `actionSubscriptions`,并把 store 从 `pinia._s` Map 里移除。下次再 `useXxxStore()` 会拿到全新实例。

## 这是什么

```ts
// pinia/packages/pinia/src/store.ts:353
function $dispose() {
  scope.stop()
  subscriptions.clear()
  actionSubscriptions.clear()
  pinia._s.delete($id)
}
```

调用后:

- 仍在引用旧 store 的组件不会立刻报错,但任何 `watch` / `computed` 依赖都会停止响应;
- `$state` 引用对象不再更新;
- 重新 `useXxxStore()` 会触发 store 工厂重跑,得到一份新的 state。

## 源码走读

`$dispose` 只能"解绑订阅 + 清 Map",并不主动置空 state 对象本身。订阅回调如果在闭包里捕获了 state,会被 `scope.stop()` 一并停止。Setup Store 内自建的 `watch / effect` 也会被 scope 回收。

```ts
// pinia/packages/pinia/src/store.ts:480
$dispose,
```

`store.$dispose()` 触发的是 store 级别;若想销毁整个 pinia 实例(包括所有 store),用 `disposePinia(pinia)`(`createPinia.ts`)。

## 实战场景

1. **真实场景** — 多应用多 pinia:SSR 给不同租户生成不同 pinia 实例,租户切换时 `disposePinia(old)` + `createPinia()` 给新租户。
2. **边界场景** — 单元测试中,每个测试 `setActivePinia(createPinia())` 创建新实例,不需要手动调 `$dispose`;但在 spy 场景下可 `$dispose` 重置某个 store 而不重建整个 pinia。

## 常见踩坑

- **不要在生产代码里频繁调**:`$dispose` 是"清理"语义,频繁 dispose + recreate 反而比让 store 一直在更耗(每次新建都要跑 setup 闭包)。
- **仍然有外部引用时不会"真消失"**:JS 里只要有引用,GC 就不回收对象。dispose 是逻辑层清场,不是内存强制回收。
- **dispose 后再 `useStore()` 拿到新实例**:`_s` 已清掉,所以 `useXxxStore()` 内部会重跑工厂函数 —— 这意味着 `const store = useXxxStore(); store.$dispose(); store === useXxxStore()` 是 `false`。
- **Dispose 单 store vs `disposePinia`**:前者只清一个 store,后者清整个 pinia 实例(包括所有 store 与全局 plugins)。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Pinia $dispose API](https://pinia.vuejs.org/api/interfaces/pinia.store.html#dispose) | 方法签名 |
| [Pinia disposePinia](https://pinia.vuejs.org/api/modules/pinia.html#disposepinia) | 整体销毁 pinia |
| [Pinia 测试指南](https://pinia.vuejs.org/cookbook/testing.html) | `setActivePinia` + dispose 模式 |
| [Pinia 源码 store.ts](https://github.com/vuejs/pinia/blob/main/packages/pinia/src/store.ts) | $dispose 实现 |
