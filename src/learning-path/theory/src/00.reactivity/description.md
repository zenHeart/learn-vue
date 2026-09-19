> 版本: Vue 3.0+ | RFC: 0001-composition-api | 状态: educational | 概念: 手写 mini reactive

# 手写 30 行 reactive 与 effect

通过这一节，你将看到 Vue 3 响应式系统的最小可行实现：基于 `Proxy` 的 getter/setter 拦截，配合一个全局的 `effectStack` 与 `targetMap` 维护依赖关系。

## 你会学到什么

- `track(target, key)` 在 getter 中记录「当前 effect 依赖了哪个对象的哪个 key」。
- `trigger(target, key)` 在 setter 中找到所有依赖当前 key 的 effect，依次执行。
- 嵌套 effect 通过 effectStack 实现「进入子 effect 时临时切换 activeEffect」。
- 多次修改同一 key 会被去重到同一个微任务里批量执行（教学版简化为同步触发）。

## 关键代码骨架

```js
const effectStack = []
let activeEffect = null
const targetMap = new WeakMap()

function effect(fn) {
  const e = () => { activeEffect = e; effectStack.push(e); fn(); effectStack.pop(); activeEffect = effectStack.at(-1) }
  e()
}
function track(target, key) {
  if (!activeEffect) return
  let map = targetMap.get(target)
  if (!map) targetMap.set(target, (map = new Map()))
  let deps = map.get(key)
  if (!deps) map.set(key, (deps = new Set()))
  deps.add(activeEffect)
}
function trigger(target, key) {
  const map = targetMap.get(target)
  if (!map) return
  const deps = map.get(key)
  deps && deps.forEach((fn) => fn())
}
function reactive(obj) {
  return new Proxy(obj, {
    get(t, k) { track(t, k); return Reflect.get(t, k) },
    set(t, k, v) { const r = Reflect.set(t, k, v); trigger(t, k); return r }
  })
}
```

## 关键陷阱

- effect 的注册顺序很重要，getter 必须先 track 才能被 trigger 找到。
- WeakMap 用于避免内存泄漏：原对象被回收时其依赖表自动 GC。
- 嵌套 effect 必须用栈结构，否则 activeEffect 会被覆盖。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 3 reactivity 源码](https://github.com/vuejs/core/tree/main/packages/reactivity/src) | 完整实现 |
| [Vue Mastery - Reactivity 原理](https://www.vuemastery.com/courses/vue-3-reactivity/vue3-reactivity/) | 视频讲解 |
| [Vue 源码洞察：reactive 对 Array / Map / Set / WeakMap 的代理限制](_analysis/vue-source-insights.md#reactive对arraymapsetweakmap的代理限制) | `packages/reactivity/src/reactive.ts:52-66,267-300` 引用 |
| [Vue 源码洞察：computed 的 dirty 标记与缓存策略](_analysis/vue-source-insights.md#computed的dirty标记与缓存策略) | `packages/reactivity/src/computed.ts:97-122` 引用 |