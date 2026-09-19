<template>
  <div class="demo">
    <h2>三种 SSR 渲染模式对比</h2>

    <section class="card">
      <h3>① renderToString：返回完整 HTML 字符串</h3>
      <p class="hint">适合中间件缓存、CDN 边缘一次性返回。</p>
      <pre>{{ stringSample }}</pre>
    </section>

    <section class="card">
      <h3>② renderToStream：边渲染边 flush</h3>
      <p class="hint">head 部分先到浏览器，body 异步出。</p>
      <pre>{{ streamSample }}</pre>
      <ol class="seq">
        <li v-for="(line, i) in streamSequence" :key="i">
          <span class="step">{{ i + 1 }}.</span>
          <code>{{ line }}</code>
        </li>
      </ol>
    </section>

    <section class="card">
      <h3>③ renderToWebStream：Edge / Worker</h3>
      <p class="hint">无 Node 依赖的 Web Streams，Cloudflare / Deno / Bun 原生支持。</p>
      <pre>{{ webStreamSample }}</pre>
    </section>

    <section class="card">
      <h3>④ Hydration Mismatch：错误捕获策略</h3>
      <p class="hint">
        dev 默认展开详细 diff；prod 通过 <code>__VUE_PROD_HYDRATION_MISMATCH_DETAILS__</code> 开关。
      </p>
      <pre>{{ mismatchHandler }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
const stringSample = `import { renderToString } from 'vue/server-renderer'
import { createSSRApp } from 'vue'
import App from './App.vue'

const app = createSSRApp(App)
app.config.errorHandler = (err, inst, info) => {
  // 上报到 Sentry
}
const html = await renderToString(app, {
  url: '/products',
  user: { id: 42 },
})
res.status(200).setHeader('Content-Type', 'text/html').end(html)`

const streamSample = `import { renderToStream } from 'vue/server-renderer'
import { createSSRApp } from 'vue'
import App from './App.vue'

const app = createSSRApp(App)
const stream = renderToStream(app)
res.setHeader('Content-Type', 'text/html')
stream.pipe(res)             // 直接 pipe 到 HTTP 响应
// 浏览器：head 立即可解析；body 边渲染边下载
`

const webStreamSample = `import { renderToWebStream } from 'vue/server-renderer'
export default {
  async fetch(req, env) {
    const app = createSSRApp(App)
    const stream = renderToWebStream(app)
    return new Response(stream, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }
}`

const streamSequence = [
  'flush: <!DOCTYPE html><html><head>...</head>',
  'flush: <body><header>...</header>',
  'flush: <main><Suspense fallback>正在加载…</fallback></main>',
  'flush: <main>... 异步内容 resolve ...</main>',
  'flush: <footer>...</footer></body></html>',
  'end: stream closed',
]

const mismatchHandler = `// vite.config.ts
define: {
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
}

// 运行时：在 app.config.warnHandler 收集 hydration warning
app.config.warnHandler = (msg, inst, trace) => {
  if (msg.startsWith('Hydration')) {
    Sentry.captureMessage(msg, { extra: trace })
  }
}`
</script>

<style scoped>
.demo { max-width: 780px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 14px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { font-size: 12px; color: #666; margin: 0 0 10px; line-height: 1.55; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-size: 11px; line-height: 1.5; overflow: auto; max-height: 280px; }
.seq { font-size: 12px; padding-left: 24px; line-height: 1.7; }
.seq code { font-size: 11px; }
.step { display: inline-block; min-width: 24px; color: #888; }
</style>