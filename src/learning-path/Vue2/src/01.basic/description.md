> 版本: Vue 2.7+ | RFC: — | 状态: legacy | 概念: Options API / transition-group

# Vue 2 基础示例：Options API 与 transition-group

Vue 2 默认使用 Options API：`data / methods / computed / watch` 各自独立。本 demo 演示一个简单的列表动画：使用 `<transition-group>` 让元素增删时平滑过渡。

## 你会学到什么

- `data()` 返回初始状态，`methods` 内定义事件处理器。
- `transition-group` 配合 `.list-enter-active / .list-leave-active / .list-move` CSS 类实现过渡动画。
- `:key` 是 transition-group 正确工作的前提。

## 动手试

1. 点击 "Add Item"，观察新元素自上而下淡入。
2. 点击 "Remove Item"，观察随机位置的元素平滑移除。
3. 试着删除 `key` 属性，体验无 key 时 transition-group 的行为差异。

## 关键陷阱

- Vue 2 不支持 `<script setup>`，需要 Options API 或 `setup()`（2.7+）。
- `this.$set` 在 Vue 2 中用于向响应式对象新增属性；Vue 3 Proxy 自动处理。
- transition-group 必须挂在真实 DOM 标签上（如 `<ul>`），不能是组件。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 2 官方文档](https://v2.vuejs.org/v2/guide/) | 完整 API |
| [Vue 2.7 backports](https://blog.vuejs.org/posts/vue-2-7-naruto.html) | 2.7 引入的 Composition API 支持 |