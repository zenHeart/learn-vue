# 模板 :key 属性：v-for 复用控制与强制重建 {#template-key-attribute}

> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/src/vnode.ts`、`packages/runtime-core/src/renderer.ts` | **延伸阅读**：[Vue 官方](https://vuejs.org/api/built-in-special-attributes.html#key)

`:key` 是 vnode 标识，patch 阶段用它决定 vnode 复用 / 重建：

- 相同 key：复用旧 vnode 的 DOM 实例，**组件不重挂**、`setup` 不重跑、`onMounted` 不重触。
- 不同 key：卸载旧 vnode、创建新 vnode —— **setup 重跑、所有生命周期重置**。

## 这是什么 {#what}

```vue
<!-- 1) v-for 中：每项必须稳定 key -->
<div v-for="item in list" :key="item.id">
  <input v-model="item.text" />
</div>

<!-- 2) 动态组件：key 改变强制重建 -->
<component :is="Comp" :key="version" />

<!-- 3) 配合 Transition：key 触发 enter/leave -->
<Transition mode="out-in">
  <div :key="page">page {{ page }}</div>
</Transition>
```

## 源码走读 {#source}

```ts
// packages/runtime-core/src/vnode.ts
// createVNode 时 key 被写入 vnode.key，patch 阶段同 key 复用 DOM

// packages/runtime-core/src/renderer.ts
function patch(oldVnode, newVnode, container) {
  if (oldVnode.key === newVnode.key && oldVnode.type === newVnode.type) {
    // 复用：patch props / children
  } else {
    // 卸载旧的，挂载新的
  }
}
```

关键事实：

- **`:key` 是 vnode 属性**：编译后写入 `vnode.key`，运行时比较。
- **v-for 必须加 key**：否则 Vue 用 index 比较，DOM 复用导致 input 状态错乱、动画失败、过渡失效。
- **稳定的 key 来自业务 ID**：用数据库主键 / uuid，不应用 index。
- **配合 `<Transition>`**：相同元素 + 不同 key 时 `Transition` 走 leave + enter；相同 key 时只 patch 不走动画。

## 实战场景 {#production}

1. **Todo 列表**：每项 `:key="todo.id"` —— 增删不重排输入框状态。
2. **路由切换**：`<RouterView :key="route.path">` —— 不同路径强制重建。
3. **强制重置组件**：`<Form :key="userId">` —— 切换用户时重置表单。
4. **Transition 强制动画**：`<Transition><span :key="status">{{ status }}</span></Transition>` —— status 变化触发淡入淡出。

## 常见踩坑 {#pitfalls}

- **v-for 不加 key**：列表内 input 状态错乱是典型 bug。
- **key 用 index**：数组增删时 index 不稳定，组件状态错乱。
- **同一组件多个 key**：`v-for` 内 `:key="item.id"`，模板内 `:key="item.id"` 与外层相同 Vue 不会重复检查。
- **key 与 ref**：key 改变时旧组件 ref 会被清空，新组件 ref 重新赋值。
- **动态组件 + key**：`<component :is="Cmp" :key="K">` 强制重建时 keep-alive 失效（key 不在 cache 中）。

## 延伸阅读 {#further-reading}

| 资源 | 内容 |
|---|---|
| [Vue 官方 · key](https://vuejs.org/api/built-in-special-attributes.html#key) | 官方文档 |
| [Vue 官方 · v-for 维护状态](https://vuejs.org/guide/essentials/list.html#maintaining-state-with-key) | key 必要性 |
| [Vue 源码 · renderer.ts patch](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts) | patch 流程 |
| [`advanced/34.special-attributes-is-key`](#) | 配套：is/key/ref |
