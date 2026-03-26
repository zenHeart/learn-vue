# v-active-style

> 🔴 hard | #Directives | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要实现一个 `v-active-style` 指令，当列表项被激活时应用样式。

## 挑战代码

```vue
<script setup lang='ts'>

import { ref } from "vue"

/**
 * Implement the custom directive
 * Make sure the list item text color changes to red when the `toggleTab` is toggled
 *
*/
const VActiveStyle = {

}

const list = [1, 2, 3, 4, 5, 6, 7, 8]
const activeTab = ref(0)
function toggleTab(index: number) {
  activeTab.value = index
}

</script>

<template>
  <ul>
    <li
      v-for="(item,index) in list"
      :key="index"
      v-active-style="[{'color':'red'},() => activeTab === index]"
      @click="toggleTab(index)"
    >
      {{ item }}
    </li>
  </ul>
</template>
```

## 答案

```vue
<script setup lang='ts'>
import { ref, Directive } from "vue"

const VActiveStyle: Directive = {
  mounted(el, binding) {
    const [style, condition] = binding.value
    if (condition()) {
      Object.assign(el.style, style)
    }
  },
  updated(el, binding) {
    const [style, condition] = binding.value
    if (condition()) {
      Object.assign(el.style, style)
    } else {
      el.style.color = ''
    }
  }
}

const list = [1, 2, 3, 4, 5, 6, 7, 8]
const activeTab = ref(0)
function toggleTab(index: number) {
  activeTab.value = index
}
</script>
```

## 解释

`v-active-style` 指令接收一个数组 `[styleObject, conditionFn]`：
- `styleObject` — 要应用的样式对象
- `conditionFn` — 返回布尔值的函数，决定是否应用样式

指令在 `mounted` 和 `updated` 钩子中检查条件函数，当条件满足时应用样式，否则清除内联样式。这种设计使样式应用完全由外部逻辑控制。
