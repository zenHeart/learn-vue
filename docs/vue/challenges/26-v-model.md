# v-model

> 🔴 hard | #Directives | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要实现一个自定义的 `v-model` 指令，在表单输入元素上创建双向绑定。

## 挑战代码

```vue
<script setup lang='ts'>

import { ref } from "vue"

/**
 * Implement a custom directive
 * Create a two-way binding on a form input element
 *
*/
const VOhModel = {

}

const value = ref("Hello Vue.js")

</script>

<template>
  <input v-oh-model="value" type="text" />
</template>
```

## 答案

```vue
<script setup lang='ts'>
import { ref, Directive } from "vue"

const VOhModel: Directive = {
  created(el, binding, vnode) {
    el.value = binding.value
    el._vOhModel = {
      value: binding.value,
      setValue: (val: any) => {
        if (binding.instance && binding.arg) {
          binding.instance[binding.arg] = val
        }
      }
    }
  },
  mounted(el, binding) {
    el.addEventListener('input', (e) => {
      el._vOhModel.setValue(el.value)
    })
  },
  updated(el, binding) {
    if (el.value !== binding.value) {
      el.value = binding.value
    }
  }
}

const value = ref("Hello Vue.js")
</script>

<template>
  <input v-oh-model="value" type="text" />
</template>
```

## 解释

自定义 v-model 指令需要处理：
- **读取（get）**：将 ref 的值设置到元素的 `value` 属性
- **写入（set）**：监听 input 事件，将元素值更新到 ref

Vue 3 的内置 `v-model` 机制本质上是：`:modelValue` prop + `@update:modelValue` 事件的组合。自定义指令可以绕过这一层，直接操作 DOM 和 ref。
