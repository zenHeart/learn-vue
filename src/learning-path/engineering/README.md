# Vue 工程化专题

围绕 Vue 3 项目的工程化全景：包管理、Lint、测试、CI、目录组织、组件设计模式。每个 demo 都给出可直接抄走的关键配置与理由。

## 分类索引

| 类别 | 关注点 | 代表 demo |
|------|--------|-----------|
| 包管理 | pnpm workspace、monorepo、构建拓扑 | `01`, `05` |
| 代码质量 | ESLint flat config、Prettier、Husky | `02`, `04` |
| 测试 | Vitest 快照、覆盖率、组件测试 | `03` |
| CI | GitHub Actions、缓存策略 | `05` |
| 编辑器 | VSCode 推荐配置、保存格式化 | `06` |
| 构建 | Vite 插件顺序、resolve.alias | `07`, `08` |
| 架构 | 分层、Feature-Sliced | `09` |
| 组件模式 | Container、Headless、Compound | `10` |

## Demo 列表

1. [monorepo + pnpm](./src/01.monorepo-vue-pnpm/) — workspace 配置 + 拓扑排序
2. [ESLint + TS + Vue](./src/02.eslint-config-typescript-vue/) — flat config 选型
3. [Vitest 快照测试](./src/03.vitest-vue-snapshot/) — 组件快照与覆盖率
4. [Husky + lint-staged](./src/04.git-hooks-husky-lint/) — 提交前自动检查
5. [GitHub Actions 缓存](./src/05.ci-caching-pnpm/) — pnpm/action-setup 实战
6. [VSCode 推荐配置](./src/06.vscode-settings-recommended/) — 保存格式化
7. [Vite 插件顺序](./src/07.vite-plugin-order/) — 常见插件与冲突排查
8. [路径别名](./src/08.path-aliases/) — tsconfig paths + vite alias 一致性
9. [分层架构](./src/09.layer-based-architecture/) — views / components / composables
10. [组件设计模式](./src/10.component-design-patterns/) — Container / Headless / Compound

## 验证方式

- 直接复制 `description.md` 里的配置文件到项目里验证
- 用 Vue 官方模板 `create-vue` 初始化后逐项对比
- 看 Vitest / ESLint / Husky 的官方文档
