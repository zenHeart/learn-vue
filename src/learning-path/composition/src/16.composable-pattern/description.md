> 版本: Vue 3.x | 状态: stable

# Composable 标准模式

Composable 是 Vue 3 引入的逻辑复用单元：`useMouse`、`useFetch`、`useStorage` 都遵循同一种范式——一个返回响应式数据 + 动作方法的函数，命名以 `useXxx` 开头。

## 这是什么

```ts
export function useMouse() {
  const x = ref(0)
  const y = ref(0)
  const update = (e: MouseEvent) => { x.value = e.clientX; y.value = e.clientY }
  onMounted(() => window.addEventListener('mousemove', update))
  onBeforeUnmount(() => window.removeEventListener('mousemove', update))
  return { x, y }
}
```

调用：

```vue
<script setup lang="ts">
const { x, y } = useMouse()
</script>
```

## Vue 怎么实现

- Composable 不依赖任何运行时机制，本质就是普通 JS 函数
- SSR 安全版本需要使用 `effectScope` / `getCurrentScope()`：在 effectScope 中注册副作用，确保在 SSR 阶段不会因为副作用泄漏
- 渲染上下文则使用 `getCurrentInstance()` 或 `onMounted` 隐式绑定

## 实战中什么时候用 / 什么时候不用

**用**：

- 抽取跨组件复用的状态/副作用逻辑
- 表单字段管理、滚动加载、WebSocket 连接

**不用**：

- 一次性业务逻辑，提取为 composable 反而徒增抽象
- 复杂的业务流程——使用 store / Pinia

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/reusability/composables.html
- https://cn.vuejs.org/api/reactivity-advanced.html#effectscope
- https://cn.vuejs.org/guide/scaling-up/sfc.html

## 常见踩坑

- 在 composable 内直接调用 `onMounted` 时如果脱离了组件上下文会报错；SSR 安全版本应当用 `effectScope` 显式控制
- 不要在 composable 内部修改入参对象；返回新对象保持引用稳定
- 命名 `useXxx` 是约定，与运行时无强约束

## 延伸阅读

- https://cn.vuejs.org/guide/reusability/composables.html
- https://cn.vuejs.org/api/reactivity-advanced.html#effectscope
- https://github.com/vueuse/vueuse (经典实现参考)
- https://github.com/vuejs/core/blob/main/packages/reactivity/src/effectScope.ts
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiLifecycle.ts
- [Vue 源码洞察：effectScope 与组件 setup 的双向绑定](_analysis/vue-source-insights.md#effectscope与组件setup的双向绑定) | `packages/reactivity/src/effectScope.ts` 引用
