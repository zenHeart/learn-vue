> 版本: Vue 3.3+ | RFC: 0005-define-options | 状态: stable (3.3+)

# defineOptions 组件选项宏

`defineOptions` 是 3.3 引入的编译期宏，允许在 `<script setup>` 内部声明顶层组件选项，如 `name`、`inheritAttrs`、`customOptions`。

## 这是什么

```vue
<script setup lang="ts">
defineOptions({
  name: 'MyComp',
  inheritAttrs: false,
  customOptions: { foo: true },
})
</script>
```

等价于在 Options API 中：

```ts
export default {
  name: 'MyComp',
  inheritAttrs: false,
  customOptions: { foo: true },
}
```

它解决了 `<script setup>` 无法直接写 `name` 的痛点——之前需要再写一个 `<script>` 块配合 export default。

## Vue 怎么实现

- 编译器：`packages/compiler-sfc/src/script/defineOptions.ts`，把 `defineOptions` 调用合并到最终 `default export` 的选项对象
- 运行时不需要额外逻辑，因为这是纯编译时合并

## 实战中什么时候用 / 什么时候不用

**用**：

- 给 unplugin-vue-components 自动注册提供 `name`
- 设置 `inheritAttrs: false` 配合 `useAttrs` 多根节点分发
- 关闭某些 dev 警告：`__name`、`__file`、`__scopeId` 等隐藏字段

**不用**：

- 普通应用层组件已经有显式 import，无需 name
- 需要兼容 Vue 2 时（3.3+ 才支持）

## 官方文档延伸阅读

- https://cn.vuejs.org/api/sfc-script-setup.html#defineoptions
- https://github.com/vuejs/rfcs/discussions/502

## 常见踩坑

- `defineOptions` 必须出现在 `<script setup>` 顶层，不允许在条件分支中调用
- 与 `defineExpose` / `defineModel` 等宏一起使用没有顺序要求
- 不允许在 `defineOptions` 中再次声明 `setup()` / `render()`
- `customOptions` 不会被 Vue 运行时解释，需要由插件（如 vue-i18n）自行读取

## 延伸阅读

- https://cn.vuejs.org/api/sfc-script-setup.html#defineoptions
- https://github.com/vuejs/rfcs/discussions/502
- https://github.com/vuejs/core/blob/main/packages/compiler-sfc/src/script/defineOptions.ts
- https://github.com/vuejs/core/blob/main/packages/compiler-sfc/src/script/utils.ts
- https://github.com/unplugin/unplugin-vue-components
- [Vue 源码洞察：defineOptions / defineSlots 宏的编译器展开](_analysis/vue-source-insights.md#defineoptions--defineslots宏的编译器展开) | `packages/compiler-sfc/src/script/defineOptions.ts:12-87` 引用
