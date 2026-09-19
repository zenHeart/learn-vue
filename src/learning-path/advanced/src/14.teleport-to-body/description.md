> 版本: Vue 3.x | 状态: stable

# Teleport 多目标与 disabled

`<Teleport>` 把子树渲染到 DOM 中的其他位置（默认 `body`），常用于弹窗、通知、Toast。3.x 支持多个目标与 `disabled` 属性控制是否启用。

## 这是什么

```vue
<Teleport to="body" :disabled="!open">
  <div class="modal" v-if="open">...</div>
</Teleport>
```

`to` 可以是 CSS 选择器、HTMLElement 或 `null`（不渲染）。`disabled: true` 时子节点仍在原父组件中渲染。

## Vue 怎么实现

- 入口：`packages/runtime-core/src/components/Teleport.ts`
- patch 阶段：Teleport 内部使用一个占位 anchor，把子节点的渲染目标指向 `to` 元素
- SSR 中 `<Teleport>` 不会移动节点——因为 DOM 尚未生成；需配合 `@vueuse/core` 的 `useMounted` 等

## 实战中什么时候用 / 什么时候不用

**用**：

- Modal、Dialog、Toast、Drawer
- 工具提示（Tooltip）

**不用**：

- 普通父子嵌套
- 内容必须与父组件 overflow 保持一致的场景

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/built-ins/teleport.html
- https://cn.vuejs.org/api/built-in-components.html#teleport

## 常见踩坑

- 多 Teleport 渲染到同一目标时按顺序追加
- `disabled: true` 切换会让 DOM 移动；触发一次重构
- 与 Transition 组合时使用嵌套：`<Transition>` 在 Teleport 内部

## 延伸阅读

- https://cn.vuejs.org/guide/built-ins/teleport.html
- https://cn.vuejs.org/api/built-in-components.html#teleport
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/Teleport.ts
- https://github.com/tailwindlabs/headlessui (基于 Teleport 的 a11y 组件库)
- https://github.com/vuejs/rfcs/discussions/260
