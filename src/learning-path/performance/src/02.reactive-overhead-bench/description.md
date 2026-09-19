> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: 响应式开销基准

# reactive vs shallowReactive vs ref vs shallowRef 基准

## 你会学到什么

- `reactive` / `shallowReactive` / `ref` / `shallowRef` 在 **写入 1000 次 + 读取 1000 次** 的耗时差距
- 何时该选 `shallowRef` 持有外部不可变数据
- Proxy 嵌套代理的开销与 `markRaw` 的边界

## 真实场景（抽象）

把一个 1000 项的列表塞进四种响应式容器，做同一段写入 + 读取循环，统计耗时。

## 动手试

1. 点击「跑基准」
2. 观察四种实现的耗时：`shallowRef` 通常是 `reactive` 的 5–10 倍速差
3. 把规模改到 5000 再跑，对比差距是否线性放大

## 根因

`reactive` 会递归代理每个属性：`get` / `set` 都进入 Proxy trap，更新时还要遍历 effect 队列。`shallowRef` 只对 `.value` 自身做一层代理，内部对象保持原样，跳过逐键追踪。

## 修复 / 选型

| 容器 | 适用 |
|------|------|
| `ref({...})` | 单值或小对象 |
| `reactive({...})` | 需要深度响应、字段频繁更新 |
| `shallowRef({...})` | 整体替换（`value = newObj`）、外部不可变数据 |
| `shallowReactive({...})` | 根属性需要追踪、嵌套字段不动 |

## 延伸阅读

- [Reduce Reactivity Overhead for Large Immutable Structures](https://vuejs.org/guide/best-practices/performance.html#reduce-reactivity-overhead-for-large-immutable-structures)
- [shallowRef / shallowReactive API](https://vuejs.org/api/reactivity-advanced.html#shallowref)

## 小结

1. **现象**：reactive 大对象写入慢。
2. **复现**：基准对比四种实现。
3. **修复**：按数据形态选 shallow / deep 容器。
