# Tree Component

> 🔴 hard | #Components | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要实现一个树形组件。

## 挑战代码

```vue
<script setup lang="ts">
interface TreeData {
  key: string
  title: string
  children: TreeData[]
}
defineProps<{data: TreeData[]}>()
</script>

<template>
  <!-- do something.... -->
</template>
```

## 答案

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface TreeData {
  key: string
  title: string
  children?: TreeData[]
}

const props = defineProps<{ data: TreeData[] }>()

const expandedKeys = ref<string[]>([])

function toggle(key: string) {
  const index = expandedKeys.value.indexOf(key)
  if (index >= 0) {
    expandedKeys.value.splice(index, 1)
  } else {
    expandedKeys.value.push(key)
  }
}
</script>

<template>
  <div v-for="item in data" :key="item.key">
    <div @click="toggle(item.key)">
      {{ item.title }}
      <span v-if="item.children?.length">
        {{ expandedKeys.includes(item.key) ? '-' : '+' }}
      </span>
    </div>
    <div v-if="item.children?.length && expandedKeys.includes(item.key)" style="padding-left: 20px;">
      <Tree :data="item.children" />
    </div>
  </div>
</template>
```

## 解释

树形组件的核心逻辑：
1. **递归渲染**：`Tree` 组件在其模板中调用自身来处理子节点
2. **展开/折叠状态**：使用 `expandedKeys` 数组存储当前展开的节点 key
3. **递归组件**：Vue 中组件可以在自己的模板中调用自身（需要给组件设置 name）

这是一个典型的递归组件应用场景，适用于文件树、组织架构等层级数据。
