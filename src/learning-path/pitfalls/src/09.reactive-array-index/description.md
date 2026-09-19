> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: ref 包装数组

# 响应式数组索引的引用陷阱

## 你会学到什么

- `arr[0].name = 'x'` 修改对象字段，ref 持有的数组索引变化但 `arr.value[0]` 引用更新
- `reactive(arr)` 数组的索引访问走 Proxy，但 `arr[0] = newObj` 会替换数组项
- shallowRef 数组替换整体引用 vs reactive 数组修改内部

## 错误示例

```js
const arr = ref([{ name: 'A' }, { name: 'B' }])
const a = arr.value[0]        // 普通对象引用
arr.value[0] = { name: 'A*' } // 整体替换，a 仍指向旧对象
console.log(a.name)           // 仍是 'A'
```

## 修复

```js
// 用 reactive 或整体替换
const arr = reactive([{ name: 'A' }])
arr[0].name = 'A*'  // 修改字段，arr[0] 仍引用同一 Proxy

// 或者
const arr = shallowRef([{ name: 'A' }])
arr.value = arr.value.map((x, i) => i === 0 ? { ...x, name: 'A*' } : x)
```

## 动手试

1. 点击「错误：arr.value[0] 重新赋值」 — `first.name` 仍为旧值
2. 点击「修复：arr.value[0].name = ...」 — 字段更新
3. 点击「修复：reactive 数组」 — 全部跟踪

## 根因

`arr.value[0]` 是普通对象引用；赋值 `arr.value[0] = ...` 替换数组项，**旧引用不变**。`reactive` 数组的所有索引访问都走 Proxy，每次返回同一 Proxy。

## 修复 / 选型

- 单字段更新：`arr.value[0].name = ...`
- 整体替换：`arr.value = newArr`
- 频繁更新：`reactive([...])`

## 延伸阅读

- [Reactive Array Caveats](https://vuejs.org/guide/essentials/list.html#array-change-detection)
- [Vue 源码洞察：arrayInstrumentations 处理副作用读取](_analysis/vue-source-insights.md#arrayinstrumentations处理arrayconcatincludesindexof等副作用读取) | `packages/reactivity/src/arrayInstrumentations.ts:42-60` 引用

## 小结

1. **现象**：改字段但旧引用仍指向老值。
2. **复现**：错误版本旧引用未更新。
3. **修复**：改字段而非赋值索引。
