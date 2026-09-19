<template>
  <div class="demo">
    <h2>useSSRContext()</h2>

    <section class="card">
      <h3>① client 端：useSSRContext() 返回 undefined</h3>
      <p class="hint">REPL 是 client 模式，setup 同步上下文里调用一次。</p>
      <p>类型：<code>{{ ssrType }}</code></p>
      <p>值：<code>{{ ssrString }}</code></p>
    </section>

    <section class="card">
      <h3>② onMounted 内：永远 undefined</h3>
      <p class="hint">setup 只在 mount 之前执行一次；onMounted 已经进入 client 路径。</p>
      <p>mounted 阶段检测：<code>{{ mountedType }}</code></p>
    </section>

    <section class="card">
      <h3>③ import.meta.client：编译期消除</h3>
      <p class="hint">编译时会被替换成字面量 <code>true</code> / <code>false</code>，死代码消除。</p>
      <p>env = <strong>{{ env }}</strong></p>
      <p>{{ branchResult }}</p>
    </section>

    <section class="card">
      <h3>④ SSR 模拟：模拟 ctx 注入</h3>
      <p class="hint">
        真实 SSR 环境下 <code>useSSRContext()</code> 拿到 <code>renderToString</code> 第二个参数。
        这里用一个 fallback 模拟 ctx：
      </p>
      <ul>
        <li>URL：<code>{{ ctxUrl }}</code></li>
        <li>User-Agent：<code>{{ ctxUa }}</code></li>
      </ul>
      <p class="meta">
        在 SSR build 里，组件 setup 会拿到真实 ctx；
        这里是 client 演示，所以走 fallback 路径。
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, useSSRContext, onMounted } from 'vue'

// ① 同步 setup
const ctx = useSSRContext()
const ssrType = ref(typeof ctx)
const ssrString = ref(JSON.stringify(ctx))

// ② onMounted
const mountedType = ref('(pending)')
onMounted(() => {
  const c = useSSRContext()
  mountedType.value = typeof c   // 永远是 'undefined'
})

// ③ import.meta.client
const env = ref('client')
const branchResult = ref('')
if (import.meta.client) {
  branchResult.value = 'client 分支（编译期替换为 true）'
} else {
  branchResult.value = 'server 分支（编译期替换为 false）'
}

// ④ SSR fallback
const ctxUrl = ref('(fallback)')
const ctxUa = ref('(fallback)')
const ctxObj: any = ctx ?? { url: '/mock', ua: 'curl/8.x (mock fallback)' }
ctxUrl.value = ctxObj.url
ctxUa.value = ctxObj.ua
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 14px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { font-size: 12px; color: #666; margin: 0 0 10px; line-height: 1.55; }
.meta { font-size: 12px; color: #888; margin-top: 6px; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
ul { font-size: 13px; padding-left: 20px; margin: 6px 0; }
</style>