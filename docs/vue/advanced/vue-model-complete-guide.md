# Vue v-model 完整指南

> 本文档对比 Vue 2 和 Vue 3 中 v-model 的用法，包含核心区别、常见场景和最佳实践

## 目录

1. [v-model 基础概念](#1-v-model-基础概念)
2. [Vue 2 v-model](#2-vue-2-v-model)
3. [Vue 3 v-model](#3-vue-3-v-model)
4. [核心区别对比](#4-核心区别对比)
5. [常见使用场景](#5-常见使用场景)
6. [迁移指南](#6-迁移指南)

---

## 1. v-model 基础概念

v-model 是 Vue 提供的语法糖，用于实现双向绑定。它本质上绑定了：
- **表单元素**：value 属性 + input 事件
- **自定义组件**：props + 事件

---

## 2. Vue 2 v-model

### 2.1 原理：value + input 事件的语法糖

```html
<!-- 这两种写法等价 -->
<input v-model="message">
<input :value="message" @input="message = $event.target.value">
```

### 2.2 内置修饰符

| 修饰符 | 作用 | 示例 |
|--------|------|------|
| `.lazy` | 替代 input 为 change 事件 | `<input v-model.lazy="message">` |
| `.number` | 自动转换为数字 | `<input v-model.number="age">` |
| `.trim` | 自动去除首尾空白 | `<input v-model.trim="username">` |

### 2.3 自定义组件使用 v-model

子组件需要：

```vue
<!-- 子组件：MyInput.vue -->
<template>
  <input :value="value" @input="$emit('input', $event.target.value)">
</template>

<script>
export default {
  props: ['value'],
  model: {
    prop: 'value',
    event: 'input'
  }
}
</script>
```

父组件使用：

```vue
<template>
  <my-input v-model="message"></my-input>
</template>
```

### 2.4 子组件默认行为

Vue 2 中，组件上的 v-model 默认绑定 `value` prop，监听 `input` 事件。

---

## 3. Vue 3 v-model

### 3.1 核心改变

| Vue 2 | Vue 3 |
|-------|-------|
| prop: `value` | prop: `modelValue` |
| 事件: `input` | 事件: `update:modelValue` |

```html
<!-- Vue 3 中 -->
<MyComponent v-model="message">

<!-- 等价于 -->
<MyComponent :model-value="message" @update:model-value="message = $event">
```

### 3.2 支持多个 v-model

Vue 3 允许在一个组件上使用多个 v-model：

```vue
<!-- 父组件 -->
<template>
  <UserCard
    v-model:name="userName"
    v-model:age="userAge"
    v-model:email="userEmail"
  >
  </UserCard>
</template>
```

子组件：

```vue
<!-- UserCard.vue -->
<template>
  <div>
    <input :value="name" @input="$emit('update:name', $event.target.value)">
    <input :value="age" @input="$emit('update:age', $event.target.value)">
    <input :value="email" @input="$emit('update:email', $event.target.value)">
  </div>
</template>

<script setup>
defineProps({
  name: String,
  age: Number,
  email: String
})
defineEmits(['update:name', 'update:age', 'update:email'])
</script>
```

### 3.3 内置修饰符

Vue 3 修饰符包括 `.trim`、`.number`、`.lazy`，使用方式不变：

```html
<input v-model.trim="message">
<input v-model.number="age">
<input v-model.lazy="message">
```

### 3.4 自定义修饰符（modelModifiers）

Vue 3 支持自定义 v-model 修饰符：

```vue
<!-- 父组件：传递 capitalized 修饰符 -->
<template>
  <MyInput v-model.capitalized="text"></MyInput>
</template>
```

子组件接收：

```vue
<!-- MyInput.vue -->
<template>
  <input :value="modelValue" @input="onInput">
</template>

<script setup>
const props = defineProps({
  modelValue: String,
  // 接收修饰符
  modelModifiers: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

function onInput(e) {
  let value = e.target.value
  // 应用自定义修饰符
  if (props.modelModifiers.capitalized) {
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }
  emit('update:modelValue', value)
}
</script>
```

对于带参数的 v-model：

```vue
<!-- 父组件 -->
<template>
  <MyInput v-model:name.capitalized="name"></MyInput>
</template>
```

子组件接收：

```vue
<script setup>
const props = defineProps({
  name: String,
  nameModifiers: {
    type: Object,
    default: () => ({})
  }
})
</script>
```

---

## 4. 核心区别对比

### 4.1 语法对比表

| 特性 | Vue 2 | Vue 3 |
|------|--------|-------|
| 默认 prop 名 | `value` | `modelValue` |
| 默认事件名 | `input` | `update:modelValue` |
| 多 v-model | 不支持 | 支持（v-model:propName） |
| 自定义修饰符 | 不支持 | 支持（modelModifiers） |
| 修饰符位置 | v-model.modifier | v-model.modifier 或 v-model:prop.modifier |

### 4.2 代码对比

#### 基本用法

```vue
<!-- Vue 2 -->
<template>
  <my-input v-model="message"></my-input>
</template>

<!-- Vue 3 -->
<template>
  <MyInput v-model="message"></MyInput>
</template>
```

#### 子组件定义

```vue
<!-- Vue 2 子组件 -->
<script>
export default {
  props: ['value'],
  methods: {
    update(e) {
      this.$emit('input', e.target.value)
    }
  }
}
</script>

<!-- Vue 3 子组件 -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function update(e) {
  emit('update:modelValue', e.target.value)
}
</script>
```

### 4.3 迁移对照表

| Vue 2 | Vue 3 |
|--------|-------|
| `value` prop | `modelValue` prop |
| `input` 事件 | `update:modelValue` 事件 |
| `v-model="x"` | `v-model="x"` |
| `v-model.lazy="x"` | `v-model.lazy="x"` |
| 不支持 | `v-model:prop="x"` |
| 不支持 | `modelModifiers` |

---

## 5. 常见使用场景

### 5.1 表单输入

```vue
<script setup>
import { ref } from 'vue'

const username = ref('')
const email = ref('')
const age = ref(0)
const newsletter = ref(false)
</script>

<template>
  <form>
    <input v-model="username" placeholder="用户名">
    <input v-model.trim="email" placeholder="邮箱">
    <input v-model.number="age" type="number" placeholder="年龄">
    <input v-model="newsletter" type="checkbox">
    <textarea v-model="message"></textarea>
    <select v-model="selected">
      <option value="">请选择</option>
      <option value="a">A</option>
      <option value="b">B</option>
    </select>
  </form>
</template>
```

### 5.2 自定义组件双向绑定

#### Vue 3 方式

```vue
<!-- Toggle.vue - 开关组件 -->
<template>
  <button @click="toggle" :class="{ active: modelValue }">
    {{ modelValue ? 'ON' : 'OFF' }}
  </button>
</template>

<script setup>
defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>
```

使用：

```vue
<template>
  <Toggle v-model="isEnabled"></Toggle>
</template>
```

#### 带参数的多 v-model

```vue
<!-- FormInput.vue -->
<template>
  <div>
    <label>{{ label }}</label>
    <input
      :value="value"
      @input="$emit('update:value', $event.target.value)"
    >
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: String
})
defineEmits(['update:value'])
</script>
```

使用：

```vue
<template>
  <FormInput v-model:value="name" label="姓名"></FormInput>
  <FormInput v-model:value="address" label="地址"></FormInput>
</template>
```

### 5.3 修饰符使用

#### trim 修饰符

```vue
<script setup>
const username = ref('')
</script>

<template>
  <!-- 自动去除首尾空白 -->
  <input v-model.trim="username">
  <p>输入: "{{ username }}"</p>
</template>
```

#### number 修饰符

```vue
<script setup>
const count = ref(0)
</script>

<template>
  <!-- 自动转换为数字 -->
  <input v-model.number="count" type="text">
  <p>类型: {{ typeof count }}</p>
</template>
```

#### lazy 修饰符

```vue
<script setup>
const query = ref('')
</script>

<template>
  <!-- change 事件触发，而非 input -->
  <input v-model.lazy="query" placeholder="搜索...">
  <p>查询: {{ query }}</p>
</template>
```

---

## 6. 迁移指南

### 6.1 从 Vue 2 迁移到 Vue 3

1. **重命名 props 和事件**
   - `value` → `modelValue`
   - `input` → `update:modelValue`

2. **更新子组件**

```vue
<!-- Vue 2 -->
<script>
export default {
  props: ['value'],
  methods: {
    update(e) {
      this.$emit('input', e.target.value)
    }
  }
}
</script>

<!-- Vue 3 -->
<script setup>
import { computed } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function update(e) {
  emit('update:modelValue', e.target.value)
}
</script>
```

### 6.2 使用迁移工具

Vue 提供 `vue-migration-helper` 工具帮助检测需要迁移的代码：

```bash
npm install -g @vue/migration-helper
vue-migration-helper
```

### 6.3 兼容模式

Vue 3 中可以通过 `model` 选项保持兼容（Options API）：

```vue
<script>
export default {
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: String
  }
}
</script>
```

---

## 总结

| 特性 | Vue 2 | Vue 3 |
|------|--------|-------|
| 默认绑定 | value + input | modelValue + update:modelValue |
| 多 v-model | ❌ | ✅ v-model:propName |
| 自定义修饰符 | ❌ | ✅ modelModifiers |
| 推荐程度 | 旧项目 | 新项目 |

**推荐**：新项目使用 Vue 3 的 v-model 方式，充分利用其灵活性。

---

## 相关资源

- [Vue 3 官方文档 - v-model](https://vuejs.org/guide/components/v-model.html)
- [Vue 2 官方文档 - v-model](https://cn.vuejs.org/v2/api/#v-model)
