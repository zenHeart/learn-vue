<template>
  <div class="demo">
    <h2>Vite + vite-plugin-vue SSR 配置</h2>

    <section class="card">
      <h3>① vite.config.ts</h3>
      <pre>{{ viteConfig }}</pre>
    </section>

    <section class="card">
      <h3>② 双入口：entry-client + entry-server</h3>
      <pre>{{ clientEntry }}</pre>
      <pre>{{ serverEntry }}</pre>
    </section>

    <section class="card">
      <h3>③ Express 服务：template + ssr-manifest</h3>
      <pre>{{ expressServer }}</pre>
    </section>

    <section class="card">
      <h3>④ 关键开关一览</h3>
      <table class="t">
        <thead>
          <tr><th>配置</th><th>作用</th></tr>
        </thead>
        <tbody>
          <tr><td><code>build.rollupOptions.input</code></td><td>声明双入口</td></tr>
          <tr><td><code>ssr.noExternal</code></td><td>第三方包打进 server bundle</td></tr>
          <tr><td><code>ssr.target: 'node'</code></td><td>server build target</td></tr>
          <tr><td><code>resolve.conditions</code></td><td>3.5+ 强制指定条件</td></tr>
          <tr><td><code>import.meta.env.SSR</code></td><td>Vite build 时替换为字面量</td></tr>
          <tr><td><code>__VUE_PROD_HYDRATION_MISMATCH_DETAILS__</code></td><td>生产是否打印 mismatch 详情</td></tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <h3>⑤ 输出目录结构</h3>
      <pre>{{ outputTree }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
const viteConfig = `// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        client: 'src/entry-client.ts',
        server: 'src/entry-server.ts',
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  ssr: {
    noExternal: ['my-ui-lib'],
    target: 'node',
  },
  resolve: {
    conditions: ['node', 'import', 'module'],
  },
})
`

const clientEntry = `// src/entry-client.ts
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`

const serverEntry = `// src/entry-server.ts
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'

export function render() {
  const app = createSSRApp(App)
  return renderToString(app)
}
`

const expressServer = `// server.js（Express）
import express from 'express'
import fs from 'node:fs/promises'
import { render } from './dist/server/entry-server.js'
import manifest from './dist/client/ssr-manifest.json' assert { type: 'json' }

const app = express()
app.use('/assets', express.static('dist/client/assets'))

app.get('*', async (req, res) => {
  try {
    const appHtml = await render(req.url)
    const template = await fs.readFile('./dist/client/index.html', 'utf-8')
    const html = template.replace('<!--ssr-outlet-->', appHtml)
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (err) {
    res.status(500).end(err.stack)
  }
})

app.listen(3000)
`

const outputTree = `dist/
├── client/
│   ├── index.html
│   ├── assets/
│   │   ├── client-abc123.js
│   │   ├── client-def456.css
│   │   └── ...
│   └── ssr-manifest.json
└── server/
    ├── entry-server.js
    └── chunks/
        ├── dep-xyz789.js
        └── ...`
</script>

<style scoped>
.demo { max-width: 820px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 14px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-size: 11px; line-height: 1.5; overflow: auto; max-height: 320px; }
.t { width: 100%; border-collapse: collapse; font-size: 12px; }
.t th, .t td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #e5e5e5; }
.t th { color: #666; font-weight: 500; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
</style>