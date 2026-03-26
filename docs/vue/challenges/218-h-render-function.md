# render function h()

> 🟡 medium | #Components | 来源：[vuejs-challenges](https://github.com/webfansplz/vuejs-challenges)

## 题目描述

本挑战需要使用 `h` 渲染函数实现一个组件，确保 props 正确传递、事件正确触发、插槽内容正确渲染。

## 挑战代码

```vue
<script setup lang="ts">
import MyButton from "./MyButton.ts"
const onClick = () => {
  console.log('onClick')
}
</script>

<template>
  <MyButton :disabled="false" @custom-click="onClick">
    my button
  </MyButton>
</template>
```

## 答案

```typescript
// MyButton.ts
import { h } from 'vue'

const MyButton = (props: { disabled?: boolean }, { emit, $attrs }) => {
  return () => h('button', {
    disabled: props.disabled,
    onClick: () => emit('custom-click')
  }, 'my button')
}

export default MyButton
```

或使用 SFC：

```vue
<!-- MyButton.vue -->
<script setup lang="ts">
defineProps<{ disabled?: boolean }>()
</script>

<template>
  <button :disabled="disabled" @click="$emit('custom-click')">
    <slot />
  </button>
</template>
```

## 解释

使用 `h()` 渲染函数时：
- 第一个参数是标签名或组件
- 第二个参数是 attributes（props、事件监听器等）
- 第三个参数是子节点（slot 内容）

`$attrs` 包含所有非 prop 的 attribute 和事件监听器。使用 `defineProps` 和 `defineEmits` 宏可以声明 props 和 emits。
