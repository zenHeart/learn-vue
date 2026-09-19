> 版本: Vue 3.0+ | RFC: — | 状态: stable | 概念: emits 多事件命名

# 多个事件的命名与监听

子组件可以在 `emits` 数组中声明多个事件；父组件用 `@event` 或 `@update:propName` 监听。事件名推荐使用 kebab-case。

## 你会学到什么

- 子组件通过 `defineEmits(['save', 'update:value'])` 声明事件。
- 父组件用 `@save` 与 `@update:value` 监听，可写任意命名规范。
- v-model 本质上是 `:modelValue` + `@update:modelValue` 的语法糖。

## 动手试

1. 点击两个按钮，观察父组件日志。
2. 改 `update:value` 为 `update:count`，相应调整父组件监听名。

## 关键陷阱

- 没在 emits 中声明的事件，监听器会落到 attrs（控制台会报警）。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 - 事件](https://vuejs.org/guide/components/events.html) | 事件机制 |
| [Vue 官方 - v-model 参数](https://vuejs.org/guide/components/v-model.html) | 命名 v-model |