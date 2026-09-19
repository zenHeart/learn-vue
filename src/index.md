---
page: true
title: learn vue
---

<script setup>
import Home from '@theme/components/Home.vue'
</script>

# Vue Learning Path

> 从零到专家的渐进式 Vue 学习路径。本仓库基于「示例驱动」组织内容，覆盖 Vue 核心、生态工具链与工程实战；每一个 demo 都可以在浏览器内即时编辑运行，并在 Vue 源码与对应 RFC 层面给出延伸阅读。

本站的目标是让一名「能写 Vue」的前端工程师，成长为「理解 Vue」的资深开发者：不仅会用 API，更看得见响应式系统的内部流转、组件渲染的调度顺序，以及工程化实践中那些被掩盖的细节。

## 推荐学习顺序

1. **入门（concept + Vue2）**：从模板语法、`createApp`、响应式初识开始，建立组件化心智模型。
2. **响应式（reactivity + watchers + composition）**：深入 `ref` / `reactive` / `computed` / `watch` / `watchEffect`，理解依赖收集与调度队列。
3. **组件系统（slots + advanced）**：插槽、动态组件、`Teleport`、异步组件、函数式组件与全局属性。
4. **进阶（theory）**：从源码层面拆解 mini 响应式、Diff 算法、生命周期派发、Hydration 流程。
5. **生态与实战（vue-router + pinia + ecosystem）**：官方生态工具链的真实使用方式；以及性能、工程化、踩坑专题。

## 站点特色

- **基于示例组织**：每个 API 与概念都对应一个可运行的最小例子，避免抽象语法讲解。
- **配套 REPL**：所有 demo 内嵌 `@vue/repl`，无需本地搭建环境即可在线修改、运行、保存。
- **源码级深度**：theory 路径给出 mini 实现与 vuejs/core 关键路径对照，标注行号。
- **生态工具链覆盖**：从 Vue Router、Pinia 到 Vite、SFC 按需编译与 unplugin-vue-components。
- **主流组件库模式**：提炼 Element Plus / Naive UI / Ant Design Vue 等主流组件库的通用模式与对比。
- **性能与踩坑专题**：在大型数据结构下 spread 响应式代理的依赖收集成本、SSR、computed 副作用等。

## 目标读者

- **Vue 初学者**：刚接触 Vue，希望从「看得懂的最小例子」入手而不是大段概念灌输。
- **准备进阶到组合式 API 的开发者**：熟悉 Options API，希望系统补齐 `<script setup>` 与 Composition 范式。
- **想理解原理的资深开发者**：能熟练使用 Vue，但希望看清响应式、调度、Diff、Hydration 的内部机制。

## 路径概览（点击卡片进入）

<Home />

## 如何使用本路径

每个 demo 都遵循统一的目录结构（见 `src/learning-path/contributor.md`）：

- `description.md`：步骤说明与原理剖析。
- `App/App.vue`：可运行的最小示例，REPL 默认加载。
- `_hint/App/App.vue`：可选的「参考答案」，点击页面中的「显示提示」按钮切换。

阅读顺序建议：

1. 先读 `description.md`，理解要解决的问题。
2. 打开 REPL 自己修改代码、观察输出。
3. 比对 `_hint/` 下的参考答案，反思自己的实现差异。
4. 在 Vue 官方文档与对应 RFC 中查阅延伸阅读。

## 最近更新

- **2026-09 重构**：基于 Vue 3.5 重做 reactivity / watchers / slots / theory 等核心路径，加入 `useTemplateRef`、响应式 props 解构、`defineModel` 默认值简化、`watch` 默认深度监听等 3.5 新特性专题。
- **新增生态路径**：vue-router / pinia / ecosystem / performance / advanced / composition 覆盖官方生态与周边工具。
- **新增主流组件库专题**：在 advanced 路径下整理 Element Plus / Naive UI / Ant Design Vue 的共性模式与差异点。
- **新增工程化与踩坑专题**：从 vite 配置、SFC 按需加载到大型列表响应式代理的依赖收集性能，提供可复现的对比 demo。
- **元数据升级**：sidebar 由 `scripts/sidebar-generator.ts` 自动从目录生成，新增路径无需手改导航；提交前可运行 `node scripts/verify-learning-paths.mjs` 自检 demo 规范。

## 贡献与反馈

仓库遵守 `AGENTS.md` 中的内容安全规范（不出现具体公司名、产品名、内部路径、Profile JSON 等）。欢迎通过 Issue / PR 反馈 demo 问题或补充新路径，详见 `src/learning-path/contributor.md`。
