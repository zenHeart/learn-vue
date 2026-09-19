> 版本: Vue 3.x | 源码: packages/reactivity/src/reactive.ts, packages/reactivity/src/effect.ts | 难度: 中等

# 02 · 手写 50 行 reactive / effect / track / trigger

## 原理是什么

Vue 3 的响应式核心可以浓缩为一个 50 行以内的极简实现。核心数据结构是一个 `targetMap: WeakMap<object, Map<key, Set<effect>>>`，三层嵌套把"哪个对象、哪个 key、被哪些 effect 订阅"三件事压缩到 O(1) 查询。读取属性时调用 `track` 收集当前活跃 effect；写入属性时调用 `trigger` 把对应 key 下的所有 effect 重新执行。

要支持嵌套 effect（如组件渲染 effect 内调用一个 computed，又触发另一个 reactive getter），需要维护一个 `effectStack`，并在执行 effect 之前压栈、执行后弹栈。cleanup 函数（遍历依赖集合删除自身）则解决经典 bug：分支切换时旧分支里的字段不该再触发更新。

## 一步步走读源码

源码定位（Vue 3.4+，行号会随版本小幅漂移）：

- `packages/reactivity/src/effect.ts` 第 73-90 行：`createDep` 把 Set 升级为带 cleanup 能力的集合。
- `packages/reactivity/src/effect.ts` 第 152-200 行：`ReactiveEffect.run` 先 cleanup 再 push，最后 `effect.run()`。
- `packages/reactivity/src/effect.ts` 第 280-318 行：`track` 与 `trigger`，以及全局 `targetMap`。
- `packages/reactivity/src/baseHandlers.ts` 第 60-80 行：`get` 陷阱里调用 `track`，`set` 陷阱里调用 `trigger`。

关键片段：

```ts
// effect.ts
const targetMap = new WeakMap()
let activeEffect: ReactiveEffect | undefined
const effectStack: ReactiveEffect[] = []

function track(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))
  let dep = depsMap.get(key)
  if (!dep) depsMap.set(key, (dep = createDep(() => dep.delete(activeEffect!))))
  trackEffect(activeEffect!, dep)
}

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep = depsMap.get(key)
  if (dep) triggerEffects(dep)
}
```

## 为何这样设计

- **WeakMap 持有 target**：允许原始对象被 GC，否则会内存泄漏。
- **cleanup 而非新增**：避免分支切换时同一个 effect 被同一个 key 重复收集，导致一次更新触发多次 run。
- **effectStack 而非单变量**：渲染 effect 里再调用别的 effect（如 watchEffect），内层结束后必须恢复外层 activeEffect。

## 性能与权衡

- 三层 Map/Set 在大对象、深嵌套场景下内存开销约等于额外 ~30 字节/键；
- cleanup 每次 run 都会遍历自身 deps 集合，单次 effect 平均开销 O(d)，d 是依赖 key 数；
- 对比 Vue 2 的 `Object.defineProperty` 必须在初始化时递归劫持，Proxy 版本天然支持动态新增 key 与数组索引，触发次数更少。

## Vue 官方延伸阅读

- 官方 RFC: <https://github.com/vuejs/rfcs/discussions/97>
- 官方文档: <https://cn.vuejs.org/guide/extras/reactivity-in-depth.html>
- 源码: <https://github.com/vuejs/core/tree/main/packages/reactivity>

## 对应 RFC

RFC 97: Reactivity API（composition-api-rfc 的实现基石）

## 延伸：可手写极简版本验证

demo `02.reactive-mini/App/App.vue` 中复现了 50 行的极简 reactive，可观察 targetMap 内容、cleanup 行为、嵌套 effect 栈。

## 参考资料

- 《Vue.js 设计与实现》霍春阳，第 4 章「响应式系统的作用与实现」
- 《Vue 技术揭秘》在线版，reactive 篇 <https://ustbhuangyi.github.io/vue-analysis/v2/reactive/>
- 源码: <https://github.com/vuejs/core/blob/main/packages/reactivity/src/effect.ts>

## 源码洞察（延伸阅读）

- [Vue 源码洞察：reactive 对 Array / Map / Set / WeakMap 的代理限制](_analysis/vue-source-insights.md#reactive对arraymapsetweakmap的代理限制) | `packages/reactivity/src/reactive.ts:52-66,267-300` 引用
- [Vue 源码洞察：arrayInstrumentations 处理副作用读取](_analysis/vue-source-insights.md#arrayinstrumentations处理arrayconcatincludesindexof等副作用读取) | `packages/reactivity/src/arrayInstrumentations.ts:42-60` 引用
