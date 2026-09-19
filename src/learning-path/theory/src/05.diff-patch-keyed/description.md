> 版本: Vue 3.x | 源码: packages/runtime-core/src/patchKeyedChildren.ts | 难度: 中高

# 05 · 同级 keyed 对比算法与最长递增子序列

## 原理是什么

Vue 3 在同级 keyed 子节点之间执行 `patchKeyedChildren`，按"双端 BFS + LIS"思路工作：

1. **头头**（i, i）相等：i++。
2. **尾尾**（e1, e2）相等：e1--/e2--。
3. **头尾**（i, e2）相等：把 old[i] 移动到尾部。
4. **尾头**（e1, i）相等：把 old[e1] 移动到头部。
5. 五种简单情形不命中后，构造 `newIndexToOldIndexMap`，对剩余 old 节点建立 key→index 索引；用 LIS 求出"可原地复用"的最长序列，其余节点按 `anchor + 1` 调用 `insert`。

Vue 2 用的是双端 + 4 次命中，diff 复杂度 O(n)；Vue 3 引入 LIS 后，对于"长列表后插入几行"或"列表完全乱序但 key 稳定"的场景，可原地复用的最大子集无需移动，整体移动次数接近最优。

## 一步步走读源码

源码定位：

- `packages/runtime-core/src/patchKeyedChildren.ts` 全文 ~280 行。
- 第 50-80 行：头头 / 尾尾 / 头尾 / 尾头 4 个 quick path。
- 第 110-160 行：`newIndexToOldIndexMap` 构造 + LIS 调用 `getSequence`。
- `packages/shared/src/toDisplayString.ts` 同级目录：`getSequence` 本身用二分贪心，O(n log n)。

关键片段：

```ts
// patchKeyedChildren.ts
function patchKeyedChildren(c1, c2, ...) {
  let i = 0, e1 = c1.length - 1, e2 = c2.length - 1
  // 1. 头头
  while (i <= e1 && i <= e2 && sameVNode(c1[i], c2[i])) i++
  // 2. 尾尾
  while (i <= e1 && i <= e2 && sameVNode(c1[e1], c2[e2])) { e1--; e2-- }
  // 3 & 4. 头尾 / 尾头
  if (i > e1) mountChildren(c2.slice(i, e2 + 1), ...)        // 全部新增
  else if (i > e2) unmountChildren(c1.slice(i, e1 + 1))      // 全部删除
  else {
    // 5. 构造 map 与 newIndexToOldIndexMap
    const s1 = i, s2 = i
    const keyToNewIndexMap = new Map()
    for (i = s2; i <= e2; i++) keyToNewIndexMap.set(c2[i].key, i)
    const newIndexToOldIndexMap = new Array(e2 - s2 + 1).fill(0)
    // ...
    // 求 LIS，把非 LIS 节点移动到 anchor
    const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap)
  }
}
```

## 为何这样设计

- **双端先行**：前置/后置的简单情形能在 O(1) 命中，省掉构造 Map 的代价。
- **key → index Map**：把"在 old 中找 key" 从 O(n) 降到 O(1)；没有 key 时降级为"按位匹配"。
- **LIS**：最大化"哪些节点不需要移动"。对常见"列表尾部追加 / 中间插入"场景，移动次数接近最优解。

## 性能与权衡

- 整体复杂度 O(n) 双端命中 + O(n log n) LIS；
- 无 key 的退化路径性能差，编译器会给出 `<template v-for>` 警告；
- 与 Vue 2 的 4 指针对比，Vue 3 在大列表随机移动的场景下 DOM 移动次数可降低 ~30%。

## Vue 官方延伸阅读

- 官方文档: <https://cn.vuejs.org/guide/best-practices/performance.html#list-stable-index-key>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/patchKeyedChildren.ts>
- 渲染机制: <https://cn.vuejs.org/guide/extras/rendering-mechanism.html>

## 对应 RFC

RFC 28: Optimized Compiler Output（含 keyed diff 算法说明）

## 延伸：可手写极简版本验证

demo `05.diff-patch-keyed/App/App.vue` 把头头/尾尾/头尾/尾头/LIS 五个分支手写出来，并在 UI 中可视化每一步。

## 参考资料

- 《Vue.js 设计与实现》霍春阳，第 9 章「简单 Diff 算法」「双端 Diff 算法」「快速 Diff 算法」
- 《Vue 技术揭秘》update 篇 <https://ustbhuangyi.github.io/vue-analysis/data-driven/update.html>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/patchKeyedChildren.ts>

## 源码洞察（延伸阅读）

- [Vue 源码洞察：TransitionGroup 的 key 复用与 move-class 触发](_analysis/vue-source-insights.md#transitiongroup-的-key-复用与-move-class-触发) | `packages/runtime-core/src/components/TransitionGroup.ts` 引用
- [Vue 源码洞察：模板 ref 在 v-for 中的收集顺序与异步包装](_analysis/vue-source-insights.md#模板-ref-在-v-for-中的收集顺序与异步包装) | `packages/runtime-core/src/rendererTemplateRef.ts:24-58` 引用
