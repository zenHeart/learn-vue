<template>
  <div class="demo">
    <h2>SSR Hydration Mismatch 排查</h2>

    <section class="card">
      <h3>① 时间戳 mismatch（最常见）</h3>
      <p class="hint">
        <code>new Date().toLocaleString()</code> 在两端不同步：
        服务端 locale 通常是 C、客户端跟随 OS。
      </p>
      <div class="mismatch-block">
        <p>原始（会触发警告）：</p>
        <pre>当前时间：{{ rawNow }}</pre>
        <p class="warn">⚠ SSR 输出：「2026/1/1 08:00:00」/ Client：「2026/1/1 00:00:00」</p>
      </div>
      <p class="ok">
        修复方案 1：data-allow-mismatch="text" →
        <time :datetime="iso" data-allow-mismatch="text">{{ formattedNow }}</time>
      </p>
      <p class="ok">
        修复方案 2：用固定 ISO + 客户端 only 渲染 →
        <ClientOnly>
          <span>{{ liveNow }}</span>
        </ClientOnly>
      </p>
    </section>

    <section class="card">
      <h3>② class 来自浏览器 hash（hash 不在 SSR 阶段）</h3>
      <p class="hint">
        服务端 hash 永远是空，客户端 hydrate 后才赋值。
      </p>
      <pre>{{ hashSnippet }}</pre>
      <p class="ok">
        修复：data-allow-mismatch="class" +
        让「active class」逻辑运行在 <code>import.meta.client</code> 守卫内。
      </p>
    </section>

    <section class="card">
      <h3>③ 收集 hydration warning：app.config.warnHandler</h3>
      <p class="hint">
        prod 下默认不打印 hydration 详情；用 warnHandler 上报到 Sentry / 自建监控。
      </p>
      <pre>{{ warnHandlerSnippet }}</pre>
    </section>

    <section class="card">
      <h3>④ 排查清单</h3>
      <ol class="checklist">
        <li>是否使用 <code>new Date() / Math.random()</code>？</li>
        <li>是否依赖 <code>window / document / localStorage</code>？</li>
        <li>HTML 嵌套：block 元素嵌套在 inline（<code>&lt;p&gt;&lt;div&gt;</code>）</li>
        <li>两端 vue 版本是否一致？</li>
        <li>TZ / locale 配置？</li>
        <li>是否需要 <code>data-allow-mismatch</code> 显式放行？</li>
      </ol>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ClientOnly from './ClientOnly.vue'

// 演示用：直接在 client 端赋值（不会真正触发 SSR warning，
// REPL 是 client 模式；这里是教学文本演示）
const rawNow = ref('2026/1/1 08:00:00')
const iso = '2026-01-01T00:00:00Z'
const formattedNow = ref('2026/1/1 08:00:00')
const liveNow = ref('')

onMounted(() => {
  liveNow.value = new Date().toLocaleString()
  // 模拟真实 hydration mismatch：
  rawNow.value = new Date().toLocaleString()    // 服务端是 '08:00:00'（C locale）
  formattedNow.value = new Date(iso).toLocaleString()
})

const hashSnippet = `<template>
  <a :class="{ active: route.hash === '#foo' }">Foo</a>
</template>

<script setup>
// 服务端 route.hash 是空的；客户端 hydrate 时是 '#foo'
// 修复：
const isActive = ref(false)
onMounted(() => {
  isActive.value = window.location.hash === '#foo'
})
</script>

<a :class="{ active: isActive }" data-allow-mismatch="class">Foo</a>`

const warnHandlerSnippet = `// main.ts
import { createSSRApp } from 'vue'
import App from './App.vue'

const app = createSSRApp(App)

app.config.warnHandler = (msg, instance, trace) => {
  // 只关心 hydration warning
  if (msg.includes('Hydration')) {
    Sentry.captureMessage(msg, {
      level: 'warning',
      extra: {
        trace,
        componentName: instance?.type.name,
        url: window.location.href,
      },
    })
  }
  // dev 环境照常 console.warn
  if (import.meta.env.DEV) {
    console.warn('[Vue warn]', msg, trace)
  }
}`
</script>

<style scoped>
.demo { max-width: 800px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 14px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { font-size: 12px; color: #666; margin: 0 0 10px; line-height: 1.55; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-size: 11px; line-height: 1.5; overflow: auto; max-height: 260px; }
.mismatch-block { padding: 10px; background: #fff; border: 1px dashed #f59f00; border-radius: 6px; margin-bottom: 10px; }
.warn { color: #c92a2a; font-size: 12px; }
.ok { color: #18a058; font-size: 13px; margin: 6px 0; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.checklist { font-size: 13px; padding-left: 20px; line-height: 1.8; }
</style>