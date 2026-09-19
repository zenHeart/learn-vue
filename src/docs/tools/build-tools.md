---
title: Build Tools    
tags: build tools monorepo      
birth: 2026-09-19      
modified: 2026-09-19      
---

构建工具与 monorepo
===

> 本节不重复 Vite 官方文档，而是实战视角：站在「选型」的入口，对比 Vite / Webpack / Rspack 的真实差异，再展开 monorepo 工具（pnpm workspaces / turborepo / nx）的协作模式。配套的可交互 demo 见 [`/learning-path/ecosystem/#01.vite-sfc-on-demand`](/learning-path/ecosystem/#01.vite-sfc-on-demand) 与 [`#14.bundle-analyze`](/learning-path/ecosystem/#14.bundle-analyze)。

---

## 构建工具横向对比

| 维度 | Vite | Webpack 5 | Rspack |
|---|---|---|---|
| dev 启动 | < 200ms | 数秒到数十秒 | ~1s |
| dev HMR | < 50ms | 数百 ms | ~100ms |
| 生产构建 | Rollup 慢一些 | 中 | 接近 Vite |
| 生态（loader / plugin） | 较少但快 | 巨大 | Webpack 兼容层 |
| 配置文件心智 | 简单 | 复杂 | 接近 Webpack |
| 浏览器目标假设 | 现代（ES2020+） | 任意 | 任意 |
| 适合 | 主流 SPA / 库 | 老项目 / 特殊 loader | 大型 monorepo |

### 何时选 Vite

- **绝大多数 Vue / React SPA**：默认选
- **库 / 组件库**：`vite build --lib` 直接产出 ESM/CJS
- **文档站 / SSG**：VitePress 是首选

### 何时选 Webpack

- 项目有大量遗留 `loader`（如自定义 `vue-loader`）
- 需要 micro-frontends 模块联邦（Module Federation）
- 目标浏览器极老（IE11 等）

### 何时选 Rspack

- Webpack 配置迁移成本高
- 想要 Webpack 兼容 + Vite 速度
- Rust 性能优势在大型项目（> 5k 模块）明显

## 决策树

```
新项目，主流 SPA
  └ → Vite ✓

老项目，Webpack 5，跑得动
  └ → 保持不动，除非冷启动成痛点

老项目，Webpack 5 / 4，启动超 30 秒
  └ → 评估迁移到 Vite
  └ → 或并行试点 Rspack（兼容 loader）

库 / 工具
  └ → Vite（--lib 模式）

大型 monorepo
  └ → Rspack 或 Vite + turborepo
```

## 配置迁移要点

### Webpack → Vite

| Webpack | Vite |
|---|---|
| `vue-loader` | `@vitejs/plugin-vue`（自动） |
| `babel-loader` | esbuild（自动） |
| `sass-loader` / `less-loader` | 内置 |
| `resolve.alias` | `vite.config.ts` 的 `resolve.alias` |
| `devServer.historyApiFallback` | 默认开启 |
| `optimization.splitChunks` | `build.rollupOptions.output.manualChunks` |
| `html-webpack-plugin` | 默认入口 HTML 即可 |

### Vite → Rspack

Rspack 通过 `@rspack/cli` + Webpack 兼容层直接读 `webpack.config.js`。改动很小，主要替换：

- `webpack` → `@rspack/core`
- `webpack-dev-server` → `@rspack/dev-server`
- 一些 plugin 用 `@rspack/plugin-*`

## Monorepo 工具

### pnpm workspaces

最小可用的 monorepo 工具，靠 `pnpm-workspace.yaml`：

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

特点：

- **硬链接共享 store**：磁盘省一个数量级
- **严格的依赖隔离**：A 包依赖 B 包必须显式声明，避免意外 hoist
- **过滤命令**：`pnpm --filter @my/ui test` 只跑某个子包

```bash
# 跑所有包
pnpm -r test

# 只跑 ui 包
pnpm --filter @my/ui test
```

### turborepo

构建 / 任务编排层：

```json
// turbo.json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["build"] },
    "lint": {}
  }
}
```

特点：

- **任务依赖图**：`^build` 强制先跑上游包
- **远程缓存**：CI 上跑过的 `build` cache 起来，下个 PR 直接复用（提速 5-10x）
- **并行执行**：自动按依赖拓扑并发

```bash
turbo run build test lint
```

### nx

更重的 monorepo 工具：

- **代码生成**：`nx g @nx/vue:app my-app`
- **受影响分析**：`nx affected:test` 只跑被改动的包
- **图可视化**：`nx graph`

适合大型团队（> 5 个 monorepo 包）。

### 对比

| 工具 | 适合 | 学习曲线 |
|---|---|---|
| pnpm workspaces | 中小型 monorepo | 平缓 |
| turborepo | 需要缓存提速 | 中等 |
| nx | 大型企业 monorepo | 陡 |

## 实战中的 monorepo 结构

```
monorepo/
├── apps/
│   ├── web/                  # 主站 (Vue 3 + Vite)
│   ├── admin/                # 后台 (Vue 3 + Vite)
│   └── docs/                 # 文档站 (VitePress)
├── packages/
│   ├── ui/                   # 组件库
│   ├── utils/                # 工具函数
│   ├── i18n/                 # 共享语言包
│   └── eslint-config/        # 共享 lint 配置
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### 共享依赖版本

`apps/*/package.json` 里：

```json
{
  "dependencies": {
    "@my/ui": "workspace:*",
    "vue": "3.5.0"
  }
}
```

`workspace:*` 锁定为本仓当前版本。

### 共享 Vite 配置

`packages/vite-config/index.ts`：

```ts
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({ imports: ['vue'] }),
    Components({ dts: true }),
  ],
})
```

应用 `apps/web/vite.config.ts`：

```ts
import baseConfig from '@my/vite-config'
import { defineConfig, mergeConfig } from 'vite'

export default mergeConfig(baseConfig, defineConfig({
  resolve: { alias: { '@': fileURLToPath(...) } }
}))
```

## 何时不用 monorepo

- 单个 SPA，< 10 万行代码
- 团队 < 5 人
- 没有跨包共享需求

**单仓单包 + npm scripts + 类型抽离到 `types/`** 反而更轻。

## 实战 demo 锚点

| 路径 | 演示 |
|---|---|
| [`/learning-path/ecosystem/#01.vite-sfc-on-demand`](/learning-path/ecosystem/#01.vite-sfc-on-demand) | Vite SFC 按需编译、冷启动测点 |
| [`/learning-path/ecosystem/#14.bundle-analyze`](/learning-path/ecosystem/#14.bundle-analyze) | rollup-plugin-visualizer 输出 |
| [`/learning-path/ecosystem/#13.vite-ssr`](/learning-path/ecosystem/#13.vite-ssr) | Vite SSR / SSG |

## 常见坑

| 现象 | 原因 | 修复 |
|---|---|---|
| monorepo 包间循环依赖 | 引用关系错了 | 用 `nx graph` / `turbo run build --dry` 看 |
| 子包改了主仓没生效 | 没 `pnpm install` 重建链接 | 改完子包跑一次 `pnpm install` |
| Rspack 启动比 Vite 还慢 | 没关闭 SWC 缓存 / 没开启持久化缓存 | `experiments: { cache: true }` |
| Webpack 迁移 Vite 后 chunk 变多 | 没配 `manualChunks` | 按 `manualChunks` 分 vendor |
| pnpm install 报 `ERR_PNPM_PEER_DEP_ISSUES` | 锁定文件与声明不一致 | 装包时加 `--auto-install-peers` |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vite 官方](https://cn.vitejs.dev/) | 推荐默认 |
| [Rspack](https://www.rspack.dev/) | Webpack 兼容 + Rust 速度 |
| [pnpm workspaces](https://pnpm.io/workspaces) | 最小 monorepo |
| [turborepo](https://turbo.build/repo) | 任务编排 + 缓存 |
| [nx](https://nx.dev/) | 企业级 monorepo |
