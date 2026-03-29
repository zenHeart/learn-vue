# Vue Composition 内部状态暴露机制

## 问题描述

Vue 3 Composition API 中，使用 `<script setup>` 时，组件内部定义的响应式状态（ref/reactive）默认是**私有的**，外部组件无法直接访问或修改。这与 Vue 2 选项式 API 中可以直接通过 `this` 访问组件内部状态不同。

```vue
<!-- 子组件 Child.vue -->
<script setup>
import { ref } from 'vue'
const count = ref(0)  // 私有状态，外部无法直接访问
const increment = () => count.value++
</script>

<!-- 父组件 Parent.vue -->
<script setup>
import Child from './Child.vue'
import { ref } from 'vue'
const childRef = ref(null)
</script>

<!-- 尝试访问会失败 -->
<Child ref="childRef" />
{{ childRef.count }}  <!-- undefined! -->
```

## 根因分析

Vue 3 的 `<script setup>` 编译器会将组件内容包装在 `setup()` 函数中，组件实例是**私有的**，外部无法直接访问内部状态。这是 Vue 3 有意设计的「最小暴露」原则。

### Vue 2 vs Vue 3 对比

| 特性 | Vue 2 | Vue 3 `<script setup>` |
|------|-------|------------------------|
| 状态访问 | 通过 `this` 直接访问 | 需通过 `defineExpose()` 暴露 |
| 暴露方式 | 所有 data/props/methods 默认公开 | 显式暴露所需内容 |
| 安全性 | 较低（可能意外暴露） | 更高（默认私有） |

## 解决方案：defineExpose()

Vue 3.2+ 提供了 `defineExpose()` 编译器宏，用于显式暴露组件内部的属性和方法。

### 基本用法

```vue
<!-- 子组件 Child.vue -->
<script setup>
import { ref, defineExpose } from 'vue'

const count = ref(0)
const name = ref('Child')

const increment = () => count.value++
const setName = (newName) => { name.value = newName }

// 暴露给父组件
defineExpose({
  count,      // 暴露响应式 ref
  name,       // 暴露普通值
  increment,  // 暴露方法
  setName     // 暴露方法
})
</script>
```

```vue
<!-- 父组件 Parent.vue -->
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const childRef = ref(null)

const handleClick = () => {
  // 通过 ref 访问子组件暴露的属性和方法
  console.log(childRef.value.count)  // 0
  childRef.value.increment()          // count = 1
  childRef.value.setName('New Name') // name = 'New Name'
}
</script>

<template>
  <Child ref="childRef" />
  <button @click="handleClick">操作子组件</button>
</template>
```

### defineExpose vs expose()

`defineExpose()` 是 `<script setup>` 的编译器宏，只能在 `<script setup>` 中使用。

```javascript
// expose() - 用于 Options API 或 非 setup 组件
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() { this.count++ }
  },
  expose: ['count', 'increment']  // 暴露特定属性
}
```

## 常见使用场景

### 1. 模板 ref 获取子组件方法

```vue
<script setup>
import { ref, defineExpose } from 'vue'

const validate = () => { /* 验证逻辑 */ }
const reset = () => { /* 重置逻辑 */ }
const getData = () => ({ /* 返回数据 */ })

defineExpose({ validate, reset, getData })
</script>

<!-- 父组件 -->
<script setup>
import Form from './Form.vue'
const formRef = ref(null)

const handleSubmit = async () => {
  if (await formRef.value.validate()) {
    const data = formRef.value.getData()
    // 提交数据
  }
}
</script>
```

### 2. 暴露响应式状态

```vue
<script setup>
import { ref, reactive, toRefs, defineExpose } from 'vue'

const state = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 使用 toRefs 保持响应性
defineExpose(toRefs(state))
</script>
```

### 3. 条件暴露

```vue
<script setup>
import { ref, defineExpose } from 'vue'

const isAdmin = ref(false)
const secretData = ref('仅管理员可见')

// 根据条件暴露不同内容
defineExpose({
  // 所有人都能看到
  username: 'User',
  // 仅管理员可见
  ...(isAdmin.value && { secretData })
})
</script>
```

## 最佳实践

### 1. 最小暴露原则

只暴露必要的属性和方法，避免暴露内部实现细节：

```vue
<!-- ✅ 推荐：暴露业务接口 -->
defineExpose({
  getData,      // 获取数据
  setData,      // 设置数据
  validate,     // 验证
  reset         // 重置
})

<!-- ❌ 避免：暴露内部状态 -->
defineExpose({
  internalState,    // 不要暴露内部状态
  rawData,          // 不要暴露原始数据
  helperFunction    // 不要暴露内部工具函数
})
```

### 2. 使用 TypeScript 定义接口

```typescript
// types/form.ts
import type { Ref } from 'vue'

export interface FormExpose {
  count: Readonly<Ref<number>>
  name: string
  increment: () => void
  setName: (name: string) => void
}

// 子组件
<script setup lang="ts">
import { ref, defineExpose } from 'vue'
import type { FormExpose } from '../types/form'

const count = ref(0)
const name = ref('')

const increment = () => count.value++

defineExpose<FormExpose>({
  count,
  name,
  increment,
  setName: (newName: string) => { name.value = newName }
})
</script>
```

### 3. 组合式函数中的暴露

```typescript
// composables/useCounter.ts
import { ref, computed, defineExpose } from 'vue'

export function useCounter(initial = 0) {
  const count = ref(initial)
  const doubled = computed(() => count.value * 2)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  
  return {
    count,
    doubled,
    increment,
    decrement,
    expose: () => defineExpose({ count, doubled, increment, decrement })
  }
}
```

## 常见问题

### Q1: 为什么不直接暴露所有状态？

暴露所有状态会破坏封装性，导致父组件依赖子组件内部实现，增加耦合度。当子组件内部重构时，可能破坏父组件。

### Q2: v-model 和 defineExpose 如何选择？

- `v-model`：用于双向绑定，适合表单输入
- `defineExpose`：用于命令式调用，适合操作方法

```vue
<!-- v-model 双向绑定 -->
<Child v-model="count" />

<!-- defineExpose 命令式调用 -->
<Child ref="childRef" />
childRef.value.increment()
```

### Q3: 孙子组件如何通信？

通过多层 `defineExpose` 或使用 Pinia/Vuex 共享状态：

```vue
<!-- 父组件 -->
<script setup>
import Child from './Child.vue'
import GrandChild from './GrandChild.vue'

const grandChildRef = ref(null)

defineExpose({ grandChild: grandChildRef })
</script>

<template>
  <Child>
    <GrandChild ref="grandChildRef" />
  </Child>
</template>
```

## 总结

| 场景 | 解决方案 |
|------|----------|
| 暴露响应式数据 | `defineExpose({ count })` |
| 暴露方法 | `defineExpose({ increment })` |
| 保持 reactive 解构响应性 | `defineExpose(toRefs(state))` |
| TypeScript 类型安全 | `defineExpose<Interface>({ ... })` |
| 条件暴露 | `...(condition && { data })` |

**核心原则**：Vue 3 Composition API 的「默认私有」设计是有意的，通过 `defineExpose()` 实现显式的、可控的 API 暴露，符合最小暴露原则，降低组件间耦合度。
