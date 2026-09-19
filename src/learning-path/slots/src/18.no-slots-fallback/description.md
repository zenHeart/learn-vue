> 版本: Vue 3.x | 状态: stable

# 插槽回退内容

`<slot>` 标签内可以放默认内容，当父组件未传该插槽时显示。同时也可以用 `useSlots()` 在 setup 阶段编程式判断。

## 这是什么

```vue
<!-- 子组件 -->
<slot>默认内容</slot>
```

```vue
<!-- 父组件 -->
<MyComp />           <!-- 显示默认内容 -->
<MyComp><template #default>自定义</template></MyComp>
```

编程式检测：

```ts
import { useSlots } from 'vue'
const slots = useSlots()
const hasDefault = !!slots.default
```

## Vue 怎么实现

- 模板编译器：`packages/compiler-core/src/transforms/vSlot.ts` 把 `<slot>` 标签转换为 `renderSlot(slots, 'default', {}, () => [默认内容])`
- `renderSlot` 第三个参数就是 fallback vnodes
- 运行时 `componentSlots.ts` 中如果父组件未传该插槽，返回 fallback

## 实战中什么时候用 / 什么时候不用

**用**：

- 通用组件暴露可定制的入口
- 自定义控件需要默认渲染

**不用**：

- 强制要求父组件传插槽——这样应当 throw error

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/components/slots.html#fallback-content
- https://cn.vuejs.org/api/composition-api-helpers.html#useslots

## 常见踩坑

- 父组件传 `<template v-slot:default></template>` 时也会触发 fallback（空也算传入）
- useSlots() 返回的对象不是 reactive；不能直接 watch

## 延伸阅读

- https://cn.vuejs.org/guide/components/slots.html#fallback-content
- https://cn.vuejs.org/api/composition-api-helpers.html#useslots
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/helpers/renderSlot.ts
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentSlots.ts
- https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transforms/vSlot.ts
