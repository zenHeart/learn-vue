# Prevent Event Propagation

> 🟢 easy | #Event Handling | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要阻止点击事件冒泡传播。

## 挑战代码

```vue
<script setup lang="ts">

const click1 = () => {
  console.log('click1')
}

const click2 = () => {
  console.log('click2')
}

</script>

<template>
  <div @click="click1()">
   <div @click="click2()">
     click me
   </div>
  </div>
</template>
```

## 答案

```vue
<script setup lang="ts">

const click1 = () => {
  console.log('click1')
}

const click2 = (e: Event) => {
  e.stopPropagation()
  console.log('click2')
}

</script>

<template>
  <div @click="click1()">
   <div @click="click2()">
     click me
   </div>
  </div>
</template>
```

或者使用 Vue 的事件修饰符：

```vue
<template>
  <div @click="click1()">
   <div @click.stop="click2()">
     click me
   </div>
  </div>
</template>
```

## 解释

Vue 提供了 `.stop` 事件修饰符来阻止事件冒泡，与原生 `event.stopPropagation()` 效果相同。Vue 的事件修饰符包括：
- `.stop` — 阻止冒泡
- `.prevent` — 阻止默认行为
- `.capture` — 使用捕获模式
- `.self` — 只当事件从自身触发时才处理
- `.once` — 只触发一次
