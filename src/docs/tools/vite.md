---
title: Vite    
tags: vite build tool      
birth: 2026-09-19      
modified: 2026-09-19      
---

Vite 配置详解
===

> 本节不重复 Vue 文档的对应章节，而是实战视角：站在「配置出问题时怎么查」的入口，串起本项目用到的所有 Vite 关键字段与典型陷阱。配套的可交互 demo 见 [`/learning-path/ecosystem/#01.vite-sfc-on-demand`](/learning-path/ecosystem/#01.vite-sfc-on-demand)。

---

## 为什么 Vite 这么快

Vite 在 dev 阶段不做 bundling——直接复用浏览器原生 ESM。每个 `.vue`、`.ts`、`.less` 文件都是一个独立模块，浏览器发起请求时，Vite 的中间件才**按需 transform**：

- `.vue` → `@vitejs/plugin-vue` → 切分 `<template>` / `<script>` / `<style>`，分别编译
- `.ts` → esbuild → 转译
- `.less` → `less` → 编译

`optimizeDeps` 是唯一的预构建环节：把 CommonJS 依赖用 esbuild 打成 ESM、合并小文件、缓存到 `node_modules/.vite/`。这就是冷启动 < 100ms 的物理基础。

## 关键配置字段（按本项目实践）

### `resolve.alias`

```ts
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

`@` → `./src`。**绝对路径必须用 `fileURLToPath(new URL(...))`**，不要写死字符串，否则在 Windows / WSL / Docker 路径格式不同时会炸。

### `resolve.extensions`

```ts
resolve: {
  extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue']
}
```

写 `import Foo from '@/components/Foo'` 时按顺序匹配。**`.vue` 必须放在最后**——它会盖过同名 TS 文件导致找不到类型。

### `optimizeDeps`

```ts
optimizeDeps: {
  include: ['vue', 'vue-router'],
  exclude: ['vue-for-vue2-repl', 'vue2-repl']
}
```

- `include`：启动时强制预构建，避免首个请求卡住
- `exclude`：跳过预构建（某些 ESM-only 包预构建会报错，比如本项目里的 `vue2-repl`）

如果新增依赖后首屏白屏，先 `rm -rf node_modules/.vite` 再 `pnpm dev`。

### `defineConfig({ plugins: [...] })`

```ts
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({ imports: ['vue'], dts: 'src/types/auto-imports.d.ts' }),
    Components({ resolvers: [ElementPlusResolver()], dts: true }),
  ]
})
```

**插件顺序敏感**：通常 `vue()` 必须在前——它把 `.vue` 转 ESM，后续插件才能 import 里面的 `<script>`。

### `build.rollupOptions.output.manualChunks`

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) return 'vendor'
        if (id.includes('/components/')) return 'components'
      }
    }
  }
}
```

把第三方依赖打成一个 `vendor.js`，缓存命中率高、首屏加载快。

## 本项目对照

本仓库的 VitePress 配置见 `.vitepress/config.ts`，本质是「VitePress = Vite + Vue 3 + SSG」。其中：

- `vite.optimizeDeps.exclude: ['vue-for-vue2-repl', 'vue2-repl']` — 跳过 REPL 的预构建
- `vite.plugins: [conditionalCompilerAliasPlugin(), sidebarHMRPlugin()]` — 自定义 HMR 插件

详见 [VitePress 配置文档](/docs/tools/vitepress)。

## 常见问题排查表

| 现象 | 诊断 | 修复 |
|---|---|---|
| 启动后白屏，提示 `Failed to resolve import` | `optimizeDeps` 缓存与新装包不一致 | `rm -rf node_modules/.vite && pnpm dev` |
| `.vue` 文件 import 报「找不到模块」 | `extensions` 没包含 `.vue` | 在 `resolve.extensions` 末尾加 `.vue` |
| 生产环境 chunk 巨大 | 没切 manualChunks | 按 `manualChunks` 分 vendor |
| 环境变量在组件里是 `undefined` | 没在 `import.meta.env` 前缀 | `import.meta.env.VITE_*` 才会暴露 |
| HMR 后样式错位 | 多个 SFC `<style>` 顺序敏感 | 改成 `<style scoped>` 或提升到 CSS 文件 |

## 何时不要用 Vite

- 需要 `webpack-loader` 生态里的特定 loader（如部分老的 `vue-loader` 自定义）
- 浏览器目标 < ES2015（Vite 的 dev 假设现代浏览器）
- 极端内存敏感场景（Vite 的 transform pipeline 比 webpack 占内存）

其他场景（包含 Rspack）选型见 [构建工具对比](/docs/tools/build-tools)。

## 实战 demo 锚点

| 路径 | 演示 |
|---|---|
| [`/learning-path/ecosystem/#01.vite-sfc-on-demand`](/learning-path/ecosystem/#01.vite-sfc-on-demand) | Vite SFC 按需编译、冷启动测点 |
| [`/learning-path/ecosystem/#02.unplugin-vue-components`](/learning-path/ecosystem/#02.unplugin-vue-components) | 组件自动注册 |
| [`/learning-path/ecosystem/#12.unplugin-auto-import`](/learning-path/ecosystem/#12.unplugin-auto-import) | API 自动 import |
| [`/learning-path/ecosystem/#14.bundle-analyze`](/learning-path/ecosystem/#14.bundle-analyze) | bundle 体积分析 |

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vite 官方](https://cn.vitejs.dev/) | 中文文档 |
| [`@vitejs/plugin-vue` 源码](https://github.com/vitejs/vite-plugin-vue) | SFC 编译入口 |
| [依赖预构建原理](https://cn.vitejs.dev/guide/dep-pre-bundling.html) | esbuild + commonjs |
