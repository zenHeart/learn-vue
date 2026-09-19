> **版本**：Vue 3.x | **状态**：stable（实例属性） | **源码**：`packages/runtime-core/src/componentPublicInstance.ts:240-280`

# `$forceUpdate` 与 `$children`

## 这是什么

`$forceUpdate` 是组件实例上的强制更新方法，调用后强制让当前实例触发一次 re-render，等价于「不管响应式依赖变没变，都重新跑一遍 render」。在 Vue 2 中经常被用来「强制刷新视图」；Vue 3 不推荐它，因为绝大多数场景下响应式系统能自动追踪依赖。但它仍然保留，作为逃生口——例如遇到不可控的第三方库修改了实例状态、或者响应式追踪失效（`markRaw` / `shallowRef` 场景）时使用。

`$children` 是当前组件的**直接子组件实例数组**，按 mount 顺序排列。Vue 2 中是组件间通信的主要通道之一；Vue 3 推荐用 `provide` / `inject` 或 `v-model` 替代 `$children`（理由是「隐式耦合、反向依赖、SSR 下为空」）。但当父组件确实需要操作子组件实例（例如编程式触发方法、聚焦 `useTemplateRef` 不便表达的子组件）时，`$children` 仍可用。

```ts
// 内部签名（packages/runtime-core/src/componentPublicInstance.ts:240-280）
const publicPropertiesMap: PublicPropertiesMap = extend(Object.create(null), {
  $forceUpdate: i => () => forceUpdate(i),        // 调用时强制 forceUpdate(instance)
  $children: i => getComponentChildren(i),        // 当前实例的子组件实例数组
  // ...
})
```

注意：`forceUpdate` 并非「重新创建组件」，它只让组件走到 `instance.update()` 路径，触发 patch。

## 源码走读

```ts
// packages/runtime-core/src/renderer.ts:forceUpdate 实现
export function forceUpdate(instance: ComponentInternalInstance) {
  if (instance.isMounted) {
    instance.update()      // 走 updateComponent → render → patch
  }
}

// packages/runtime-core/src/component.ts:getComponentChildren
export function getComponentChildren(instance) {
  return instance.subTree
    ? filterSingleRoot(instance.subTree.children)
    : EMPTY_ARR
}
```

`$children` 只反映**当前 subTree** 的子节点；条件渲染（`v-if`）会让子组件临时从数组中消失。

## 实战场景

1. **第三方 DOM 操作后强制刷新**：jQuery / G2 / ECharts 等库直接修改 DOM 后，需要 Vue 重新评估布局。`$forceUpdate` 让 patch 流程再跑一遍，子组件的 watcher 重新检查。
2. **错误回滚后整树刷新**：异步操作失败，状态 partial update 复杂，直接 `forceUpdate` 让所有依赖重新计算。
3. **子组件实例集中调度**：例如父组件有多个步进器（Stepper），通过 `$children` 收集所有 stepper 实例并一次性 reset（按现代写法应改用 `provide('resetAll', () => void)`）。
4. **Composition API 中无 $children**：`<script setup>` 没有 `this`，拿不到 `$children`；要么用 `getCurrentInstance()`，要么改 `useTemplateRef`。

## 常见踩坑

- **`$forceUpdate` 不能替代响应式**：滥用会让依赖关系模糊、组件不可预测；只在「响应式追踪断了」时使用。
- **`$children` 是「直接」子组件**，不包含孙组件。要遍历整棵树用 `vNode` 遍历或递归 `$children`。
- **`v-if` 卸载期间**，`$children` 中对应实例会被移除；不要缓存索引。
- **SSR 下 `$children` 为空**：服务端没 mount，`getComponentChildren` 返回 `EMPTY_ARR`。
- **`$forceUpdate` 不影响子组件**：它只触发当前实例的 update；子组件依赖没变也不会重渲染。
- **Composition API 中 `forceUpdate` 仍可通过 `getCurrentInstance()` 调用**，但官方明确反对此写法。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 API](https://cn.vuejs.org/api/component-instance.html#forceupdate) | `$forceUpdate` 文档 |
| [Vue 官方 API](https://cn.vuejs.org/api/component-instance.html#children) | `$children` 文档 |
| [Vue 源码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentPublicInstance.ts) | `publicPropertiesMap` 中的 `$forceUpdate` / `$children` 注册 |
| [Vue 源码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts) | `forceUpdate()` 走 `instance.update()` |