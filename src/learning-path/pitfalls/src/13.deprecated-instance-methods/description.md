> **版本**：Vue 3.x | **状态**：已废弃 / 不应使用 | **源码**：`packages/runtime-core/src/componentPublicInstance.ts` | **延伸阅读**：[Vue 官方 · 迁移指南](https://vuejs.org/guide/migration/attrs-includes-class.html) | [Vue 3 Migration · 移除 $listeners](https://v3-migration.vuejs.org/breaking-changes/listeners-removed.html)

# 已废弃 / 不应使用的实例属性：`$listeners` / `$children`

## 这是什么

Vue 3 移除 / 弱化了两个 Vue 2 时代常见的实例属性：

| 属性 | 状态 | 替代方案 |
|---|---|---|
| `vm.$listeners` | **已移除**（Vue 3.0） | `useAttrs()` 拿到的 attrs 已包含 `onXxx` 事件监听器 |
| `vm.$children` | **不建议使用**（Vue 3 仍存在但无类型） | `ref()` + `defineExpose()`；或 `$refs` 拿子组件 |

`$listeners` 在 Vue 2 是「父组件传给子组件的事件监听器集合」，Vue 3 把它们合并进 `$attrs`（`attrs` 包含 `class`、`style`、所有非 props 属性，事件即 `onXxx` 也属于非 props 属性）。

`$children` 是 Vue 2 用来直接访问「所有直接子组件实例数组」的属性；Vue 3 出于避免隐式耦合的设计原则，**官方不再推荐使用**。

## 源码走读

```ts
// packages/runtime-core/src/componentPublicInstance.ts
// Vue 3 实例上不再暴露 $listeners / $children 给开发者
// 内部只在 devtools 渲染组件树时通过 instance.subTree.children 访问

// Vue 3.0+ 的 $attrs 同时包含 props 之外的属性，包括 onClick 事件
publicProperties: {
  $attrs: i => (__DEV__ || isInBeforeCreate) ? trackAttrs(i) : i.attrs,
  $emit: i => i.emit,
  // ...
}
```

## 错误的写法（Vue 2 习惯）

```ts
// ❌ 错误：Vue 3 里 $listeners 不存在
export default {
  mounted() {
    console.log(this.$listeners)   // undefined
  },
}

// ❌ 错误：$children 在 Vue 3 不保证顺序与稳定性
export default {
  mounted() {
    console.log(this.$children[0]) // undefined 或行为不稳定
  },
}
```

## 正确的替代写法

```vue
<!-- 父组件 -->
<Child @save="onSave" :title="title" />

<!-- 子组件 -->
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
// attrs 包含 title、class、style、onSave 等所有非 props 属性
console.log('attrs:', attrs)   // { title: '...', onSave: fn, class: '...' }
</script>
```

## ref + defineExpose：跨层级访问子组件

```vue
<!-- 子组件显式暴露方法 -->
<script setup>
defineExpose({ focus, reset })
function focus() { /* ... */ }
function reset() { /* ... */ }
</script>

<!-- 父组件通过 ref 调用 -->
<script setup>
import { ref } from 'vue'
const childRef = ref(null)
childRef.value?.focus()
</script>

<template>
  <Child ref="childRef" />
</template>
```

## 实战场景

1. **Vue 2 → Vue 3 迁移**：把所有 `this.$listeners.foo` 改为读取 `useAttrs().onFoo`，或直接解构 props/attrs。
2. **子组件通信**：跨多层组件访问特定子组件方法时，`ref` + `defineExpose` 是稳定方案；避免 `$children`。
3. **第三方组件库封装**：用 `useAttrs()` 透传所有事件，比手动 list 出来更稳。

## 常见踩坑

- **`$listeners` 改名为 `$attrs` 的合并**：迁移时若子组件把所有 attrs 都用 `inheritAttrs: false` 屏蔽了，会导致父组件的事件监听不到 —— 在 setup 里用 `useAttrs()` 重新透传。
- **`$children` 顺序依赖渲染顺序**：v-if 条件渲染会让 `$children` 顺序变化，业务代码千万不要依赖。
- **类型推导**：Vue 3 中 `$listeners` 与 `$children` 不在 `ComponentPublicInstance` 类型里，TypeScript 项目编译失败——直接搜索替换。
- **`useAttrs()` 与 `defineProps`**：setup 里 `useAttrs()` 拿到的 attrs 已经过滤掉被 props 声明接收的字段；如果父组件传的字段被 props 接了，attrs 里不会有它。

## Vue 2 → 3 迁移对照

| Vue 2 | Vue 3 |
|---|---|
| `this.$listeners.click` | `useAttrs().onClick` |
| `this.$children[0]` | `ref` + `defineExpose` |
| `this.$scopedSlots.default` | `useSlots().default` |
| `this.$listeners` 与 `this.$attrs` 分离 | 合并到 `this.$attrs` |
| `inheritAttrs: false` 屏蔽属性透传 | 同左 |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 3 Migration · $listeners 移除](https://v3-migration.vuejs.org/breaking-changes/listeners-removed.html) | 官方迁移说明 |
| [Vue 官方 · Fallthrough Attributes](https://vuejs.org/guide/components/attrs.html) | $attrs 完整规则 |
| [Vue 官方 · useAttrs](https://vuejs.org/api/composition-api-helpers.html#useattrs) | 组合式 API 入口 |
| [Vue 源码 · componentPublicInstance.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentPublicInstance.ts) | 公开实例属性定义 |