# Vue 的 WatchEffect API {#vue-watcheffect-api}

欢迎来到 Vue 响应式系统学习路径的第二步！

本节我们将学习 Vue 的 `watchEffect` API，它是 Vue 3 中引入的一个更简洁的侦听器。

## WatchEffect API 概述 {#watcheffect-api-overview}

`watchEffect` 立即运行一个函数，同时响应式地追踪其依赖，并在依赖变更时重新执行。它与 `watch` 的主要区别在于：

1. 不需要明确指定要监听的数据源
2. 回调会立即执行
3. 不会获得旧值

## 基本用法 {#basic-usage}

```js
watchEffect(() => {
  // 这个函数会立即执行，并且在其依赖变化时重新执行
  console.log(count.value)
})
```

## 动手尝试 {#try-it-yourself}

右侧的示例包含了两个响应式变量：`count` 和 `message`。尝试使用 `watchEffect` 来自动记录它们的变化。

修改代码，然后点击按钮观察效果。
