> 版本: Vite 5+ | RFC: — | 状态: stable | 概念: Vite 按需加载 SFC

# Vite 中 Vue SFC 的按需编译

## 你会学到什么

理解 Vite 处理 `.vue` 单文件组件的关键链路：`@vitejs/plugin-vue` 把 SFC 切成 `<template>` / `<script>` / `<style>` 三段，分别交给 `@vue/compiler-sfc` 的 `compileTemplate`、`compileScript`、`compileStyle`，产物按需喂给浏览器。整个过程**不在 dev 启动时全量编译**，而是请求哪个文件、编译哪个文件。

## 真实场景（抽象）

冷启动 `vite dev` 启动时间通常 < 100ms（即使项目有上百个 SFC），因为：

1. **没有 bundler**：`esbuild` 只做依赖预构建（`optimizeDeps`），不会把业务代码打包
2. **SFC 编译是按需**：`/@id/...` 请求触发 `transform` hook，命中 `?vue&type=...` 子模块
3. **浏览器原生 ESM**：`import App from '/App.vue'` 直接走 `transform`

## 关键配置字段

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  optimizeDeps: {
    include: ['vue', 'vue-router'],
    exclude: ['vue-demi']
  }
})
```

| 字段 | 作用 |
|---|---|
| `resolve.alias` | 把 `@` 映射到 `src/`，避免相对路径 `../../../` |
| `resolve.extensions` | `import Foo` 不带后缀时的候选后缀；`.vue` 必须加 |
| `optimizeDeps.include` | 启动时强制预构建的依赖，避免首个请求卡住 |
| `optimizeDeps.exclude` | 跳过预构建（例如某些 ESM-only 包预构建会报错） |

## 动手试

打开右侧 REPL，观察控制台：

- `index.html` 中 `<script type="module" src="/src/main.ts">` 是入口
- 浏览器请求 `/src/main.ts` → Vite 拦截 → `transform` 把它转成浏览器 ESM
- 内部 `import App from './App.vue'` 命中 `vue` 插件的 transform hook，按需编译 SFC

> 想看原始产物？打开 DevTools 的 Network 面板，找到 `App.vue` 这一条响应，能看到它被切成了 3 段（template / script / style）。

## 冷启动基线

| 项目规模 | 冷启动 (dev) | 首次请求 SFC |
|---|---|---|
| 10 个 SFC | ~80ms | < 50ms |
| 100 个 SFC | ~150ms | < 80ms |
| 1000 个 SFC | ~400ms | < 200ms |

这是 Webpack 时代无法想象的——后者需要先把整张依赖图打包完才能 dev。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vite — 为什么这么快](https://cn.vitejs.dev/guide/why.html) | 官方原理 |
| [依赖预构建](https://cn.vitejs.dev/guide/dep-pre-bundling.html) | esbuild + commonjs |
| [`@vitejs/plugin-vue` 源码](https://github.com/vitejs/vite-plugin-vue) | transform 入口 |
| [`resolve.extensions` 与冷启动](https://cn.vitejs.dev/config/shared-options.html#resolve-extensions) | 顺序敏感性 |
