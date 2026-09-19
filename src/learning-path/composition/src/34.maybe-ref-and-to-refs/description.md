> **版本**：Vue 3.3+ | **RFC**：0232-composable-utilities | **状态**：stable | **源码**：`packages/reactivity/src/index.ts` | **延伸阅读**：[Vue 官方 · MaybeRef](https://vuejs.org/api/reactivity-utilities.html#mayberef) | [Vue 官方 · toRefs](https://vuejs.org/api/reactivity-utilities.html#torefs)

# MaybeRef 与 toRefs：可组合函数的类型签名

## 这是什么

`MaybeRef<T>` 是 Vue 3.3 推出的复合类型别名：

```ts
type MaybeRef<T> = T | Ref<T>
type MaybeRefOrGetter<T> = T | Ref<T> | (() => T)
```

它的存在理由是：**composable 不应该强迫调用者用 `ref()` 包一层**。使用者传 `42`、`ref(42)`、`() => 42` 都应该被接受，函数内部用 `toValue()` 解包。

```ts
import { toValue, type MaybeRefOrGetter } from 'vue'

// 这就是 VueUse / Vue Router 内部工具函数的常见签名
function useTitle(source: MaybeRefOrGetter<string>) {
  watchEffect(() => {
    document.title = toValue(source)
  })
}

useTitle('静态标题')          // 字符串
useTitle(ref('响应式'))       // Ref
useTitle(() => `prefix-${ref.value}`)  // getter
```

### toRefs：从对象解构出 ref

`toRefs()` 把响应式对象的每个属性转化为同名的 `ref`，主要用于**保留响应式地解构**。直接 `const { name, age } = reactive(obj)` 会丢失响应性，`toRefs(obj)` 之后再解构就能避免。

```ts
const state = reactive({ count: 0, name: 'vue' })
const { count, name } = toRefs(state)
// count.value / name.value 都是响应式的

// 与 lib 模式搭配：composable 返回对象时，把内部 state 转为 ref
export function useCounter() {
  const state = reactive({ count: 0, double: computed(() => state.count * 2) })
  return toRefs(state)  // 调用方拿到 { count, double } 都是 ref
}
```

## 源码走读

`packages/reactivity/src/index.ts`：

- `L185` `MaybeRef<T>` 类型别名
- `L186` `MaybeRefOrGetter<T>` 类型别名
- `L220` `toValue` 函数实现（处理 ref / getter / 普通值）
- `L101` `toRefs` 实现：遍历响应式对象每个 key，转成 `Ref<T>`，保留响应性追踪

类型别名是纯编译期产物，运行时无成本。

## 实战场景

1. **写自己的 composable**：所有可组合函数的 source 参数都应该是 `MaybeRefOrGetter<T>`，避免对调用者强加 ref 包装。
2. **从 reactive 对象解构**：`const { count } = toRefs(state)`，count 仍是响应式，模板里 `{{ count }}` 自动解包。
3. **VueUse 内部模式**：VueUse 每个 composable 的参数都是 MaybeRefOrGetter，传入普通值也能工作——这是它的可组合性核心。
4. **跨 store 传递**：pinia store 的 state 是 reactive，组件里用 `toRefs(store)` 解构出 ref 用于 prop 传递。

## 常见踩坑

- **`MaybeRef<T>` 不包含 getter**：如果想支持 `() => T`，必须用 `MaybeRefOrGetter<T>`。toValue 对两者都生效。
- **`toRefs` 仅作用于 reactive**：对普通对象 `{ a: 1 }` 调用 toRefs 会抛 warning；先用 `reactive()` 包装。
- **解构出来的 ref 仍是"代理"**：模板里 `{{ count }}` 自动解包，但 JS 中必须 `count.value`。
- **不要滥用 toRefs**：返回 reactive 对象本身也很常用；toRefs 主要用于"对外提供独立的 ref 引用"或"解构保留响应性"两种场景。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · MaybeRef](https://vuejs.org/api/reactivity-utilities.html#mayberef) | 类型定义 |
| [Vue 官方 · MaybeRefOrGetter](https://vuejs.org/api/reactivity-utilities.html#maybereforgetter) | 含 getter 版本 |
| [Vue 官方 · toValue](https://vuejs.org/api/reactivity-utilities.html#tovalue) | 解包函数 |
| [Vue 官方 · toRefs](https://vuejs.org/api/reactivity-utilities.html#torefs) | 响应式对象 → ref 集合 |
| [Vue 源码 · reactivity/index.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/index.ts) | 实现 |
| [RFC 0232 · composable-utilities](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0232-composable-utilities.md) | MaybeRef 设计动机 |
| [VueUse 文档](https://vueuse.org/) | MaybeRefOrGetter 实践范例 |