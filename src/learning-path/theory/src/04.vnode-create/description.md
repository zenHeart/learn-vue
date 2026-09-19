> 版本: Vue 3.x | 源码: packages/runtime-core/src/vnode.ts, packages/runtime-core/src/h.ts | 难度: 中等

# 04 · VNode 的 patchFlag / dynamicProps / children

## 原理是什么

Vue 3 的 VNode 不只是 `{tag, props, children}` 三件套，它是一段携带**编译期元信息**的对象：`patchFlag` 告诉 diff 阶段"这个节点哪些维度会变化"；`dynamicProps` 把"哪些 prop 是动态的"明确列出，避免运行时再 diff 整张 props 表；`children` 的类型可以是 `string`、`Array`、`Slots` 等多种形态，每种形态对应不同的 patch 路径。

`h()` 工厂（开发期也叫 `createVNode`）的职责就是把用户写的"声明式结构"标准化成这种带 hint 的 VNode 对象。

## 一步步走读源码

源码定位：

- `packages/runtime-core/src/vnode.ts` 第 65-100 行：`VNode` 接口定义与 `createBaseVNode` 实现。
- 同文件第 290-340 行：`createVNode` 把 props、children 标准化，并写入 `patchFlag`。
- `packages/runtime-core/src/h.ts`：`h` 是基于类型签名的重载层，最终调用 `createVNode`。
- `packages/shared/src/shapeFlags.ts`：`enum ShapeFlags` 描述 VNode 类型（ELEMENT / COMPONENT / TEXT_CHILDREN / ARRAY_CHILDREN 等）。

关键片段（节选自 vnode.ts）：

```ts
export const enum PatchFlags {
  TEXT = 1,              // 动态文本
  CLASS = 1 << 1,        // 2: 动态 class
  STYLE = 1 << 2,        // 4: 动态 style
  PROPS = 1 << 3,        // 8: 动态 props（动态 prop 名）
  FULL_PROPS = 1 << 4,   // 16: 完整 props diff
  NEED_HYDRATION = 1 << 7 // 128
}

// createBaseVNode 摘要
function createBaseVNode(type, props, children, patchFlag, dynamicProps) {
  const vnode = {
    type, props, children,
    patchFlag, dynamicProps,
    shapeFlag: getShapeFlag(type)
  }
  if (children) normalizeChildren(vnode, children)
  return vnode
}
```

## 为何这样设计

- **位运算 patchFlag**：一个 int 同时表达多种动态特征，diff 阶段 `if (patchFlag & PatchFlags.CLASS)` 就知道要不要走 class 比对。
- **dynamicProps**：template 里只有 `<div :id="x">` 编译器只把 id 标进 `dynamicProps`，运行时不必遍历整张 props。
- **children 多种形态**：单一 string 时走 `processText`，数组时走 `patchKeyedChildren`，对象（slots）时走 `updateSlots`。枚举化避免在 patch 里做 type sniffing。

## 性能与权衡

- 加 patchFlag 让 VNode 内存变大 ~8 字节/节点，但节省的 diff 工作远超这点开销；
- FULL_PROPS(16) 表示"我对所有 prop 做静态分析失败，必须整张 diff"，用于 v-bind="obj" 这种动态 props；
- 编译期 `hoistStatic` 标记常量节点（patchFlag = -1, HOISTED），patch 时直接复用，跳过比较。

## Vue 官方延伸阅读

- 官方文档 patchFlags: <https://template-explorer.vuejs.org/>
- 官方文档 vnode: <https://cn.vuejs.org/guide/extras/rendering-mechanism.html>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/vnode.ts>

## 对应 RFC

RFC 28: Optimized Compiler Output（patchFlag / dynamicProps 由编译器注入）

## 延伸：可手写极简版本验证

demo `04.vnode-create/App/App.vue` 手写了 `h()` 与 patchFlag 计算逻辑，并把构造过程打印到 UI。

## 参考资料

- 《Vue.js 设计与实现》霍春阳，第 8 章「挂载与更新」
- 《Vue 技术揭秘》vnode 篇 <https://ustbhuangyi.github.io/vue-analysis/data-driven/virtual-dom.html>
- 源码: <https://github.com/vuejs/core/blob/main/packages/runtime-core/src/vnode.ts>

## 源码洞察（延伸阅读）

- [Vue 源码洞察：patchProp 中 v-model 监听被忽略](_analysis/vue-source-insights.md#patchprop中v-model监听被忽略) | `packages/runtime-dom/src/patchProp.ts:28-32` 引用
- [Vue 源码洞察：模板 ref 在 v-for 中的收集顺序与异步包装](_analysis/vue-source-insights.md#模板-ref-在-v-for-中的收集顺序与异步包装) | `packages/runtime-core/src/rendererTemplateRef.ts:24-58` 引用
