<template>
  <div class="demo">
    <h2>createSSRApp 与 createApp</h2>

    <section class="card">
      <h3>① 同一份组件、双端复用</h3>
      <p class="hint">
        真实入口代码长这样：<code>if (import.meta.env.SSR) createSSRApp(App) else createApp(App)</code>。
        当前 REPL 是 client 模式，演示分支判断逻辑。
      </p>
      <pre>{{ entryHint }}</pre>
    </section>

    <section class="card">
      <h3>② isCustomElement：避免 SSR 解析 Web Component</h3>
      <p class="hint">
        标记 <code>&lt;my-chart&gt;</code> 为自定义元素；
        Vue 不再尝试解析、不会附加 data-v-xxx。
      </p>
      <p class="mock-tag">演示占位：&lt;my-chart data-value="100"&gt;&lt;/my-chart&gt;</p>
      <p class="meta">
        注：本组件用一个 div 占位示意。真实场景下引入第三方 web component 库即可。
      </p>
    </section>

    <section class="card">
      <h3>③ 客户端独有 API 必须守卫</h3>
      <p class="hint">
        <code>window / document / localStorage</code> 在 SSR 下不存在；
        演示 <code>import.meta.client</code> 守卫如何让编译期消除分支。
      </p>
      <ul>
        <li>当前 env: <strong>{{ env }}</strong></li>
        <li>window.innerWidth（client 模式可见）: {{ windowWidth || 'N/A' }}</li>
        <li>localStorage demoKey: {{ storageValue || 'N/A' }}</li>
      </ul>
    </section>

    <section class="card">
      <h3>④ SSR 输出预览（mock）</h3>
      <p class="hint">这里用字符串模拟 renderToString 的产物——真实跑 SSR 服务才有。</p>
      <pre>{{ ssrMock }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const env = ref('client')
const windowWidth = ref('')
const storageValue = ref('')

onMounted(() => {
  // 这是 client-only 路径
  env.value = 'client'
  windowWidth.value = String(window.innerWidth)
  storageValue.value = localStorage.getItem('demoKey') ?? ''
})

// ① 入口示意
const entryHint = `// src/main.ts（Vite + SSR 配置）
import { createApp, createSSRApp } from 'vue'
import App from './App.vue'

const app = import.meta.env.SSR
  ? createSSRApp(App)
  : createApp(App)

app.config.compilerOptions.isCustomElement =
  (tag) => tag.startsWith('my-')

if (!import.meta.env.SSR) {
  app.mount('#app')
}

// src/entry-server.ts
import { renderToString } from 'vue/server-renderer'
export const render = () => renderToString(createSSRApp(App))
`

// ④ SSR mock
const ssrMock = `<!-- 服务端 renderToString 输出 -->
<div id="app" data-v-app>
  <h1>Hello SSR</h1>
  <p>SSR 阶段：setup 内同步执行，组件树渲染为字符串。</p>
  <!-- window/document 不会被调用；toLocaleString() 等也会抛错 -->
</div>`
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 14px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { font-size: 12px; color: #666; margin: 0 0 10px; line-height: 1.55; }
.meta { font-size: 12px; color: #888; margin-top: 6px; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-size: 11px; line-height: 1.5; overflow: auto; }
ul { font-size: 13px; padding-left: 20px; margin: 6px 0; }
.mock-tag { padding: 8px 10px; background: #fff; border: 1px dashed #91caff; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 12px; }
</style>