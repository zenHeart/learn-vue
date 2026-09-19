# 项目架构

## 项目目标

`learn-vue` 是一个面向 Vue 学习者的可交互教程站点：所有 demo 都在浏览器内通过 `@vue/repl` 即时运行，配合左侧 sidebar 形成「主题路径 → 步骤 demo → REPL」的渐进式学习体验。

与 Vue 官方文档的关系：本仓库**不重复 Vue 官方教程**，而是补充实战示例与源码级深度；每个 demo 在 `description.md` 中都引用 [vuejs.org](https://vuejs.org) 对应章节与对应 RFC 作为延伸阅读。

## 顶层架构

```
.
├── .vitepress/                # VitePress 配置与主题
│   ├── config.ts              # 站点主配置（nav、sidebar、footer）
│   ├── sidebar-generator.ts   # 根据目录自动生成 sidebar
│   ├── sidebarHMRPlugin.ts    # 文件变更时热更新 sidebar
│   ├── conditionalCompilerAliasPlugin.ts
│   └── theme/
│       └── components/        # Home.vue、LearningPathRepl 等主题组件
├── src/                       # VitePress srcDir
│   ├── index.md               # 首页
│   ├── docs/                  # 参考文档（API、原理、工具链）
│   └── learning-path/         # 交互式学习路径
│       ├── README.md          # 本仓库说明
│       ├── contributor.md     # 贡献指南
│       ├── learning-path.data.ts
│       ├── index.md           # 学习路径总览
│       └── <path>/            # 每条学习路径
│           ├── index.md
│           ├── learning.md
│           ├── topic.data.ts
│           └── src/<NN.demo>/
│               ├── description.md
│               ├── App/App.vue
│               └── _hint/App/App.vue
├── _examples/                 # 独立 webpack / Vite 示例项目
│   ├── common/                # 跨路径通用示例
│   ├── vue2/                  # Vue 2 demo 集合
│   ├── vue3/                  # Vue 3 demo 集合
│   ├── theory/                # 理论章节示例
│   └── fullstack/             # 与社区对照的实战级示例集合
├── graph/                     # 图例、流程图、培训材料
│   ├── cart.puml              # 购物车状态图（PlantUML）
│   ├── router_guide_event.puml
│   ├── vue3.5-features.svg    # Vue 3.5 新特性一览
│   └── learning-paths-overview.puml  # 12 条学习路径关系图
├── scripts/                   # 仓库级脚本
│   ├── verify-learning-paths.mjs   # 校验 demo 必备文件与禁用模式
│   └── verify-docs.mjs             # 校验 src/docs/ 中的禁用模式
├── architecture.md            # 当前文件
├── AGENTS.md                  # AI Agent 行为准则与内容安全规范
├── package.json
└── README.md
```

## 学习路径约定

每条学习路径都是 `src/learning-path/<path>/` 下的一个目录，**必备**：

- `index.md`：VitePress 路由入口，提供该路径的概述与跳转链接。
- `learning.md`：加载 `topic.data.ts` 并渲染 REPL 组件的页面。
- `topic.data.ts`：通过 `createLearningPathData('<path>')` 声明路径名。
- `src/`：包含若干 demo 目录。

当前共有 12 条路径：`01.concept` / `Vue2` / `composition` / `reactivity` / `watchers` / `slots` / `advanced` / `theory` / `vue-router` / `pinia` / `ecosystem` / `performance`，合计 100+ demo。

sidebar 由 `scripts/sidebar-generator.ts` 按目录自动生成，**新增路径无需手动配置导航**；新增 demo 也无需改任何配置，前提是遵循下方 demo 规范。

## demo 规范

每个 demo 目录位于 `src/learning-path/<path>/src/<NN.name>/` 下，目录名形如 `01.reactive`，数字前缀用于 sidebar 排序。

**必备文件**：

- `description.md`：步骤说明、原理剖析、官方文档与 RFC 延伸阅读；长度建议 ≥ 80 字符。
- `App/App.vue`：REPL 默认加载的入口组件；长度建议 ≥ 80 字符。

**可选文件**：

- `_hint/App/App.vue`：参考答案；目录结构应与主目录一致，可精简。
- 其它辅助组件（如 `Child.vue`）：放在 `App/` 下，REPL 会一并加载。

**禁用模式**（见 `AGENTS.md` 与 `scripts/verify-learning-paths.mjs`）：

- 公司名、产品名、内部 repo / commit hash、内部 IP 等敏感信息。
- `computed` getter 中包含赋值、push 等副作用（不可在 getter 内修改 ref）。

## 与 Vue 官方文档的关系

- 本路径**不重复 Vue 文档**，而是补充实战示例与源码级深度。
- 每个 demo 都引用 `vuejs.org` 与对应 RFC 作为延伸阅读。
- `theory` 路径下的 demo 给出 mini 实现并标注 vuejs/core 关键源文件路径，方便对照源码。
- 对齐 Vue 3.5+：跟踪最新特性（`useTemplateRef`、响应式 props 解构、`defineModel` 默认值简化、`watch` 默认深度监听等），纳入对应路径。

## CI 与发布

- `pnpm typecheck`（=`vue-tsc --noEmit`）与 `pnpm build`（=`vitepress build`）是发布门禁。
- 提交前用以下脚本做内容自检：
  - `node scripts/verify-learning-paths.mjs`：校验 demo 必备文件、长度下限、禁用模式与 computed 副作用。
  - `node scripts/verify-docs.mjs`：校验 `src/docs/` 中的禁用模式。
- 站点部署在 `vue.zenheart.site`，由 GitHub Pages 自动发布，详情见 `AGENTS.md`。
