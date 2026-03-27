# 自定义表单组件 v-model 与 change 事件冲突

## 问题描述

在使用自定义表单组件时，如果组件内部触发了 `change` 事件，而外部通过 `v-model` 绑定，可能会出现事件被覆盖的问题，导致组件抛出事件失效。

## 核心原理

### Vue 3 v-model 本质

```vue
<!-- 这两者等价 -->
<ChildComponent v-model="value" />
<ChildComponent :model-value="value" @update:model-value="value = $event" />
```

- `v-model` 默认绑定 `modelValue` prop
- 监听 `update:modelValue` 事件来同步值

### Vue 2 v-model 本质

```vue
<!-- 这两者等价 -->
<ChildComponent v-model="value" />
<ChildComponent :value="value" @input="value = $event" />
```

- `v-model` 默认绑定 `value` prop
- 监听 `input` 事件来同步值

## 冲突场景

### 错误示例：组件内部直接触发 change

```vue
<!-- BadChild.vue -->
<template>
  <select @change="handleChange">
    <option value="a">A</option>
    <option value="b">B</option>
  </select>
</template>

<script>
export default {
  methods: {
    handleChange(e) {
      // 错误：直接触发 change 事件
      this.$emit('change', e.target.value);
    }
  }
}
</script>
```

使用时：

```vue
<!-- Parent.vue -->
<BadChild v-model="selected" @change="onChange" />
```

**问题**：`@change` 和 `v-model` 同时存在时，事件处理可能冲突。

### 正确示例：使用 v-model 方式

```vue
<!-- GoodChild.vue -->
<template>
  <select @change="handleChange">
    <option value="a">A</option>
    <option value="b">B</option>
  </select>
</template>

<script>
export default {
  // Vue 3
  emits: ['update:modelValue', 'change'],
  methods: {
    handleChange(e) {
      // 正确：同时触发两个事件
      this.$emit('update:modelValue', e.target.value);
      this.$emit('change', e.target.value);
    }
  }
}
</script>
```

### Vue 3 Composition API 版本

```vue
<!-- GoodChild.vue -->
<template>
  <select @change="handleChange">
    <option value="a">A</option>
    <option value="b">B</option>
  </select>
</template>

<script setup>
const emit = defineEmits(['update:modelValue', 'change']);

const handleChange = (e) => {
  const value = e.target.value;
  emit('update:modelValue', value);
  emit('change', value);
};
</script>
```

## 冲突原因分析

| 场景 | Vue 2 | Vue 3 |
|------|-------|-------|
| v-model 默认事件 | `input` | `update:modelValue` |
| change 事件 | `change` | `change` |
| 同时绑定 | `@input` + `@change` | `@update:modelValue` + `@change` |
| 冲突可能性 | 高 | 中 |

### 常见错误

1. **事件名称不匹配**：组件触发 `change`，但 v-model 期望 `input` 或 `update:modelValue`
2. **双向绑定覆盖**：外部 v-model 修改了内部状态，导致内部事件失效
3. **异步更新问题**：在 `change` 事件中直接修改 `modelValue`，可能触发二次更新

## 解决方案

### 方案一：统一使用 v-model 语义

```vue
<!-- 子组件始终触发 update:modelValue -->
this.$emit('update:modelValue', newValue);
```

### 方案二：使用 .sync 修饰符（Vue 2）

```vue
<!-- Parent.vue -->
<ChildComponent :value.sync="value" />

<!-- Child.vue -->
this.$emit('update:value', newValue);
```

### 方案三：完全解耦

```vue
<!-- 不使用 v-model，而是手动绑定 -->
<ChildComponent 
  :model-value="value" 
  @update:model-value="value = $event"
  @change="onChange"
/>
```

## 最佳实践

1. **明确声明 emits**：使用 `emits` 选项声明所有可能的事件
2. **统一事件语义**：遵循 v-model 的 `update:modelValue` 约定
3. **避免重复触发**：不要在 `update:modelValue` 回调中重复触发 `change`
4. **使用 Composition API**：在 Vue 3 中使用 `defineEmits` 获得更好的类型支持

## 参考资料

- [Vue 3 v-model 文档](https://vuejs.org/guide/components/v-model.html)
- [Vue 2 v-model 文档](https://v2.vuejs.org/v2/guide/components.html#Using-v-model-on-Components)
