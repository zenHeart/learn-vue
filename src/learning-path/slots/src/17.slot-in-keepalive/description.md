> 版本: Vue 3.x | 状态: stable

# 缓存组件中的插槽稳定性

`<KeepAlive>` 缓存组件时，组件实例会持久化；但插槽 props 是由父组件每次渲染时传入的，需要关注引用稳定性。

## 这是什么

```vue
<KeepAlive>
  <CachedComp>
    <template #default="{ data }">
      <div>{{ data.name }}</div>
    </template>
  </CachedComp>
</KeepAlive>
```

- CachedComp 不会随父组件 re-render 重新挂载，因此 `onMounted` 只触发一次
- 父组件传入的插槽函数对象每次渲染可能不同；子组件应避免把插槽函数存进 ref / watch 依赖

## Vue 怎么实现

- KeepAlive 缓存的是组件实例（`instance`），不是插槽
- 父组件 render 函数每次执行会生成新的 vnodes；但子组件实例不变
- 实际渲染时通过 `instance.slots` 重新绑定到新 vnode；保留响应性

## 实战中什么时候用 / 什么时候不用

**用**：

- Tab 切换、表单步骤
- 持久化组件内部状态

**不用**：

- 缓存组件需要每次强制刷新（用 `:key` 强制重建）
- 插槽依赖父组件的局部状态且期望随父组件刷新

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/built-ins/keep-alive.html
- https://cn.vuejs.org/guide/components/slots.html

## 常见踩坑

- `<KeepAlive>` 内修改父组件传入的 props 会触发子组件更新，但 mounted / unmounted 不再触发
- 父组件的回调事件（如 `@click`）始终会跟随父组件的最新引用；不必担心陈旧闭包

## 延伸阅读

- https://cn.vuejs.org/guide/built-ins/keep-alive.html
- https://cn.vuejs.org/guide/components/slots.html
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/KeepAlive.ts
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentSlots.ts
- https://github.com/vuejs/rfcs/discussions/216
