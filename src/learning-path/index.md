---
title: Vue 学习路径
---

# Vue 学习路径

欢迎来到 Vue 学习路径！本站提供 12 条主题路径、共 100+ 个可交互 demo，覆盖 Vue 核心 API、源码原理、生态工具链与工程化实战。每条路径都遵循统一的目录规范：每个 demo 都包含可运行的最小示例（`App/App.vue`）、可选的参考答案（`_hint/App/App.vue`）和详细的步骤说明（`description.md`），并在 REPL 中即时运行。

## 总览

学习路径的设计遵循「先会用 → 再看清 → 最后做对」三段式：

- **会用**：`01.concept` / `Vue2` / `composition` 提供从模板语法到 `<script setup>` 的渐进过渡；
- **看清**：`reactivity` / `watchers` / `slots` / `theory` 在 API 表面之下展开依赖收集、调度队列、Diff 算法与 Hydration 流程；
- **做对**：`vue-router` / `pinia` / `ecosystem` / `performance` / `advanced` 把工程实践、性能调优与主流组件库模式纳入进来。

## 完整路径列表（按推荐学习顺序）

1. **01.concept（Vue 概念入门）**：模板表达式、HTML 编译入口、`createApp`、基础渲染。适合刚接触 Vue 的读者。
2. **Vue2**：保留 Options API 时代的最小例子，用于版本对比与历史兼容场景。
3. **composition**：从 `setup` 入口到 props / context / runtime 上下文，覆盖 Composition API 的全貌。
4. **reactivity**：25 个 demo 从 `reactive` / `ref` / `computed` 一直走到 mini 响应式实现、`markRaw` / `toRaw`、`effectScope` 与 `onTrack` 调试。
5. **watchers**：15 个 demo 覆盖 `watch` / `watchEffect` 的全部参数形态：源、调度、清理、调试、异步、`stop` 手动控制等。
6. **slots**：14 个 demo 从默认插槽、具名插槽、作用域插槽到 render 函数中的插槽，覆盖组件复用与内容分发的全部姿势。
7. **advanced**：异步组件、`Teleport` 与 Modal、函数式组件、Diff 与 Diff 动画、全局属性。
8. **theory**：14 个源码级 mini 实现 + 渲染管线（编译优化、patch 流程、Hydration mismatch、scheduler 优先级、nextTick 微任务）。
9. **vue-router**：history 模式、动态路由、嵌套路由、命名路由与守卫。
10. **pinia**：Store 基础用法、组合式 Store、与 Vue Router 的整合。
11. **ecosystem**：Vite SFC 按需加载、`unplugin-vue-components` 自动注册、生态工具链的实际使用方式。
12. **performance**：大型数据结构下响应式代理的依赖收集成本、`toRaw` 快照派生与对比基准。

每条路径都在左侧 sidebar 自动出现，无需手动配置。

## 任务案例

[业务交付、响应式机制与异步竞态](/learning-path/cases/) 提供起始缺陷、参考解法、解释任务与真实测试。

## 如何使用本路径

1. **打开 REPL**：进入任意 demo 后，页面右侧会自动加载 `@vue/repl`。你可以直接修改代码、查看编译输出与运行结果。
2. **查看提示**：如果 demo 提供 `_hint/` 目录，页面会出现「显示提示」按钮，点击后 REPL 会切换为参考答案；用于先思考、再对比。
3. **切换 Vue 2 / Vue 3**：在部分路径（如 `Vue2`）下，REPL 会加载 Vue 2 的运行时；其余路径默认使用 Vue 3.5+。
4. **跳到指定 demo**：每条路径的 sidebar 按编号排序（如 `01.reactive` / `02.ref`），直接点击进入即可。

## 目录约定

```
learning-path/
├── README.md              # 本文件
├── contributor.md         # 贡献指南（新增路径 / 新增 demo 的完整流程）
├── learning-path.data.ts  # 数据加载模块
└── <path>/
    ├── index.md           # 入口页面（VitePress 路由）
    ├── learning.md        # REPL 渲染入口
    ├── topic.data.ts      # 路径数据
    └── src/
        └── NN.demo-name/
            ├── description.md
            ├── App/App.vue
            └── _hint/App/App.vue（可选）
```

更详细的目录与命名规范见 [`src/learning-path/contributor.md`](./contributor.md)。

## 贡献新 demo

- 新增路径：在 `learning-path/<new-path>/` 下创建目录，遵循上方的目录约定即可，sidebar 会自动收录。
- 新增 demo：在对应路径的 `src/` 下创建 `NN.<name>/` 子目录，补齐 `description.md` 与 `App/App.vue`。
- 自检：提交前运行 `node scripts/verify-learning-paths.mjs`，会自动校验每个 demo 的必备文件、内容长度与禁用模式。

完整规范与示例见 `src/learning-path/contributor.md`。
