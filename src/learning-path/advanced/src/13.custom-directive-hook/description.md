> 版本: Vue 3.x | 状态: stable

# 自定义指令全生命周期

Vue 3 中自定义指令有 7 个生命周期钩子：`created`、`beforeMount`、`mounted`、`beforeUpdate`、`updated`、`beforeUnmount`、`unmounted`。每个钩子接收 `el`、`binding`、`vnode`、`prevVnode` 参数。

## 这是什么

```ts
const myDir = {
  created(el, binding, vnode) {},
  beforeMount(el, binding) {},
  mounted(el, binding) {},
  beforeUpdate(el, binding, vnode, prevVnode) {},
  updated(el, binding) {},
  beforeUnmount(el, binding) {},
  unmounted(el, binding) {},
}
```

使用方式：

```vue
<input v-myDir="value" />
```

全局注册：`app.directive('myDir', myDir)`；局部注册：在组件 `directives: { myDir }` 中声明。

## Vue 怎么实现

- 入口：`packages/runtime-core/src/directives.ts` 解析 `v-xxx` 调用对应钩子
- 钩子由渲染器在 mount / patch / unmount 阶段按顺序触发
- TypeScript 类型：`declare module 'vue' { interface ComponentCustomProperties { vMyDir: Directive } }`

## 实战中什么时候用 / 什么时候不用

**用**：

- 直接操作 DOM（focus、resize、IntersectionObserver）
- 第三方命令式库的封装（lodash、chart.js）

**不用**：

- 数据驱动的 UI——用组件即可
- 复杂逻辑——抽成 composable

## 官方文档延伸阅读

- https://cn.vuejs.org/guide/reusability/custom-directives.html
- https://cn.vuejs.org/api/custom-directive.html

## 常见踩坑

- 钩子接收的 `el` 是真实 DOM；不要在 SSR 中使用 mounted / updated
- 局部指令名需要加 `v` 前缀；全局无
- 修改 vnode 属性时记得同步到 prevVnode（vnode 引用更新）

## 延伸阅读

- https://cn.vuejs.org/guide/reusability/custom-directives.html
- https://cn.vuejs.org/api/custom-directive.html
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/directives.ts
- https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts
- https://v3-migration.vuejs.org/breaking-changes/custom-directives.html
