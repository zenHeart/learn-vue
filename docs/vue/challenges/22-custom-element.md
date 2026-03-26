# Custom Element

> 🔴 hard | #Web Components | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

你听说过 `Web Components` 吗？Vue 对创建和使用自定义元素都有很好的支持。

## 挑战代码

```vue
<script setup lang='ts'>

import { onMounted } from "vue"

/**
 * Implement the code to create a custom element.
 * Make the output of page show "Hello Vue.js".
*/
const VueJs = "???"

onMounted(() => {
  document.getElementById("app")!.innerHTML = "<vue-js message=\"Hello Vue.js\"></vue-js>"
})

</script>

<template>
  <div id="app"></div>
</template>
```

## 答案

```vue
<script setup lang='ts'>
import { onMounted, defineCustomElement } from "vue"

const VueJs = defineCustomElement({
  props: ['message'],
  template: '<div>{{ message }}</div>'
})

// 注册自定义元素
customElements.define('vue-js', VueJs)

onMounted(() => {
  document.getElementById("app")!.innerHTML = "<vue-js message=\"Hello Vue.js\"></vue-js>"
})
</script>

<template>
  <div id="app"></div>
</template>
```

## 解释

`defineCustomElement()` 是 Vue 3.2+ 提供的方法，用于创建原生 Web Component。Vue 的自定义元素实现基于 Vue 的响应式系统和生命周期。

主要特点：
- 使用 Vue 的模板语法
- 支持 `props`、`emits`、slots 等 Vue 特性
- 可以在任何 HTML 页面中使用，无需构建工具

使用 `customElements.define()` 注册后，即可在页面的任何位置使用该自定义元素标签。
