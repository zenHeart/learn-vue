> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/reactivity/src/reactive.ts:90-160` | **延伸阅读**：[Vue 官方 · reactive](https://vuejs.org/api/reactivity-core.html#reactive) | [Vue 官方 · shallowRef](https://vuejs.org/api/reactivity-advanced.html#shallowref)

# reactive(Object.freeze) vs shallowRef(Object.freeze) 模式对比

## 这是什么

当数据源是「只读、不可变」的对象（Redux state、Immer 产物、immutable.js Map、外部状态树）时，**怎么接入 Vue 响应式**？两种主流写法：

```ts
// 模式 A：reactive(Object.freeze({...})) —— 深代理 + 冻结
const state = reactive(Object.freeze({ user: { name: 'vue' } }))

// 模式 B：shallowRef(Object.freeze({...})) —— 引用级 + 冻结
const state = shallowRef(Object.freeze({ user: { name: 'vue' } }))
```

两种写法的**触发条件**和**性能开销**完全不同。

## 源码走读

```ts
// packages/reactivity/src/reactive.ts
// reactive() 给每个嵌套字段创建 Proxy handler；
// 写入 Object.freeze 的字段时，handler 抛错（因为 frozen 对象的 [[Set]] 内部返回 false）
// 但 reactive 不知道对象是 frozen —— 它只是触发 set trap 后才发现失败
function createGetter(...) {
  return function get(target, key, receiver) {
    // 每次属性访问都经过这个函数
    track(target, TrackOpTypes.GET, key)
    return Reflect.get(target, key, receiver)
  }
}
```

## 模式对比表

| 维度 | `reactive(Object.freeze(obj))` | `shallowRef(Object.freeze(obj))` |
|---|---|---|
| 字段代理深度 | 深（每个嵌套字段都创建 Proxy） | 浅（只有 `.value` 一个响应式单位） |
| 写入 frozen 字段 | 抛 TypeError | 直接走 frozen 对象的 set 拦截，抛 TypeError |
| 嵌套对象变化触发 | 每个字段变都触发 | 整个对象引用变才触发 |
| 性能（小对象 / 大对象） | 大对象开销大 | 不论大小只有一次 track |
| 配合 Immer / immutable.js | ❌ 冗余代理 | ✅ 推荐 |

## 实战场景

1. **Redux 风格 store**：reducer 每次返回新对象，配合 shallowRef；模板只依赖 `state.value.xxx`。
2. **Immer 产物**：`produce(state, draft => { draft.x = 1 })` 已是 frozen —— 用 shallowRef 装它，避免 reactive 二次代理。
3. **不可变数据迁移**：从 React + immutable.js 迁到 Vue，用 shallowRef 保持「按引用比较」的语义。
4. **第三方只读状态**：zustand-style store 返回的对象都是 frozen，shallowRef 是最少侵入的接入方式。

## 与 Immer 配合的代码模板

```ts
import { produce } from 'immer'
import { shallowRef, triggerRef } from 'vue'

const state = shallowRef(Object.freeze({ count: 0, list: [] }))

function update(updater: (draft: any) => void) {
  const next = produce(state.value, updater)   // immer 输出 frozen 新对象
  state.value = next                          // 整体替换，触发一次 render
}
```

注意：因为 immer 输出 frozen 对象，**直接 `state.value = next` 不会触发更新**——Vue 内部判断「新值与旧值 === 相同」时跳过；必须用 `triggerRef(state)` 强制刷新，或先复制：`state.value = { ...next }`。

## 模式选择决策树

```
外部状态是 frozen?
├── 是 → shallowRef（避免冗余代理）
│       需要 deep 响应? → 改成 reactive(Object.freeze(...))
└── 否 → reactive（默认推荐）
```

## 常见踩坑

- **`reactive(Object.freeze(obj))` 后写入抛 TypeError**：开发体验差。深嵌套时错误堆栈很长。
- **`shallowRef` 嵌套对象变不触发**：必须用 `triggerRef(state)` 或整体替换 `state.value`。
- **Immer 输出直接赋给 `state.value`**：新值 === 旧值时跳过更新；赋一个浅拷贝即可。
- **`markRaw` 替代方案**：外部只读对象用 `markRaw(state)` 后再 `reactive`，Vue 完全跳过代理 —— 适合 immutable.js 的 Map / List。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · reactive](https://vuejs.org/api/reactivity-core.html#reactive) | 深代理 |
| [Vue 官方 · shallowRef](https://vuejs.org/api/reactivity-advanced.html#shallowref) | 引用级响应式 |
| [Vue 官方 · markRaw](https://vuejs.org/api/reactivity-advanced.html#markraw) | 跳过代理 |
| [Immer](https://immerjs.github.io/immer/) | 不可变更新库 |
| [Vue 源码 · reactive.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/reactive.ts) | Proxy handler 拆分 |