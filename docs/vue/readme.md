# Vue 核心知识库

> 从官方资料中整理的 Vue 学习笔记，持续更新。

## 目录

### 基础概念
- [Vue 核心概念](./concept.md) — 响应式、模板、虚拟 DOM
- [实例属性](./instance-vue.md) — $data / $props / $refs 等
- [模板基础](./hello_vue.md) — 插值、指令、事件

### 组件系统
- [组件基础](./component.md) — 定义、使用、通信
- [插槽](./slot.md) — 作用域插槽、具名插槽
- [插槽属性传递](./advanced/slot-prop-passing.md) — 深度传递技术
- [函数式组件](./component-function.md) — functional 组件
- [Provide/Inject](./provide-inject.md) — 跨级通信

### 进阶特性
- [组合式 API](./composition-api.md) — setup / ref / reactive
- [组合式函数](./composition-api/composition-impl.md) — 可复用逻辑模式
- [响应式原理](./theory.md) — ref / reactive / computed 实现
- [渲染函数](./render.md) — h() / JSX / renderSlot
- [自定义指令](./directive.md) — 指令生命周期
- [事件处理](./event.md) — 事件修饰符、按键修饰符
- [路由](./route.md) — Vue Router 完整指南
- [JSX](./jsx.md) — Vue 中的 JSX 写法
- [开发问题](./develop.md) — 常见问题排查
- [面试题](./question.md) — 核心面试题整理

### 调试与排查
- [Vue 调试指南](./debug/vue-debug-guide.md) — DevTools / 日志 / 断点
- [组件渲染调试](./debug/vue-component-rendering-debug.md) — 渲染问题排查
- [Vue 生命周期](./debug/vue-lifecycle-async.md) — 异步生命周期详解
- [Watch 进阶](./debug/vue-watch-manual.md) — watch 深度使用

### 高级主题
- [SSR 完全指南](./advanced/ssr-guide.md) — 服务端渲染 / Hydration / Nuxt.js

## 在线演示

- [组件渲染调试演示](../examples/vue3/demos/vue-component-rendering-debug.html)
- [插槽属性传递演示](../examples/vue3/demos/slot-prop-passing-demo.html)
- [Vue 生命周期演示](../examples/vue3/demos/vue-lifecycle-async.html)
- [Watch 进阶演示](../examples/vue3/demos/vue-watch-manual.html)
- [SSR 渲染模式演示](../examples/vue3/demos/ssr-demo.html)

## 学习路径

```
入门 → 组件基础 → 组合式 API → 进阶特性 → 实战调试
```

## 参考资料

- [Vue 官方文档](https://vuejs.org/)
- [Vue 3 文档](https://vuejs.org/guide/)
- [Vue Router](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Nuxt 3](https://nuxt.com/)
