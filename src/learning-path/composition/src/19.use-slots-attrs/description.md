# useSlots / useAttrs：组合式访问 slots 与 attrs {#use-slots-attrs}

> 版本: Vue 3.0+ | 状态: stable

模板里 `$slots` / `$attrs` 自动可用；`<script setup>` 中则需通过 `useSlots()` / `useAttrs()` 访问。

```ts
const slots = useSlots()      // { default?: Slot, header?: Slot, ... }
const attrs = useAttrs()      // Proxy<Record<string, any>>
```

## 与 setup 返回值 vs useSlots 的区别 {#vs-setup}

`<script setup>` 编译时会自动把 `useSlots()` / `useAttrs()` 调用注入；你也可以**显式 import** 来：

1. **JSX / 函数式渲染**中拿到 slots 调用（`slots.default?.()`）。
2. **手动判断某个 slot 存在**：`slots.footer ? renderFooter : null`。
3. **透传 attrs 到内部元素**：`v-bind="attrs"` 让 root 元素继承非 prop 属性。

## useSlots 返回结构 {#slots-structure}

```ts
useSlots()
// {
//   default?: () => VNode[],
//   named?: () => VNode[],
//   __fallback?: true   // 老式 $scopedSlots 兼容
// }
```

每个 slot 是**函数**，调用才返回 VNode 数组（懒求值，避免无用的渲染）。

## useAttrs 返回结构 {#attrs-structure}

`attrs` 是 Proxy，包含所有传给组件但**未在 props 中声明**的属性，包括：

- class / style
- 普通 HTML attribute
- v-on 监听器（驼峰化，如 `onClick`）
- 自定义事件

## 关键陷阱 {#pitfalls}

1. **`inheritAttrs: false`**：默认情况下 attrs 自动应用到 root 元素。设为 false 后必须手动 `v-bind="$attrs"`（或 `useAttrs()`）。
2. **多 root 元素**：必须显式 `v-bind="$attrs"` 到某个 root，否则 Vue 警告（runtime warning）。
3. **`useAttrs()` 不返回 class/style 转换结果**：直接拿到原始字符串 / 对象。
4. **多个 root + v-bind="$attrs"**：会**复制**监听器到所有 root，可能导致事件触发两次。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · useSlots](https://vuejs.org/api/composition-api-helpers.html#useslots)
- [Vue 官方文档 · useAttrs](https://vuejs.org/api/composition-api-helpers.html#useattrs)
- [Vue 官方文档 · Fallthrough Attributes](https://vuejs.org/guide/components/attrs.html)
- [Vue 3 源码 · componentRenderUtils.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentRenderUtils.ts)

<!-- description.md -->
