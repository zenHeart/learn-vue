<template>
  <div class="demo">
    <h3>createSSRApp 与 createApp 的区别</h3>

    <section class="card">
      <h4>① 入口分支判断</h4>
      <p class="hint">服务端渲染入口导出 <code>render</code>，客户端入口调用 <code>mount</code>。</p>
      <pre>{{ entryHint }}</pre>
    </section>

    <section class="card">
      <h4>② isCustomElement：识别 Web Component</h4>
      <p class="hint">Vue 看到 <code>&lt;my-chart&gt;</code> 不再解析其属性、不附加 scoped CSS。</p>
      <p class="meta">本 REPL 用 <code>&lt;div class="mock-tag"&gt;</code> 模拟第三方标签。</p>
      <div class="mock-tag">&lt;my-chart data-value="100"&gt;&lt;/my-chart&gt;</div>
    </section>

    <section class="card">
      <h4>③ SSR 与 CSR 输出对比</h4>
      <p class="hint"><code>createSSRApp</code> 走 hydration；<code>createApp</code> 走 mount。</p>
      <ul>
        <li>当前实例类型：<strong>{{ instanceKind }}</strong></li>
        <li>是否带 <code>_context.ctx</code>：{{ hasSSRCtx }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue'

const instanceKind = ref('createApp')
const hasSSRCtx = ref('否（仅 createSSRApp 实例有）')

onMounted(() => {
  // 演示用：探测当前实例是否为 SSRApp
  const inst = getCurrentInstance()
  const ctx = (inst?.appContext.app as any)._context?.ctx
  if (ctx) {
    instanceKind.value = 'createSSRApp'
    hasSSRCtx.value = '是'
  }
})

const entryHint = `// src/entry-client.ts
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')

// src/entry-server.ts
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
export const render = () => renderToString(createSSRApp(App))

// isCustomElement 配置
import { createApp } from 'vue'
const app = createApp(App)
app.config.compilerOptions.isCustomElement = (tag) =>
  tag.startsWith('my-')
`
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h4 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { font-size: 12px; color: #666; margin: 0 0 8px; line-height: 1.5; }
.meta { font-size: 12px; color: #888; margin: 4px 0; }
.mock-tag {
  padding: 8px 12px;
  background: #fff;
  border: 1px dashed #91caff;
  border-radius: 4px;
  font-family: ui-monospace, monospace;
  font-size: 12px;
  color: #555;
}
code { background: #f1f5f9; padding: 1px 5px; border-radius: 3px; font-size: 12px; }
pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 10px;
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.55;
  overflow: auto;
  margin: 0;
}
ul { font-size: 13px; padding-left: 20px; margin: 6px 0; }
</style>