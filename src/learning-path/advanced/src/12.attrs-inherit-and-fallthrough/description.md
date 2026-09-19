> 版本: Vue 3.x | 状态: stable

# attrs 透传与 inheritAttrs

Vue 3 默认开启**属性透传**（attrs fallthrough）：父组件传入的非 props 属性，会被自动加到组件的根节点。`inheritAttrs: false` 可以关闭此行为，再用 `useAttrs()` 自行分发。

## 这是什么

```vue
<!-- 父组件 -->
<MyBox class="extra" data-info="hello" />

<!-- 子组件 -->
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
</script>
<template>
  <header v-bind="attrs" />
  <main />
</template>
```

`useAttrs()` 返回一个 reactive 对象，包含所有未被 `defineProps` 接收的属性——包括 `class` / `style` / `data-*` / 事件监听器。

## Vue 怎么实现

- `inheritAttrs: false` 会让渲染器在 patch 阶段不把 attrs 注入根节点；保留到 `instance.attrs`
- `useAttrs()` 内部返回 `getCurrentInstance().attrs`
- 多根节点模板默认会**警告** `Extraneous non-emits event listeners ...`；需要在某些根节点显式 `v-bind="$attrs"` 或关闭

## 实战中什么时候用 / 什么时候不用

**用**：

- 多根节点组件
- 把 class / style 透传到内部特定元素
- 在包装组件中保留 a11y / data 属性

**不用**：

- 单根节点默认行为已足够

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/components/attrs.html
- https://cn.vuejs.org/api/composition-api-helpers.html#useattrs

## 常见踩坑

- `defineProps` 显式声明的属性不会出现在 attrs 中
- `class` / `style` 始终会被自动合并到根节点（即使 `inheritAttrs: false`，多根场景下会触发警告）
- 监听器（如 `@click`）默认不会透传到非 props，需要显式 `v-on="$attrs"`

## 延伸阅读

- https://cn.vuejs.org/guide/components/attrs.html
- https://cn.vuejs.org/api/composition-api-helpers.html#useattrs
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentRenderUtils.ts
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentProps.ts
- https://github.com/vuejs/rfcs/discussions/468
- [Vue 源码洞察：event 修饰符 once/passive/capture 与 vue:xxx 命名空间](_analysis/vue-source-insights.md#event-修饰符oncepassivecapture-与-vuexxx-命名空间) | `packages/runtime-dom/src/modules/events.ts:71-87` 引用
