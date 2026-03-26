# Global CSS

> 🟡 medium | #CSS Features | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

有时候我们需要在 scoped 组件中设置全局 CSS，你知道怎么做吗？

## 挑战代码

```vue
<template>
  <p>Hello Vue.js</p>
</template>

<style scoped>

p {
  font-size:20px;
  color:red;
  text-align: center;
  line-height: 50px;
}

/* Make it work */
body {
  width: 100vw;
  height: 100vh;
  background-color: burlywood;
}
</style>
```

## 答案

使用 `:global()` 包装选择器：

```vue
<template>
  <p>Hello Vue.js</p>
</template>

<style scoped>
p {
  font-size: 20px;
  color: red;
  text-align: center;
  line-height: 50px;
}

/* 使用 :global() 使选择器突破 scoped 限制 */
:global(body) {
  width: 100vw;
  height: 100vh;
  background-color: burlywood;
}
</style>
```

## 解释

在 Vue SFC 的 `<style scoped>` 中：
- 默认所有选择器都只作用于当前组件
- 使用 `:global(css selector)` 可以让选择器突破 scoped 限制，影响全局样式

这在需要为特定组件设置全局样式（如 body 背景色、html 滚动条等）时非常有用。
