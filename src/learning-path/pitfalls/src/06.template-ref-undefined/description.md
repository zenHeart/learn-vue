> 版本: Vue 3.5+ | RFC: — | 状态: stable (3.5+) | 概念: 模板 ref

# 模板 ref undefined

## 你会学到什么

- `<script setup>` 中 `const el = ref()` 但 `ref="el"` 在 template 引用名必须一致
- 拼写不一致 / 多余空格 / ref 写在条件分支都会拿到 `null`
- `useTemplateRef('my-name')`（3.5+）用字符串名绑定，类型安全

## 错误示例

```vue
<script setup>
const boxRef = ref()  // ← 与模板里 ref="box" 不一致
</script>
<template>
  <div ref="box">...</div>  // 拿不到，boxRef.value === null
</template>
```

## 修复版本

```vue
<script setup>
import { useTemplateRef } from 'vue'
const boxRef = useTemplateRef('box')  // ← 名字与模板一致
</script>
<template>
  <div ref="box">...</div>
</template>
```

## 动手试

1. 点击「读错误 ref」 — 看到 null
2. 切换「正确 ref 名 / useTemplateRef」 — 拿到元素

## 根因

模板 `ref="x"` 编译时收集字符串 `x`，setup 中的 `ref()` 变量名是另一个标识符，Vue 没法匹配。`useTemplateRef` 用同一字符串明确声明。

## 修复 / 选型

- 一致命名：template 中 `ref="myEl"`，setup 中 `const myEl = ref()` 或 `useTemplateRef('myEl')`
- 类型友好：`useTemplateRef<HTMLDivElement>('myEl')`
- v-for 元素：拿到的是元素数组

## 延伸阅读

- [Template Refs](https://vuejs.org/guide/essentials/template-refs.html)
- [Vue 源码洞察：模板 ref 在 v-for 中的收集顺序与异步包装](_analysis/vue-source-insights.md#模板-ref-在-v-for-中的收集顺序与异步包装) | `packages/runtime-core/src/rendererTemplateRef.ts:24-58` 引用

## 小结

1. **现象**：ref.value 是 null。
2. **复现**：错误版本打印 null。
3. **修复**：`useTemplateRef` 显式声明。
