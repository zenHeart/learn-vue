# Functional Component

> 🟡 medium | #Components | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要实现一个函数式组件：渲染列表元素（ul/li），点击列表项时将其文字颜色变为红色。

## 挑战代码

```vue
<script setup lang='ts'>

import { ref } from "vue"

/**
 * Implement a functional component :
 * 1. Render the list elements (ul/li) with the list data
 * 2. Change the list item text color to red when clicked.
*/
const ListComponent = () => {
}

const list = [{
  name: "John",
}, {
  name: "Doe",
}, {
  name: "Smith",
}]

const activeIndex = ref(0)

function toggle(index: number) {
  activeIndex.value = index
}

</script>

<template>
  <list-component
    :list="list"
    :active-index="activeIndex"
    @toggle="toggle"
  />
</template>
```

## 答案

```vue
<script setup lang='ts'>
import { ref, h } from "vue"

const list = [{
  name: "John",
}, {
  name: "Doe",
}, {
  name: "Smith",
}]

const activeIndex = ref(0)

function toggle(index: number) {
  activeIndex.value = index
}

const ListComponent = (props: { list: typeof list, activeIndex: typeof activeIndex }, { emit }) => {
  return () => h('ul', {},
    props.list.map((item, index) =>
      h('li', {
        style: { color: props.activeIndex.value === index ? 'red' : 'black' },
        onClick: () => emit('toggle', index)
      }, item.name)
    )
  )
}
</script>

<template>
  <list-component
    :list="list"
    :active-index="activeIndex"
    @toggle="toggle"
  />
</template>
```

## 解释

Vue 3 的函数式组件是一个接收 `props` 和 `context`（含 emit、slots、attrs）并返回渲染结果的函数。使用 `h()` 函数创建虚拟 DOM 节点。相比普通组件，函数式组件更轻量，无状态（没有 `this`）。
