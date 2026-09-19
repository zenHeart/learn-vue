> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/component.ts:540-650` | **延伸阅读**：[Vue 官方 · Component Instance](https://vuejs.org/api/component-instance.html)

# 组件实例属性表：`$root` / `$parent` / `$refs` / `$slots` / `$options` / `$forceUpdate`

## 这是什么

Vue 3 在每个组件实例上挂了一组以 `$` 开头的属性。`$attrs` / `$emit` / `$nextTick` 在其他 demo 已覆盖；本节聚焦剩余的 6 个：

| 属性 | 用途 | 替代方案 |
|---|---|---|
| `vm.$root` | 指向根组件实例（`createApp` mount 的那个） | 极少使用，跨组件传值走 provide/inject |
| `vm.$parent` | 指向父组件实例 | 不推荐用于业务；同样用 provide/inject |
| `vm.$refs` | 字符串 ref 收集（ref="foo" 标记的元素 / 组件） | 用 `useTemplateRef('foo')`（3.5+）或 `ref<HTMLElement>(null)` |
| `vm.$slots` | 父组件传入的插槽对象 | `<script setup>` 用 `useSlots()` |
| `vm.$options` | 当前组件的选项对象（name / components / directives 等） | 通常仅调试用 |
| `vm.$forceUpdate()` | 强制组件重渲染 | **不推荐**；用响应式数据触发更新 |

> **为什么 `<script setup>` 看不到这些属性？** `<script setup>` 编译产物里 `$root` / `$parent` 等只能在 `this` 上访问，而 setup 阶段 `this` 不是当前实例（编译成 setup 函数）。要访问实例属性需 `getCurrentInstance()`。

## 源码走读

```ts
// packages/runtime-core/src/component.ts (节选)
export type ComponentInternalInstance = {
  parent: ComponentInternalInstance | null
  root: ComponentInternalInstance
  refs: Data
  slots: Slots
  // ...
}

// 编译产物访问实例属性：
// const root = getCurrentInstance()?.proxy.$root
// const parent = getCurrentInstance()?.proxy.$parent
// const refs = getCurrentInstance()?.refs
```

## Options API 完整使用

```vue
<script>
export default {
  mounted() {
    // 1. 根实例
    console.log('root instance:', this.$root)

    // 2. 父实例（如果存在）
    console.log('parent instance:', this.$parent)

    // 3. 字符串 ref 收集
    // 模板里：<input ref="emailInput" />
    this.$refs.emailInput?.focus()

    // 4. 强制重渲染
    this.$forceUpdate()
  },
}
</script>
```

## `<script setup>` 替代方案

```vue
<script setup>
import { getCurrentInstance, useTemplateRef } from 'vue'

const inst = getCurrentInstance()
// $root / $parent：通过 proxy 间接访问
console.log(inst?.proxy?.$root)
console.log(inst?.proxy?.$parent)

// $refs：用 useTemplateRef（推荐）
const emailInput = useTemplateRef('emailInput')
onMounted(() => emailInput.value?.focus())
</script>

<template>
  <input ref="emailInput" />
</template>
```

## 实战场景

1. **跨多层组件通信**：不推荐 `$parent` 链式访问——组件结构变化时立刻崩；改用 provide/inject 或 event bus。
2. **动态 ref 列表**：当 ref 个数由数据决定时（v-for），必须用函数 ref `ref="el => items[i] = el"` 或 `useTemplateRef`；不能用 `$refs.foo` 命名。
3. **拿到祖先组件实例的某方法**：偶尔用于「祖先组件暴露的工具方法」——通过 `defineExpose` + ref 拿到，比 `$parent.$method` 健壮。
4. **强制刷新**：极少数场景（第三方 DOM 库手动改 DOM 后）用 `$forceUpdate()`，但 99% 场景是响应式状态没正确注册。

## 常见踩坑

- **`this.$refs` 在 mount 前是空对象**：v-for + ref 时尤其注意，必须在 `onMounted` 或 `nextTick` 里访问。
- **`getCurrentInstance()` 只能在 setup / 生命周期里调用**：放到异步回调（比如 `setTimeout`）里必须先保存实例引用。
- **`<script setup>` 不要直接解构 `inst`**：会丢失响应式追踪。改用 `inst?.proxy` 或保存后局部使用。
- **`$forceUpdate` 不会重新执行 setup**：仅强制 patch 当前渲染函数；数据初始化逻辑不会重跑。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · Component Instance](https://vuejs.org/api/component-instance.html) | `$` 属性完整列表 |
| [Vue 官方 · template ref](https://vuejs.org/guide/essentials/template-refs.html) | ref 收集机制 |
| [Vue 源码 · component.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/component.ts) | ComponentInternalInstance 完整定义 |
| [Vue 3.5 useTemplateRef](https://vuejs.org/api/composition-api-helpers.html#usetemplateref) | 推荐替代 `$refs` |