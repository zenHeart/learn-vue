# Vue 的 Watch API {#vue-watch-api}

欢迎来到 Vue 响应式系统学习路径的第一步！

本节我们将学习 Vue 中的 `watch` API，这是 Vue 响应式系统的核心部分之一。

## Watch API 概述 {#watch-api-overview}

`watch` API 允许我们监听一个响应式数据源的变化，并在数据变化时执行回调函数。这对于执行副作用操作（如异步请求、DOM 操作等）非常有用。

## 基本用法 {#basic-usage}

下面是一个基本示例，尝试编辑右侧代码，增加计数器的值，观察 `watch` 的回调函数如何执行：

```js
// 在 Vue 3 中，我们可以使用 watch 函数来监听响应式数据的变化
watch(source, (newValue, oldValue) => {
  // 当 source 变化时，这个回调会执行
})
```

## 动手尝试 {#try-it-yourself}

右侧的示例中有一个计数器，尝试实现一个 `watch` 函数来监听计数器的变化，并在控制台中打印出新值和旧值。

点击按钮增加计数，然后观察控制台输出。
