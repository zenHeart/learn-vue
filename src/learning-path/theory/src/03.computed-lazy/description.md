> 版本: Vue 3.x | 源码: packages/reactivity/src/computed.ts | 难度: 中等

# 03 · computed 的 lazy 与 dirty 机制

## 原理是什么

`computed` 本质上是一个带 `dirty` 标记的 effect。当上游响应式数据变化时，computed 不会立即重算，而是把 `dirty` 置为 `true`；只有当下次访问 `.value` 时才重新调用 getter 求值。这种"按需求值 + 缓存"模式让多个 effect 同时读取同一个 computed 时，只触发一次 getter 调用。

普通 `effect` 一旦依赖变化会立即同步执行，而 computed effect 通过 `scheduler` 拦截 trigger，把"立即执行"改成"标记 dirty"，从而实现 lazy 语义。

## 一步步走读源码

源码定位（Vue 3.4+）：

- `packages/reactivity/src/computed.ts` 第 73-140 行：`ComputedRefImpl` 类构造，`effect(fn, { lazy: true, scheduler })`。
- 同文件第 100-118 行：`scheduler` 把 `dirty` 置 true 并 trigger 自己（让下游 watch/render effect 重跑）。
- 第 142-156 行：`get value()` 的 lazy 求值分支，首次或 dirty 时执行 `_effect.run()`。

关键片段：

```ts
class ComputedRefImpl {
  private _dirty = true
  private _value: T = undefined!
  effect: ReactiveEffect = new ReactiveEffect(
    () => getter(this._value),
    () => {
      if (!this._dirty) {
        this._dirty = true
        trigger(this, 'value')   // 让依赖此 computed 的下游重跑
      }
    }
  )
  get value() {
    track(this, 'value')
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()!
    }
    return this._value
  }
}
```

## 为何这样设计

- **lazy 求值**：当 computed 被定义但还没被访问时，不付出计算代价；如果模板根本没渲染这个 computed，可以零成本跳过。
- **dirty 缓存**：当上游无变化时重复读取 `.value`，直接返回旧值，避免冗余 getter 调用。
- **scheduler 替代 run**：computed 自己也是 effect 的下游，因此当上游触发 trigger 时，调度器把同步执行换成"标记脏 + 异步通知"，既保留了响应式链路，又推迟了真正的计算时机。

## 性能与权衡

- 多 effect 同时读同一个 computed：只一次 getter 调用；
- getter 内若访问多个响应式数据，computed 会被每个 key 订阅；trigger 任意一个都会触发 dirty 重算；
- 与 `watch` 组合时，watch 会拿到 computed 作为 source，自动获得缓存语义。

## Vue 官方延伸阅读

- 官方文档: <https://cn.vuejs.org/api/reactivity-core.html#computed>
- 官方 RFC: <https://github.com/vuejs/rfcs/discussions/97>
- 源码: <https://github.com/vuejs/core/blob/main/packages/reactivity/src/computed.ts>

## 对应 RFC

RFC 97: 提案将 lazy + dirty 模式作为推荐范式，computed API 与 reactivity 解耦。

## 延伸：可手写极简版本验证

本 demo 的 `App.vue` 用 ~30 行手写了一个 `myComputed`，可对比"普通 effect 立即执行"与"computed lazy 标记"的行为差异。

## 参考资料

- 《Vue.js 设计与实现》霍春阳，第 5 章「非原始值的响应式方案」
- 《Vue 技术揭秘》computed 篇 <https://ustbhuangyi.github.io/vue-analysis/reactivity/computed-watcher.html>
- 源码: <https://github.com/vuejs/core/blob/main/packages/reactivity/src/computed.ts>

## 源码洞察（延伸阅读）

- [Vue 源码洞察：computed 的 dirty 标记与缓存策略](_analysis/vue-source-insights.md#computed的dirty标记与缓存策略) | `packages/reactivity/src/computed.ts:97-122` 引用
- [Vue 源码洞察：effectScope 批量 dispose 副作用](_analysis/vue-source-insights.md#effectscope批量dispose副作用) | `packages/reactivity/src/effectScope.ts` 引用
