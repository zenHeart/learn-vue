> 版本: Vue 3.x | 状态: stable

# 插槽 props 解构与默认值

作用域插槽 v-slot 的解构语法允许重命名与设置默认值，与普通 JS 解构一致。

## 这是什么

```vue
<List :items="items">
  <template v-slot="{ item, index, separator: sep = '-' }">
    {{ index }}{{ sep }}{{ item }}
  </template>
</List>
```

- `item` / `index` 直接解构出
- `separator: sep` 重命名为 `sep`
- `= '-'` 提供默认值（注意：必须用默认值表达式才生效；不能 `?`）

## Vue 怎么实现

- 模板编译器在解析 `v-slot` 时把解构表达式生成函数参数：`(args) => ...`
- 运行时在 `componentSlots.ts` 中把每个插槽封装为 `(props) => normalizeSlotValue(...)`
- 解构只发生在父组件的渲染上下文中；编译期完成

## 实战中什么时候用 / 什么时候不用

**用**：

- 默认值能为组件健壮性兜底
- 重命名让消费侧更语义化

**不用**：

- 解构大量字段，可读性下降
- 嵌套解构（Vue 编译器不支持）

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/components/slots.html#scoped-slots
- https://github.com/vuejs/rfcs/discussions/2

## 常见踩坑

- 解构默认值只在父组件侧生效；子组件 `<slot :foo="x">` 没传 foo 时父组件拿到的就是 undefined
- 嵌套解构 `{ a: { b } }` 编译器不支持，会报错

## 延伸阅读

- https://cn.vuejs.org/guide/components/slots.html#scoped-slots
- https://github.com/vuejs/rfcs/discussions/2
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentSlots.ts
- https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/vSlot.ts
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/helperRenderSlots.ts
