# Hello World

> 🟢 warm-up | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

在 Vue.js Challenges 中，我们使用基于 [vuejs/repl](https://github.com/vuejs/repl) 的 Vue.js SFC Playground 进行在线编码。

本挑战需要修改以下代码，使页面正确显示 "Hello World"。

## 挑战代码

```vue
<script setup>
import { ref } from "vue"
const msg = ref("Hello World")
</script>

<template>
  <div>
    <!-- The output of the page is expected to be Hello World -->
    <h1>msg</h1>
  </div>
</template>
```

## 答案

将模板中的 `msg` 改为 `{{ msg }}`，使其输出变量的值：

```vue
<script setup>
import { ref } from "vue"
const msg = ref("Hello World")
</script>

<template>
  <div>
    <h1>{{ msg }}</h1>
  </div>
</template>
```

## 解释

在 Vue.js 模板中，直接使用变量名 `msg` 会输出字符串 "msg"。要输出变量的值，需要使用 Mustache 语法 `{{ variable }}` 进行文本插值。这是 Vue 模板中最基础的响应式数据绑定方式。
