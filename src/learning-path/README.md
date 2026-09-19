# Vue 学习路径仓库说明

本目录是 `learn-vue` 仓库的学习路径子集，承载所有可交互的 Vue demo。站点构建产物由 VitePress 渲染，左侧 sidebar 通过 `scripts/sidebar-generator.ts` 自动从目录结构生成，**新增路径无需手动修改导航配置**。

## 仓库目标

- 提供一份从入门到资深、可在浏览器中直接运行的 Vue 学习材料。
- 覆盖 Vue 核心 API、源码原理、官方生态（vue-router / pinia）、周边工具链（Vite / unplugin-vue-components）、主流组件库模式与性能 / 工程化踩坑专题。
- 对齐 Vue 官方文档与 RFC：每个 demo 在 `description.md` 中都标注对应文档与 RFC 章节作为延伸阅读，**本仓库不复制官方教程**，而是补充实战示例与源码级深度。
- 追踪 Vue 3.5+ 的最新特性：`useTemplateRef`、响应式 props 解构、`defineModel` 默认值简化、`watch` 默认深度监听等均已纳入对应路径的 demo。

## 目录约定

每条学习路径都是 `learning-path/<path>/` 下的一个目录，必须包含：

| 文件 / 目录 | 作用 |
| --- | --- |
| `index.md` | VitePress 路由入口，提供该路径的概述与导航。 |
| `learning.md` | 加载 `topic.data.ts`，渲染 REPL 组件的页面。 |
| `topic.data.ts` | 通过 `createLearningPathData('<path>')` 声明路径名，供 `learning-path.data.ts` 动态加载。 |
| `src/NN.<demo>/` | 单个 demo 目录，按数字前缀排序。 |

每个 demo 目录的内部规范：

| 文件 / 目录 | 是否必须 | 作用 |
| --- | --- | --- |
| `description.md` | 必须 | 步骤说明、原理剖析、官方文档与 RFC 延伸阅读。 |
| `App/App.vue` | 必须 | REPL 默认加载的入口组件，可附带 `Child.vue` 等辅助文件。 |
| `_hint/App/App.vue` | 可选 | 「显示提示」按钮加载的参考答案，结构应与主目录一致但可精简。 |

完整示例见 `src/learning-path/contributor.md`。

## 路径列表

当前仓库包含 12 条学习路径，按推荐顺序排列：

| 路径 | 主题 | demo 数 |
| --- | --- | --- |
| `01.concept` | Vue 概念入门 | 8 |
| `Vue2` | Vue 2 兼容示例 | 2 |
| `composition` | Composition API 全貌 | 8 |
| `reactivity` | 响应式系统 | 25 |
| `watchers` | watch / watchEffect | 15 |
| `slots` | 插槽与作用域插槽 | 14 |
| `advanced` | 高级组件模式 | 7 |
| `theory` | 源码级 mini 实现 | 14 |
| `vue-router` | Vue Router 4 | 8 |
| `pinia` | Pinia 状态管理 | 1 |
| `ecosystem` | 周边工具链 | 4 |
| `performance` | 性能与基准 | 1 |

合计约 100+ demo。完整目录树可用 `find src/learning-path -maxdepth 3 -type d | sort` 查看。

## 如何贡献

1. **新增 demo**：在对应路径的 `src/` 下创建 `NN.<name>/` 目录，补齐 `description.md` 与 `App/App.vue`；可选地提供 `_hint/App/App.vue`。
2. **新增路径**：在 `learning-path/<new-path>/` 下创建完整目录结构（`index.md` / `learning.md` / `topic.data.ts` / `src/`）；sidebar 会自动收录。
3. **自检**：提交前运行 `node scripts/verify-learning-paths.mjs`，会自动校验每个 demo 的必备文件、内容长度与禁用模式（见 `AGENTS.md`）。
4. **类型检查**：运行 `pnpm typecheck`（= `vue-tsc --noEmit`）。
5. **构建验证**：运行 `pnpm build`，确保 `vitepress build` 通过。

## 与 Vue 官方文档的关系

- 本仓库**不重复 Vue 官方教程**的内容。
- 每个 demo 都引用 [vuejs.org](https://vuejs.org) 对应章节与对应 RFC（如 [Vue 3.5 release notes](https://github.com/vuejs/core/blob/main/CHANGELOG.md)）作为延伸阅读。
- 推荐阅读顺序：先看 demo 的 `description.md` → 自己修改 REPL → 对比 `_hint/` → 最后查阅官方文档与 RFC。

## CI 与发布

- `pnpm typecheck` 与 `pnpm build` 是发布门禁。
- 提交前可运行 `node scripts/verify-learning-paths.mjs` 与 `node scripts/verify-docs.mjs` 做内容自检。
- 站点部署在 `vue.zenheart.site`，由 GitHub Pages 自动发布。
