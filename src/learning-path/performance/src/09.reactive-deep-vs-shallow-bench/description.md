> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: 深嵌套响应式基准

# 深嵌套 reactive vs shallowReactive 批量更新基准

## 你会学到什么

- 嵌套 5 层的 `reactive` 对象与 `shallowReactive` 在批量更新场景下的差异
- `reactive` 会递归创建代理，初始内存 + 首次访问都更慢
- 批量更新时 `reactive` 走完所有层级的 trigger 队列；`shallowReactive` 只在顶层触发

## 真实场景（抽象）

一棵五层嵌套树：root → a → b → c → d → leaf。批量修改 1000 个 leaf 节点的 `value`，观察总耗时。

## 动手试

1. 点击「跑深 reactive」 — 看到首次代理 + 写入耗时
2. 点击「跑 shallow」 — 仅顶层代理，写入明显更快
3. 反复切换查看差距

## 根因

`reactive(obj)` 第一次访问深层属性时，会逐层 `reactive(child)`。这意味着：
- 首次访问触发多次 `get` trap
- 写入时多个层级的 effect 都要被通知
- 内存占用大（每层一个 Proxy）

`shallowReactive` 只代理顶层，写入只触发顶层 effect。

## 修复 / 选型

- 数据形态扁平 → `shallowReactive`
- 嵌套结构整体替换 → `shallowRef({ ...bigTree })`
- 频繁改叶子节点 → 用 plain object + 整体替换

## 延伸阅读

- [Reactivity API — shallowReactive](https://vuejs.org/api/reactivity-advanced.html#shallowreactive)
- [Vue 源码洞察：reactive 对 Array / Map / Set / WeakMap 的代理限制](_analysis/vue-source-insights.md#reactive对arraymapsetweakmap的代理限制) | `packages/reactivity/src/reactive.ts:52-66,267-300` 引用

## 小结

1. **现象**：深嵌套更新慢。
2. **复现**：基准对比两种实现。
3. **修复**：按访问形态选 shallow / deep。
