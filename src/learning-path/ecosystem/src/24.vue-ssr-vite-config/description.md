> **版本**：Vue 3.5+ / Vite 5+ / vite-plugin-vue 5+ | **状态**：stable | **延伸阅读**：[Vite SSR](https://cn.vitejs.dev/guide/ssr.html)

# Vite + vite-plugin-vue 完整 SSR 配置

## 这是什么

生产级 Vue 3 SSR 至少需要四份配置：

1. **`vite.config.ts`**：声明 `ssr.noExternal`、`build.ssr`、`resolve.conditions`，区分 client / server 入口。
2. **`entry-client.ts`**：客户端入口（`createApp` + `mount`）。
3. **`entry-server.ts`**：服务端入口（`createSSRApp` + `renderToString`）。
4. **Express / Nitro / Hono 服务**：根据 URL 选择 SSR 或 SPA fallback。

Vite 的 `loadEnv` 与 `defineConfig` 让双端共享配置：`process.env.NODE_ENV` 在两端都可用；`import.meta.env.SSR` 由 Vite 在 ssr build 时替换为 `true`。

## 源码走读（最小可用骨架）

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        // 双入口
        client: 'src/entry-client.ts',
        server: 'src/entry-server.ts',
      },
      output: {
        // 用 entry name 做 chunk 前缀
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  ssr: {
    // 不把 vue / vue-router 打进 bundle（走外部依赖）
    noExternal: ['my-ui-lib'],
    // server build 用 [node, import] conditions
    target: 'node',
  },
})
```

```ts
// src/entry-client.ts
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

```ts
// src/entry-server.ts
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'

export function render() {
  const app = createSSRApp(App)
  return renderToString(app)
}
```

```ts
// server.js（Express）
import express from 'express'
import { render } from './dist/server/entry-server.js'
import manifest from './dist/client/ssr-manifest.json' assert { type: 'json' }

const app = express()
app.use('/assets', express.static('dist/client/assets'))

app.get('*', async (req, res) => {
  const html = await render()
  const template = await fs.readFile('./dist/client/index.html', 'utf-8')
  res.send(template.replace('<!--ssr-outlet-->', html))
})
app.listen(3000)
```

## 实战场景

1. **自建 SSR**：对配置有完整掌控；适合中型项目和需要边缘部署的场景。
2. **多入口构建**：`vite build` 一次产出 client bundle + server bundle，**输出到不同目录**。
3. **client manifest**：SSR 时把已 hash 的 chunk 文件名注入模板，保证 hydration 时路径一致。

## 常见踩坑

- **`createApp` vs `createSSRApp` 必须分开文件**：同一文件同时引两者会让 client 端带上 server-renderer 体积。
- **`vue/server-renderer` 不能在 client bundle 里**：Vite 通过入口检测自动 external，但仍要确保只在 entry-server 里 import。
- **CSS 注入顺序**：SSR 时 `<style>` 直接 inline 到 HTML 头；client 端 hydration 时 Vue 会再次插入，可能产生「闪烁」。
- **`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__`**：build 时通过 `define` 注入；详见 `ecosystem/23.ssr-render-to-string`。
- **`resolve.conditions`**：3.5+ 需要显式声明 `['node', 'import', 'module']`，否则 server bundle 找不到正确的 vue 入口。
- **`ssr.noExternal`**：把第三方 ESM 包打进 server bundle 通常更稳；只在「包有副作用 / 用 CJS」时改用 external。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vite SSR 官方](https://cn.vitejs.dev/guide/ssr.html) | 完整配置流程 |
| [vite-plugin-vue](https://github.com/vitejs/vite-plugin-vue) | SFC 编译插件 |
| [Nuxt 3](https://nuxt.com/) | 上层封装——vite-plugin-vue + Nitro + 约定路由 |
| [vite-ssg](https://github.com/antfu/vite-ssg) | SSG 简化版——构建期预渲染 |