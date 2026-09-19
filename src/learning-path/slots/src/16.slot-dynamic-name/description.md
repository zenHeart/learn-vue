> 版本: Vue 3.x | RFC: 0023-dynamic-slots | 状态: stable

# 动态插槽名

Vue 3.x 的 `v-slot:[dynamicName]` 语法允许动态绑定插槽名，与 `<slot :name="x">` 配合，让父组件根据数据决定插槽插入位置。

## 这是什么

```vue
<!-- 子组件 -->
<slot :name="dynamicSlot" />

<!-- 父组件 -->
<Tabs :active="active">
  <template #[active]>
    <p>当前激活 tab 的内容</p>
  </template>
</Tabs>
```

## Vue 怎么实现

- 编译器：`packages/compiler-core/src/transforms/vSlot.ts` 解析 `v-slot:[expr]` 中的动态表达式
- 运行时：`componentSlots.ts` 中 `dynamicSlots` 标记让插槽名按表达式计算；切换 active 时自动重新挂载

## 实战中什么时候用 / 什么时候不用

**用**：

- 通用 Tab 容器、字段渲染器
- 复用同一个布局，但内部区段不固定

**不用**：

- 固定 2-3 个插槽且不变
- 编译期就应固定的强类型场景

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/components/slots.html#dynamic-slot-names
- https://github.com/vuejs/rfcs/discussions/2

## 常见踩坑

- `[name]` 表达式不能在模板字面量内嵌字符串——必须写 `'tab-' + name` 或类似表达式
- `v-slot:default` 简写是 `#default`；动态时写 `#[name]`

## 延伸阅读

- https://cn.vuejs.org/guide/components/slots.html#dynamic-slot-names
- https://github.com/vuejs/rfcs/discussions/2
- https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/vSlot.ts
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentSlots.ts
- https://github.com/vuejs/rfcs/discussions/577
