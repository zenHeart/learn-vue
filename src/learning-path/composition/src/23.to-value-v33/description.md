# toValue（3.3+）：统一 ref / getter / 原始值 {#to-value-v33}

> 版本: Vue 3.3+ | RFC: 0232-composable-utilities | 状态: stable

`toValue(source)` 把以下三种来源统一成**值本身**：

| source 类型 | 返回 |
| --- | --- |
| ref | `ref.value` |
| getter `() => T` | 调用结果 |
| 原始值 | 原样返回 |

```ts
toValue(ref(1))              // 1
toValue(() => 1)             // 1
toValue(1)                   // 1
toValue(maybeRef)            // 自动判断
```

## 为什么需要它 {#why}

写 composable 时经常需要接受"可能是 ref、可能是 getter、可能是直接值"的参数。3.3 之前要写一长串判断：

```ts
// 旧写法
function takeSource(s: Ref<string> | (() => string) | string) {
  const value = isRef(s) ? s.value : typeof s === 'function' ? s() : s
}
```

`toValue` 一行搞定，且**会自动追踪响应式**（ref 内部走 `.value` 触发依赖收集）。

## 与 unref 的区别 {#vs-unref}

| API | 处理 ref | 处理 getter |
| --- | --- | --- |
| `unref` | `ref.value` | **不调用**（返回函数本身） |
| `toValue` | `ref.value` | **调用**并返回值 |

`toValue` 是 `unref` 的"补全版"。

## 实战场景 {#production}

- **`watch` / `watchEffect` source 参数**：内部已用 `toValue` 包装；可以直接传 getter。
- **composable 接受 MaybeRefOrGetter**：

```ts
import { toValue, type MaybeRefOrGetter } from 'vue'

function useTitle(source: MaybeRefOrGetter<string>) {
  // 每次响应式更新都会重新解析
  watchEffect(() => {
    document.title = toValue(source)
  })
}
```

## 关键陷阱 {#pitfalls}

1. **`toValue` 总是返回当前值**：getter 会被调用一次，ref 会读 .value 一次。
2. **不要把返回结果缓存到非响应式变量** —— 会丢失后续更新。
3. **`MaybeRefOrGetter<T> = T | Ref<T> | (() => T)`** 是 Vue 3.3 推出的类型工具，配合 `toValue` 让 composable 签名更通用。
4. **getter 抛错会向上传播** —— `toValue` 不捕获。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · toValue](https://vuejs.org/api/reactivity-utilities.html#tovalue)
- [Vue 官方文档 · MaybeRefOrGetter](https://vuejs.org/api/reactivity-utilities.html#maybereforgetter)
- [Vue 3 源码 · toValue](https://github.com/vuejs/core/blob/main/packages/reactivity/src/index.ts)
- [RFC 0232 composable utilities](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0232-composable-utilities.md)

<!-- description.md -->
