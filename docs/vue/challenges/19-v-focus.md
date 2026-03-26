# v-focus

> 🟡 medium | #Directives | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要创建一个自定义指令 `v-focus`，当 `state` 切换时使 input 元素获得/失去焦点。

## 挑战代码

```vue
<script setup lang='ts'>
import { ref } from "vue"

const state = ref(false)

/**
 * Implement the custom directive
 * Make sure the input element focuses/blurs when the 'state' is toggled
 *
*/

const VFocus = {

}

setInterval(() => {
  state.value = !state.value
}, 2000)

</script>

<template>
  <input v-focus="state" type="text">
</template>
```

## 答案

```vue
<script setup lang='ts'>
import { ref, Directive } from "vue"

const state = ref(false)

const VFocus: Directive = {
  mounted(el, binding) {
    if (binding.value) {
      el.focus()
    }
  },
  updated(el, binding) {
    if (binding.value) {
      el.focus()
    } else {
      el.blur()
    }
  }
}

setInterval(() => {
  state.value = !state.value
}, 2000)
</script>

<template>
  <input v-focus="state" type="text">
</template>
```

## 解释

自定义指令通过 `app.directive()` 注册或在 `<script setup>` 中定义。Vue 3 自定义指令有以下生命周期钩子：
- `created` — 绑定属性初始化后
- `beforeMount` — 元素挂载前
- `mounted` — 元素挂载后
- `beforeUpdate` — 组件更新前
- `updated` — 组件更新后
- `beforeUnmount` — 卸载前
- `unmounted` — 卸载后

`binding.value` 是传递给指令的绑定值。
