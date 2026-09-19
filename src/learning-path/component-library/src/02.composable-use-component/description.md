> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: composable useXxx 组件封装

# 02 · Headless 范式：composable + 用户样式

## 你会学到什么

Headless UI / Reka UI / Radix Vue 都是「无样式交互核心 + 用户样式封装」范式。
本 demo 实现一个 `useToggle()` composable + 一个 `<ToggleHeadless>` 无样式组件，
然后演示两种消费方式：

1. **消费方完全自定义 DOM 与样式**（Headless 范式核心）
2. **headless 核心包一层 CSS**，得到一个「自带样式但仍可覆盖」的组件

这与 Element Plus 自带样式的 Button 形成对比 —— 后者样式写在组件内部，
无法在不 fork 源码的前提下完全换皮。

## 真实场景（抽象）

> "我们的设计系统需要一套可访问的 Toggle / Tabs / Dialog，但要全套自定义视觉。
> 不想 fork Element Plus。"

答：用 Headless 库（Headless UI for Vue / Reka UI），或自己写 composable 抽逻辑。
视觉完全由你决定，a11y 与键盘交互已为你处理好。

## 动手试

1. 切到「① headless 消费」 —— 看 DOM 是裸 `<button>`，无 class，样式来自 CSS 块
2. 切到「② 二次封装」 —— `<StyledToggle>` 在 `<ToggleHeadless>` 上包了一层 div + class
3. 点 toggle、看 `aria-pressed` / `data-state` 属性如何自动更新

## 关键模式

### composable 抽离状态机

```ts
export function useToggle(props, emit) {
  const pressed = computed({
    get: () => props.pressed ?? props.defaultPressed ?? false,
    set: (v) => {
      if (props.disabled) return
      if (props.pressed === undefined) internal.value = v
      emit?.('update:pressed', v)
    },
  })
  // 受控/非受控统一：v-model 可用，default 可用，disabled 全局生效
  return { pressed, toggle: () => (pressed.value = !pressed.value) }
}
```

### headless 组件只负责 a11y + 行为

```vue
<template>
  <component
    :is="tag"
    :aria-pressed="pressed"
    :data-state="pressed ? 'on' : 'off'"
    :data-disabled="disabled || undefined"
    @click="toggle"
  >
    <slot :pressed="pressed" />
  </component>
</template>
```

### 用户全权拥有样式

```vue
<style>
[data-state="on"]  { background: #42b883; color: white; }
[aria-disabled]    { opacity: 0.5; cursor: not-allowed; }
</style>
```

## 对比

| 维度 | Element Plus `<el-button>` | Reka UI `<Toggle>` | 本 demo `<ToggleHeadless>` |
|------|---------------------------|-------------------|----------------------------|
| 自带 class | 是（el-button, is-loading, is-disabled） | 否 | 否 |
| a11y 处理 | 部分 | 完整（aria-pressed/data-state/键盘） | 完整 |
| 主题覆盖 | 通过 CSS 变量 + 覆盖类 | 通过你自己的 CSS | 通过你自己的 CSS |
| fork 必要性 | 大改需要 | 几乎不需要 | 0 |
| 包体积影响 | 全套样式 ~30KB+ | 仅逻辑 ~1KB | 仅逻辑 ~1KB |

## 适用场景

- 你有自己的设计系统，要全控视觉 → Headless
- 你想快速搭中后台 → Element Plus / Naive UI
- 你想 a11y 做到位但不写 200 行 ARIA → Headless UI / Reka UI

## 常见陷阱

1. **受控 vs 非受控冲突** —— `props.pressed` 与 `defaultPressed` 不要同时给。
2. **`disabled` 与 a11y** —— 必须把 `data-disabled` / `aria-disabled` 同时给上，CSS 与屏幕阅读器各自依赖不同属性。
3. **`as` 多态组件的 TS 推断** —— 见 demo 05。

## 延伸阅读

- [Headless UI for Vue](https://headlessui.com/vue/menu)
- [Reka UI (Radix Vue 重命名)](https://reka-ui.com/)
- [Vue A11y 指南](https://cn.vuejs.org/guide/best-practices/accessibility.html)

## 下一步

03 · Naive UI 的 CSS 变量主题系统 —— Headless 解决了样式解耦，
03 教你「运行时主题切换」的工程实现。
