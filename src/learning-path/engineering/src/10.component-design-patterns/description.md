> 版本: Vue 3 | RFC: — | 状态: stable | 概念: 组件设计模式

# 组件设计模式选型指南

## 你会学到什么

- Container / Presentational：数据与展示分离
- Compound Components：`<Select>` + `<Select.Option>` 隐式共享
- Headless：完全无样式，逻辑复用
- Polymorphic：`as` prop 切换根元素
- Render Props / Slot Composition：把渲染权交给消费者

## 模式速览

| 模式 | 一句话 |
|------|--------|
| Container | 拿数据，渲染 Presentational |
| Presentational | 只接 props，渲染 UI |
| Compound | 父组件 provide，子组件 inject |
| Headless | 无样式，行为可复用 |
| Polymorphic | `as` prop 决定根节点 |
| Render Props | `<List :items v-slot="{ item }">` |
| Slot Composition | 用 slot 替换任意片段 |

## 选型决策

```
展示简单？   yes → Presentational
需要状态共享？ yes → Compound / Headless
需要换根元素？ yes → Polymorphic
需要自定义渲染？ yes → Slot / Render Props
```

## 关键示例（Headless）

```vue
<script setup>
const isOpen = ref(false)
function toggle() { isOpen.value = !isOpen.value }
provide('dropdown', { isOpen, toggle })
</script>
<template>
  <div class="dropdown">
    <slot :is-open="isOpen" :toggle="toggle" />
  </div>
</template>
```

## 动手试

1. 看下方模式卡片
2. 选择「需求场景」查看推荐模式
3. 切换「复杂度」对比适用规模

## 修复 / 选型

- 简单场景优先 Presentational
- 跨页面复用行为 → Headless（Radix Vue / Headless UI）
- 灵活渲染 → Slot Composition

## 延伸阅读

- [Vue Patterns](https://www.patterns.dev/vue/)

## 小结

1. **场景**：组件怎么拆分。
2. **原则**：单一职责 + 复用边界清晰。
3. **选型**：按交互复杂度递增。
