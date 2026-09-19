<template>
  <section class="r22">
    <h2>SSR 响应式陷阱与隔离模式</h2>

    <p class="note">
      本 demo 在浏览器环境运行，但演示了 SSR 常见的 4 个陷阱的概念模型。打开控制台查看日志。
    </p>

    <div class="card danger">
      <h3>❌ 反例：模块级 ref（跨请求共享）</h3>
      <p>服务器上：每次请求会修改同一个 counter，下一个请求会看到上一次的脏值</p>
      <button @click="sharedCounter.value++">共享 counter++</button>
      <p>当前值: {{ sharedCounter.value }}</p>
      <pre>{{ requestLog }}</pre>
    </div>

    <div class="card ok">
      <h3>✅ 正例：每请求 effectScope</h3>
      <p>使用 createRequestScope 创建独立响应式空间，结束时 scope.stop()</p>
      <button @click="simulateRequest('A')">模拟请求 A</button>
      <button @click="simulateRequest('B')">模拟请求 B</button>
    </div>

    <div class="card warn">
      <h3>⚠️ Hydration mismatch 演示</h3>
      <p>服务端和客户端若输出不同的随机数 / 时间，会触发 hydration mismatch 警告</p>
      <p>本次 SSR 输出: {{ ssrSnapshot }}</p>
      <p>本次 CSR 输出: {{ csrSnapshot }}</p>
      <p v-if="mismatch" style="color: red">不匹配！真实 SSR 中这里会出现控制台警告</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, effectScope } from 'vue'

/* === ❶ 模块级 ref（危险） === */
const sharedCounter = ref(0)
const requestLog = ref<string[]>([])
// 模拟两个"请求"先后访问
;[1].forEach(() => {
  // 不真正模拟，仅作为视觉提示
})
function bumpShared() {
  sharedCounter.value++
  requestLog.value.push(`request @ ${Date.now()}: sharedCounter=${sharedCounter.value}`)
}

/* === ② 每请求 effectScope === */
function simulateRequest(name: string) {
  const scope = effectScope()
  scope.run(() => {
    const localCounter = ref(0)
    // 模拟请求过程中多次修改
    localCounter.value = Math.floor(Math.random() * 100)
    // 结束后立即清理
    scope.stop()
  })
  console.log(`[SSR] request ${name} finished, scope disposed`)
}

/* === ③ Hydration mismatch === */
const ssrSnapshot = ref(Math.random().toString(36).slice(2, 8))
const csrSnapshot = ref('')
const mismatch = ref(false)
onMounted(() => {
  csrSnapshot.value = Math.random().toString(36).slice(2, 8)
  mismatch.value = ssrSnapshot.value !== csrSnapshot.value
})

import { onMounted } from 'vue'
</script>

<style scoped>
.r22 { font-family: system-ui; padding: 1rem; }
.r22 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r22 .card.danger { border-color: #e08585; background: #fff5f5; }
.r22 .card.ok { border-color: #6ec06e; background: #f5fff5; }
.r22 .card.warn { border-color: #d6a55f; background: #fffaf0; }
.r22 button { margin-right: 0.4rem; }
.r22 pre { background: #f6f8fa; padding: 0.4rem; font-size: 12px; max-height: 120px; overflow: auto; }
.r22 .note { color: #555; }
</style>
