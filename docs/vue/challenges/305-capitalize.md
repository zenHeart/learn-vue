# Capitalize

> 🟢 easy | #Directives | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

为 `v-model` 指令创建一个自定义修饰符，将绑定值的首字母改为大写。

## 挑战代码

```vue
<script setup>
</script>

<template>
  <input type="text" v-model.capitalize="" />
</template>
```

## 答案

```vue
<script setup>
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()

// 通过 instance 获取全局 app
// 注册 v-model 修饰符需要在 app.config.globalProperties 或 app.directive 中处理
</script>
```

更实际的答案是创建一个自定义指令：

```vue
<script setup>
import { Directive } from 'vue'

const capitalize: Directive = {
  mounted(el, binding) {
    el.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement
      const value = target.value
      if (value.length > 0) {
        target.value = value[0].toUpperCase() + value.slice(1)
      }
      // 触发 v-model 更新
      target.dispatchEvent(new Event('input'))
    })
  }
}
</script>

<template>
  <input type="text" v-capitalize v-model="text" />
</template>
```

## 解释

Vue 3 的自定义指令不支持直接在 `v-model` 上添加修饰符（如 `v-model.capitalize`）。需要通过其他方式实现：
1. 创建一个独立的指令（如 `v-capitalize`）配合 `v-model` 使用
2. 封装一个带有 `capitalize` 功能的自定义组件

Vue 3.4+ 支持通过 `app.config.globalProperties` 或自定义 `v-model` 修饰符来实现类似功能。
