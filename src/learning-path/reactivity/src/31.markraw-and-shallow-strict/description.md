# markRaw + shallowRef/shallowReactive：大对象与循环引用 {#markraw-and-shallow-strict}

> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/reactivity/src/reactive.ts`、`packages/reactivity/src/shallowRef.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/reactivity-advanced.html#markraw) | [Vue 官方 · shallowRef](https://vuejs.org/api/reactivity-advanced.html#shallowref)

`markRaw(obj)` 给对象打 `__v_skip: true` 标记，**永远不被 Proxy 代理**。配合 `shallowRef` / `shallowReactive` 可避免大型数据 / 第三方实例的代理开销与循环引用问题。

| 工具 | 行为 |
|---|---|
| `markRaw(obj)` | 给 obj 打标记；后续 `reactive(obj)` 直接返回原对象 |
| `shallowRef(obj)` | ref.value 是浅引用；ref.value 整体替换才触发更新 |
| `shallowReactive(obj)` | 仅代理顶层属性；嵌套对象不响应 |

## 这是什么 {#what}

```ts
// 第三方实例：避免 Proxy 干扰内部状态
const map = markRaw(new MapBox())
const mapRef = shallowRef(map)

// 大数据：避免深代理开销
const bigData = markRaw(hugeParsedJSON)
const dataRef = shallowRef(bigData)
dataRef.value = bigData   // 整体替换才更新；不替换时改 bigData 字段不响应

// 循环引用：markRaw 切断响应式追踪
class Node {
  child: Node | null = null
}
const root = markRaw(new Node())
root.child = new Node()  // 不会触发响应式
```

## 源码走读 {#source}

```ts
// packages/reactivity/src/reactive.ts
export function reactive(target) {
  if (target[ReactiveFlags.RAW]) return target   // 已代理过直接返回
  if (target[ReactiveFlags.IS_REACTIVE]) return target
  return createReactiveObject(target, ...)
}

function createReactiveObject(target, ...) {
  if (target[ReactiveFlags.SKIP]) return target  // markRaw 标记：直接返回
  // 否则创建 Proxy
}

// packages/reactivity/src/shallowRef.ts
class ShallowRefImpl {
  constructor(value, public shallow) {
    this._value = shallow ? value : toReactive(value)  // shallow=true 时不深转换
  }
}
```

关键事实：

- **`markRaw` 不可逆**：标记 `__v_skip` 后无法取消；如需响应式得换新对象。
- **`shallowRef` 是浅 ref**：`ref.value` 不深代理，整体赋值才触发 update。
- **`shallowReactive` 是浅 reactive**：仅代理顶层属性；嵌套 ref / object 不会变响应式。
- **三者配合**：第三方实例 + 大数据 + 循环引用场景时组合使用效果最佳。

## 实战场景 {#production}

1. **地图 SDK**：`const map = markRaw(new Mapbox(...))`，避免地图内部状态被代理。
2. **图表库**：ECharts 实例（包含大量内部属性）—— markRaw + shallowRef。
3. **大数据 JSON**：一次加载 10MB 数据，markRaw 避免深代理的性能损耗。
4. **类实例循环引用**：DOM 节点树、AST 树等循环引用结构 —— markRaw 切断追踪。
5. **worker 通信**：postMessage 序列化前 `toRaw`，避免 Proxy 不可序列化。

## 常见踩坑 {#pitfalls}

- **markRaw 后改字段不响应**：标记后整个对象脱离响应式；改属性不会触发更新，必须替换整体。
- **shallowRef 整体替换才响应**：`shallowRef({ a: 1 }).value.a = 2` 不会触发；需要 `shallowRef.value = { a: 2 }`。
- **shallowReactive 嵌套 ref**：嵌套对象的 ref 不会被自动解包 —— 必须用 ref() 包裹并替换。
- **markRaw 时机**：必须在 `reactive(obj)` **之前**标记；已代理的对象打 markRaw 无效。
- **toRaw 仅剥一层**：深层嵌套对象仍是 Proxy；深拷贝用 `structuredClone(toRaw(obj))`。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方 · markRaw](https://vuejs.org/api/reactivity-advanced.html#markraw) | API |
| [Vue 官方 · shallowRef](https://vuejs.org/api/reactivity-advanced.html#shallowref) | API |
| [Vue 官方 · shallowReactive](https://vuejs.org/api/reactivity-advanced.html#shallowreactive) | API |
| [Vue 源码 · reactive.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/reactive.ts) | 实现 |
| [Vue 源码 · shallowRef.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/shallowRef.ts) | shallowRef 实现 |
| [`reactivity/23.toRaw-and-markraw`](#) | 基础 toRaw/markRaw |
| [`reactivity/24.shallow-ref-and-trigger`](#) | shallowRef + triggerRef |
