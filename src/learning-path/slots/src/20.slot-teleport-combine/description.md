> 版本: Vue 3.x | 状态: stable

# 插槽 + Teleport + Suspense 三组合

通过把插槽内容用 `<Teleport>` 渲染到 body，外层套 `<Suspense>` 等待异步资源加载，组合实现"先等待资源 → 弹出层渲染到 body"的模式。

## 这是什么

```vue
<Suspense>
  <Modal>
    <template #default>
      <Teleport to="body">
        <div class="modal">...</div>
      </Teleport>
    </template>
  </Modal>
</Suspense>
```

- Modal 组件接受 default 插槽
- 插槽内容包含 Teleport，把实际 DOM 渲染到 body
- Suspense 等待 Modal 内部的 async setup

## Vue 怎么实现

- 模板编译器按声明顺序生成 vnode 树
- Teleport 在 patch 阶段把子树挂载到 `to` 目标
- Suspense 监听子树内是否含 async setup / 异步组件；resolved 后切换 default

## 实战中什么时候用 / 什么时候不用

**用**：

- 异步加载表单组件 + 弹出层
- 命令面板（Cmd+K）需要等编辑器资源加载

**不用**：

- 简单同步弹出层
- Teleport 与父组件布局强耦合时

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/built-ins/teleport.html
- https://cn.vuejs.org/guide/built-ins/suspense.html
- https://cn.vuejs.org/guide/components/slots.html

## 常见踩坑

- 嵌套顺序：Suspense 必须是最外层；否则内部 Teleport 仍要等待外层 resolve
- Teleport 内的内容不参与父组件的 transition

## 延伸阅读

- https://cn.vuejs.org/guide/built-ins/teleport.html
- https://cn.vuejs.org/guide/built-ins/suspense.html
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/Teleport.ts
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/Suspense.ts
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentSlots.ts
- [Vue 源码洞察：Suspense 异步边界与 fallback 触发时机](_analysis/vue-source-insights.md#suspense异步边界与-fallback-触发时机) | `packages/runtime-core/src/components/Suspense.ts:191-220` 引用
