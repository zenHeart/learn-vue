> 版本: Vue 3.x | 源码: packages/compiler-core/src/transforms/hoistStatic.ts, packages/compiler-core/src/transforms/transformElement.ts, packages/compiler-core/src/transforms/vOn.ts, packages/shared/src/patchFlags.ts | 难度: 中等

# 12 · 编译期优化：hoistStatic / PatchFlag / Block Tree

## 原理是什么

Vue 3 编译器在 transform 阶段对模板做了三类关键优化：

1. **静态提升 (hoistStatic)**：把所有"无绑定、纯静态"的节点从 render 函数体内提取到模块作用域的 `_hoisted_*` 常量；diff 时直接复用，不再参与 patch。
2. **PatchFlag 标记**：动态节点上贴一个 int 位掩码描述"哪里会变"，diff 阶段只检查对应字段。
3. **Block Tree**：把"结构稳定、根有动态内容"的子树收集为 block（_createElementBlock / _createBlock），patch 时只在 block 之间比较，跳过中间的静态节点。

加上 `cacheStringify`（字符串字面量去重）、`transformOn`（事件缓存为 `_cache[0]`）等组合，Vue 3 的 diff 工作量比 Vue 2 缩减 2-3 倍。

## 一步步走读源码

源码定位：

- `packages/shared/src/patchFlags.ts` 全文：`enum PatchFlags` 数值定义。
- `packages/compiler-core/src/transforms/hoistStatic.ts` 第 30-80 行：`hoist` 节点 + `walk` 收集。
- `packages/compiler-core/src/transforms/transformElement.ts` 第 180-220 行：把 patchFlag 写入 props。
- `packages/compiler-core/src/transforms/vOn.ts` 第 40-80 行：cache 事件函数。
- `packages/compiler-core/src/transforms/transformText.ts`：相邻文本 + 表达式的合并。

PatchFlag 数值表：

```ts
export const enum PatchFlags {
  TEXT = 1,
  CLASS = 1 << 1,          // 2
  STYLE = 1 << 2,          // 4
  PROPS = 1 << 3,          // 8
  FULL_PROPS = 1 << 4,     // 16
  NEED_HYDRATION = 1 << 7, // 128
  STABLE_FRAGMENT = 1 << 8,
  KEYED_FRAGMENT = 1 << 9,
  UNKEYED_FRAGMENT = 1 << 10,
  NEED_PATCH = 1 << 11,
  DYNAMIC_SLOTS = 1 << 12
}
```

关键片段：

```ts
// hoistStatic.ts
export const transformHoist: NodeTransform = (node, context) => {
  if (node.type === NodeTypes.ELEMENT && isStaticNode(node, context)) {
    // 标记为可提升
    ;(node as any).hoist = true
  }
}

// transformElement.ts
function buildProps(node, context) {
  const patchFlag = inferPatchFlag(props, dynamicProps)
  return { ...props, patchFlag, dynamicProps }
}
```

## 为何这样设计

- **PatchFlag 自带位运算**：一个数字同时表达多种动态特征，避免对象判断。
- **Block 收集**：避免递归整树，把"跳级"的静态节点排除在 diff 外。
- **静态提升**：消除重复对象创建；特别是 v-for 中的静态前缀（key 之类）收益最大。

## 性能与权衡

- 静态提升：render 函数每次执行少创建 N 个对象；
- PatchFlag：减少 diff 时遍历 props 的字段数；
- Block Tree：当嵌套深且中间是常量时，跳过大量比较。

## Vue 官方延伸阅读

- 官方 template-explorer: <https://template-explorer.vuejs.org/>
- 源码 patchFlags: <https://github.com/vuejs/core/blob/main/packages/shared/src/patchFlags.ts>
- 源码 hoist: <https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/hoistStatic.ts>

## 对应 RFC

RFC 28: Optimized Compiler Output（编译期优化的总纲）

## 延伸：可手写极简版本验证

demo `12.template-optimize/App/App.vue` 给定一个模板，模拟 hoist + patchFlag + Block Tree 三个优化，并把提升后的 render function 显示出来。

## 参考资料

- 《Vue.js 设计与设计》霍春阳，第 17 章「转换器」
- 《Vue 技术揭秘》optimize 篇 <https://ustbhuangyi.github.io/vue-analysis/vue3/optimize.html>
- 源码: <https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/hoistStatic.ts>

## 源码洞察（延伸阅读）

- [Vue 源码洞察：patchProp 中 v-model 监听被忽略](_analysis/vue-source-insights.md#patchprop中v-model监听被忽略) | `packages/runtime-dom/src/patchProp.ts:28-32` 引用
- [Vue 源码洞察：defineOptions / defineSlots 宏的编译器展开](_analysis/vue-source-insights.md#defineoptions--defineslots宏的编译器展开) | `packages/compiler-sfc/src/script/defineOptions.ts:18-72` 引用
