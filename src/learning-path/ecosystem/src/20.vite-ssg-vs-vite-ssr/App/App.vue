<script setup>
import { ref } from 'vue'

const mode = ref('ssg')

// 模拟 SSG 产物：构建期生成
const ssgOutput = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>我的文档站 — 构建期快照</title>
  <link rel="stylesheet" href="/assets/index-abc123.css">
</head>
<body>
  <div id="app">
    <header><h1>我的文档站</h1></header>
    <main>
      <h2>欢迎</h2>
      <p>这是构建时（build at 2026-09-19 03:42 UTC）渲染的快照。</p>
    </main>
  </div>
  <script type="module" src="/assets/index-def456.js"></script>
</body>
</html>`

// 模拟手写 SSR 产物：请求时生成
const ssrOutput = (path) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>实时内容 — ${path}</title>
</head>
<body>
  <div id="app">
    <p>当前用户: ${path === '/me' ? '已登录' : '游客'}</p>
    <p>服务器时间: ${new Date().toISOString()}</p>
  </div>
</body>
</html>`

// 路由 / hydration 标记
const hydrationNote = ref('')

function onHydrate() {
  hydrationNote.value = '✓ 客户端 hydrate 完成；事件、路由、状态已激活'
}

const ssrRoutes = ['/', '/about', '/docs/getting-started']
</script>

<template>
  <div class="card">
    <h2>vite-ssg vs 手写 SSR</h2>
    <p class="hint">
      <strong>vite-ssg</strong> = 构建期一次性预渲染，部署为静态文件。<br>
      <strong>手写 SSR</strong> = Node 服务对每个请求实时渲染。
    </p>

    <div class="tabs">
      <button :class="{ active: mode === 'ssg' }" @click="mode = 'ssg'">SSG（构建时）</button>
      <button :class="{ active: mode === 'ssr' }" @click="mode = 'ssr'">SSR（请求时）</button>
    </div>

    <section v-if="mode === 'ssg'">
      <h3>vite-ssg 产物（dist/）</h3>
      <ul class="routes">
        <li v-for="r in ssrRoutes" :key="r"><code>{{ r === '/' ? '/index.html' : r + '/index.html' }}</code></li>
      </ul>
      <h4>示例：<code>/index.html</code></h4>
      <pre>{{ ssgOutput }}</pre>
      <p class="note">部署：<code>dist/</code> → 上传到 CDN / Nginx / OSS，<strong>0 Node 进程</strong>。</p>
    </section>

    <section v-else>
      <h3>手写 SSR（Node server）</h3>
      <p class="note">每个 HTTP 请求实时调 <code>renderToString(app)</code>。</p>
      <h4>模拟响应（路径：<code>/me</code>）</h4>
      <pre>{{ ssrOutput('/me') }}</pre>
      <p class="warn">⚠ 部署：需要 Node 进程常驻；不能直接上 CDN。</p>
    </section>

    <h3>Hydration 行为</h3>
    <p class="meta">
      不论 SSG 还是 SSR，浏览器加载 HTML 后都会跑同一份 <code>main.js</code>：
      找到 <code>#app</code> 容器 → 比对 DOM → 挂载 Vue 实例。
    </p>
    <button class="primary" @click="onHydrate">模拟 hydrate</button>
    <p v-if="hydrationNote" class="ok">{{ hydrationNote }}</p>

    <h3>选型决策</h3>
    <table class="table">
      <thead>
        <tr><th>场景</th><th>推荐</th></tr>
      </thead>
      <tbody>
        <tr><td>博客 / 文档站 / 落地页</td><td>SSG</td></tr>
        <tr><td>电商商品页（数据有更新但用户能接受分钟级延迟）</td><td>SSG + ISR</td></tr>
        <tr><td>登录后内容 / 实时数据</td><td>手写 SSR / Nuxt</td></tr>
        <tr><td>混合（公开页 SSG，私有路由 SSR）</td><td>Nuxt</td></tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 560px; }
.card h2 { margin: 0 0 6px; font-size: 1rem; }
.card h3 { margin: 14px 0 6px; font-size: 0.92rem; color: #35495e; }
.card h4 { margin: 8px 0 4px; font-size: 0.82rem; color: #666; }
.hint { font-size: 0.78rem; color: #666; margin: 0 0 10px; line-height: 1.55; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.78rem; }
.tabs { display: flex; gap: 4px; margin-bottom: 12px; }
.tabs button { flex: 1; padding: 6px 8px; border: 1px solid #ccc; background: #fff; border-radius: 6px; cursor: pointer; font-size: 0.82rem; }
.tabs button.active { background: #42b883; color: #fff; border-color: #42b883; }
section { padding: 10px; background: #f6f8fa; border-radius: 8px; margin-bottom: 12px; }
.routes { font-family: ui-monospace, monospace; font-size: 0.78rem; padding-left: 20px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 8px 10px; border-radius: 6px; font-size: 0.72rem; line-height: 1.55; overflow-x: auto; margin: 6px 0; max-height: 200px; overflow-y: auto; }
.note, .warn, .ok, .meta { font-size: 0.78rem; padding: 6px 10px; border-radius: 6px; }
.note { background: #f0f9eb; color: #18a058; }
.warn { background: #fff7ed; color: #b45309; }
.ok { background: #f0fdf4; color: #18a058; border-left: 3px solid #42b883; }
.meta { color: #666; margin: 6px 0; }
button.primary { background: #42b883; color: #fff; border: 0; padding: 5px 14px; border-radius: 6px; cursor: pointer; font-size: 0.82rem; }
.table { width: 100%; border-collapse: collapse; font-size: 0.78rem; margin-top: 8px; }
.table th { text-align: left; color: #888; font-weight: 500; padding: 4px 6px; border-bottom: 1px solid #eee; }
.table td { padding: 4px 6px; border-bottom: 1px solid #f1f5f9; }
</style>
