# Vue 组件能否只导出方法而不导出样式？

**答案：完全可以。**

## 核心原理

Vue 组件的 `<style>` 部分是独立的，不会随着组件实例暴露给父组件。只有通过 `defineExpose()` 或 `expose()` 导出的内容才对父组件可见。

## 实现方式

### 方式一：`<script setup>` + defineExpose（推荐）

```vue
<!-- MyUtils.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

function getCount() {
  return count.value
}

// ✅ 只暴露方法，不暴露样式（样式自动隔离）
defineExpose({
  increment,
  getCount
})
</script>

<template>
  <!-- 组件内部有样式，但父组件无法访问 -->
  <div class="internal-style">{{ count }}</div>
</template>

<style scoped>
.internal-style {
  color: red; /* 父组件看不到这个样式 */
}
</style>
```

### 方式二：选项式 API + expose

```vue
<script>
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  // 只暴露方法，样式自动隔离
  expose: ['increment']
}
</script>
```

## 父组件使用

```vue
<script setup>
import { ref } from 'vue'
import MyUtils from './MyUtils.vue'

const utilsRef = ref(null)

function handleClick() {
  // ✅ 可以调用
  utilsRef.value.increment()
  
  // ❌ 报错：count 未暴露
  // utilsRef.value.count
}
</script>

<template>
  <MyUtils ref="utilsRef" />
  <button @click="handleClick">调用子组件方法</button>
</template>
```

## 关键结论

| 导出内容 | 能否通过 defineExpose 暴露 | 样式是否暴露 |
|---------|--------------------------|-------------|
| data/props | ✅ 可以 | ❌ 不暴露 |
| methods | ✅ 可以 | ❌ 不暴露 |
| computed | ✅ 可以 | ❌ 不暴露 |
| 内部样式 | ❌ 不可能 | ❌ 不暴露 |

**样式始终是组件私有的**，无法从外部访问或覆盖（除非使用非 scoped 或 CSS 变量）。

## 适用场景

1. **工具类组件**：只提供行为，不关心外观
2. **纯逻辑组件**：如表单验证、数据转换组件
3. **接口封装**：将复杂逻辑封装为简洁 API

## 相关文档

- [Vue 3 模板 ref 与 defineExpose](./vue-model-complete-guide.md)
- [Render 函数中 v-model 的使用](./v-model-render-function.md)
