> **版本**：Vue 3.3+ | **状态**：stable | **源码**：`packages/reactivity/src/ref.ts:170-220` | **延伸阅读**：[Vue 官方 · toRef](https://vuejs.org/api/reactivity-utilities.html#toref) | [Vue 官方 · toValue](https://vuejs.org/api/reactivity-utilities.html#tovalue) | [RFC 0232](https://github.com/vuejs/rfcs/discussions/232)

# toRef 两种签名 + toValue 与 unref 区别

## 这是什么

`toRef` 有两个签名，含义完全不同：

```ts
// 签名 1：toRef(obj, key) —— 把对象的某个字段「桥接」成 ref
const countRef = toRef(state, 'count')   // countRef.value === state.count
// 内部用 ObjectRefImpl 共享引用；写 countRef.value 也会改 state.count

// 签名 2：toRef(getter) —— 把 getter 包装成只读 ref
const lengthRef = toRef(() => state.name.length)
// getter 形式天然 read-only；底层走追踪 getter 的依赖
```

`toValue(getterOrRef)` 是 Vue 3.3 引入的「规范化」工具：

```ts
toValue(ref(1))             // 1
toValue(() => 1)            // 1（调用 getter 取值）
toValue(1)                  // 1
```

它与 `unref` 的关键差异：`unref` 只解包 ref；`toValue` 同时接受 getter / 普通值 / ref。

## 源码走读

```ts
// packages/reactivity/src/ref.ts (节选)
class ObjectRefImpl<T extends object, K extends keyof T> {
  constructor(private readonly _object: T, private readonly _key: K) {}
  get value() { return this._object[this._key] }
  set value(v) { this._object[this._key] = v }
}

export function toRef<T extends object, K extends keyof T>(object: T, key: K): Ref<T[K]>
export function toRef<T>(getter: () => T): Ref<T>     // getter 形式

export function toValue<T>(source: T | Ref<T> | (() => T)): T {
  return isFunction(source) ? source() : unref(source)
}
```

## toRef(obj, key) 实战：props 单字段桥接

把 props 拆成可写 ref 后，下游 composable 不用关心 props 是响应式 proxy 还是普通对象：

```ts
// 子组件
const props = defineProps<{ count: number }>()
const countRef = toRef(props, 'count')   // 与父组件 props.count 双向同步
const doubled = computed(() => countRef.value * 2)
```

## toRef(getter) 实战：watch 单字段

```ts
const state = reactive({ profile: { score: 10 } })

// 监听嵌套字段变化 —— getter 形式天然 deep
watch(
  toRef(() => state.profile.score),
  (next, prev) => console.log(`${prev} → ${next}`),
)
```

## toValue vs unref 决策表

| 输入 | `unref(input)` | `toValue(input)` |
|---|---|---|
| `ref(1)` | `1` | `1` |
| `() => 1` | 函数本身（不解包）| `1` |
| `1` | `1` | `1` |
| `MaybeRefOrGetter<number>` | ❌ 类型不兼容 | ✅ 解包 |

`toValue` 适用于「composable 接受 `MaybeRefOrGetter` 参数」的场景（更灵活）。

## 实战场景

1. **composable 接收 `MaybeRefOrGetter`**：`function useFoo(source: MaybeRefOrGetter<string>)` → 内部 `toValue(source)` 一行解决三种调用方式。
2. **watch 单字段**：toRef(getter) 比 watch(getter, ...) 更显式（明确意图是「订阅这个 getter 的依赖」）。
3. **解构 props 不丢响应式**：`const { count } = defineProps(...)` 会丢响应式；改用 `const count = toRef(props, 'count')`。
4. **toRef 与 toRefs 区别**：`toRefs(obj)` 一次性把对象所有字段转成 ref；`toRef(obj, key)` 只转一个字段。

## 常见踩坑

- **getter 形式被写入**：`toRef(() => state.score).value = 10` 会被警告（只读），应用 computed 包一层。
- **toRef(getter) 的依赖追踪范围**：getter 内访问的所有响应式数据都被订阅，**多访问了无关字段会触发不必要的更新**。
- **`MaybeRefOrGetter` 不要用 `unref`**：unref 不处理 getter，会返回函数引用。
- **toValue 的「副作用 getter」**：getter 内有副作用会被 toValue 调用两次（响应式追踪 + 取值），改成纯函数。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · toRef](https://vuejs.org/api/reactivity-utilities.html#toref) | 完整 API |
| [Vue 官方 · toValue](https://vuejs.org/api/reactivity-utilities.html#tovalue) | 与 unref 区别 |
| [RFC 0232 · toRef 提案](https://github.com/vuejs/rfcs/discussions/232) | getter 形式与 toValue 设计 |
| [Vue 源码 · ref.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/ref.ts) | ObjectRefImpl + toValue 实现 |