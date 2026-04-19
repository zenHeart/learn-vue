# Vue.js 高级学习资源指南

## 概述

本文档整理自 [filrak/vuejs-advanced-learning](https://github.com/filrak/vuejs-advanced-learning)，汇集 Vue.js 高级学习资源。

## 资源分类

### 1. Vue 3 深入

#### Composition API
- [Vue 3 Composition API 官方文档](https://v3.vuejs.org/api/composition-api.html)
- [VueUse - Vue Composition API 工具库](https://github.com/vueuse/vueuse)

#### 响应式原理
- [Vue 3 响应式原理详解](https://vue3js.cn/reactivity/)
- [手写 Vue 3 响应式系统](https://github.com/cuixiaorui/mini-vue)

### 2. 性能优化

#### 虚拟滚动
- [vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller)
- [vue-virtual-scroll-list](https://github.com/tangbc/vue-virtual-scroll-list)

#### 懒加载
- [vue-lazyload](https://github.com/hilongjw/vue-lazyload)
- [Vue Router 懒加载](https://router.vuejs.org/zh/guide/lazy-loading.html)

### 3. 状态管理

#### Pinia（Vue 3 推荐）
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Pinia vs Vuex](https://pinia.vuejs.org/cookbook/options-api.html)

#### Vuex
- [Vuex 官方文档](https://vuex.vuejs.org/zh/)
- [Vuex 持久化方案](https://github.com/robinvdvleuten/vuex-persistedstate)

### 4. 服务端渲染（SSR）

#### Nuxt.js
- [Nuxt 3 官方文档](https://nuxt.com/)
- [Nuxt 3 vs Nuxt 2 对比](https://nuxt.com/v3)

#### Vite SSR
- [Vite SSR 指南](https://vitejs.dev/guide/ssr.html)
- [vite-ssr 示例项目](https://github.com/frandiox/vite-ssr)

### 5. 测试

#### 单元测试
- [Vitest - Vite 原生测试框架](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)

#### E2E 测试
- [Cypress](https://www.cypress.io/)
- [Playwright](https://playwright.dev/)

### 6. 类型支持

#### TypeScript + Vue
- [Vue 3 TypeScript 指南](https://vuejs.org/guide/typescript/overview.html)
- [Vue TSX](https://github.com/vuejs/tsc-vue)
- [vue-ts-tailwind-template](https://github.com/very工具/vue-ts-tailwind-template)

### 7. 微前端

#### qiankun
- [qiankun 微前端框架](https://qiankun.umijs.org/)
- [Vue 微前端接入示例](https://github.com/umijs/qiankun/tree/master/examples/vue)

### 8. 源码学习

- [Vue 3 源码解读](https://github.com/cuixiaorui/mini-vue)
- [Vue 2 源码解读](https://github.com/answershuto/learnVue)

## 学习路径建议

### 进阶路线

```
1. Vue 3 Composition API → 2. TypeScript 支持 → 3. 状态管理（Pinia）→ 
4. SSR（Nuxt 3）→ 5. 性能优化 → 6. 测试 → 7. 源码解读
```

### 专题深入

- **响应式原理**：学习 Vue 3 的 Proxy vs Vue 2 的 Object.defineProperty
- **Virtual DOM**：理解 Vue 的渲染策略和优化
- **NextTick**：深入 Vue 的异步更新队列

## 实用工具

| 工具 | 用途 |
|------|------|
| Vue Devtools | 调试工具 |
| Vite | 构建工具 |
| Vitest | 单元测试 |
| cypress | E2E 测试 |
| Pinia | 状态管理 |
| VueUse | Composition API 工具库 |

## 相关文档

- [Vue 3 官方文档](https://vuejs.org/)
- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
- [Vue Router 4](https://router.vuejs.org/zh/)

## 更新日志

- 2026-04-19：初始文档，基于 filrak/vuejs-advanced-learning 整理
