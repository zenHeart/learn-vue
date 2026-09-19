# Vue 工程化全景

Vue 3 项目的工程化链条：从包管理、Lint、测试到 CI、目录组织与组件设计模式。本文件是导航，配合 `learning-path/engineering/` 下 10 个 demo 使用。

## 六大维度

| 维度 | 关注点 | 关键工具 | 工程 demo |
|------|--------|---------|-----------|
| **包管理** | monorepo、构建顺序、依赖共享 | pnpm workspace、Turborepo | `01` |
| **构建** | 打包体积、chunk 拆分、TypeScript | Vite、插件顺序、路径别名 | `07`, `08` |
| **Lint / 格式** | 代码风格、提交门禁 | ESLint flat config、Prettier、Husky | `02`, `04` |
| **测试** | 单元 / 组件 / 快照 | Vitest、@vue/test-utils | `03` |
| **CI** | 自动化、缓存、并行 | GitHub Actions、pnpm cache | `05` |
| **目录组织** | 分层 / 切片、单向依赖 | FSD、Layered、alias | `09` |
| **编辑器** | 团队体验一致 | VSCode settings.json | `06` |
| **组件模式** | 复用边界、API 设计 | Container / Headless / Compound | `10` |

## 选型决策树

```
新项目启动？
  │
  ├─ 单仓库 / 单应用 → 标准分层 + pnpm
  │
  ├─ 多应用共享 UI → pnpm workspace + 拓扑构建
  │
  ├─ 大型多团队 → FSD 切片
  │
  └─ 已有仓库升级 → flat config 渐进迁移
```

## 学习路径

按推荐顺序浏览：

1. `01.monorepo-vue-pnpm` — 包管理与构建顺序
2. `02.eslint-config-typescript-vue` — 代码质量门禁
3. `03.vitest-vue-snapshot` — 测试基线
4. `04.git-hooks-husky-lint` — 本地提交门禁
5. `05.ci-caching-pnpm` — CI 缓存策略
6. `06.vscode-settings-recommended` — 编辑器一致
7. `07.vite-plugin-order` — 构建工具链
8. `08.path-aliases` — 路径别名同步
9. `09.layer-based-architecture` — 代码组织
10. `10.component-design-patterns` — 组件 API 设计

## 关键工具一览

| 工具 | 作用 | 配置位置 |
|------|------|---------|
| pnpm | 包管理 | `pnpm-workspace.yaml` |
| Vite | 构建 | `vite.config.ts` |
| TypeScript | 类型 | `tsconfig.json` |
| ESLint | Lint | `eslint.config.js` |
| Prettier | 格式 | `.prettierrc` |
| Vitest | 测试 | `vitest.config.ts` |
| Husky | git hook | `.husky/` |
| lint-staged | 暂存 lint | `package.json` |
| commitlint | commit 校验 | `commitlint.config.js` |
| GitHub Actions | CI | `.github/workflows/` |

## 官方资源

- [pnpm workspaces](https://pnpm.io/workspaces)
- [Vite Config](https://vite.dev/config/)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Vitest](https://vitest.dev/)
- [Feature-Sliced Design](https://feature-sliced.design/)
