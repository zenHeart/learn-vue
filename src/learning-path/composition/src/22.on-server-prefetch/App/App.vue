<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 模拟 SSR：onServerPrefetch 阻塞渲染</h4>
      <p>当前状态：<strong>{{ phase }}</strong></p>
      <button @click="simulateSSR" :disabled="running">模拟一次 SSR 渲染</button>
      <button @click="reset">重置</button>
    </section>

    <section class="card">
      <h4>② 并行预取：两个独立请求</h4>
      <p>用户：{{ user.name }} / {{ user.role }}</p>
      <p>项目：{{ projects.length }} 个</p>
      <p>单次 fetch 耗时：{{ duration }} ms</p>
    </section>

    <section class="card">
      <h4>③ 错误捕获：预取失败时的渲染</h4>
      <button @click="simulateError">触发预取失败</button>
      <pre>{{ errorLog }}</pre>
    </section>
  </div>
</template>

<script setup>
import { ref, onServerPrefetch } from 'vue'

const title = ref('onServerPrefetch：SSR 数据预取')

const user = ref({ name: '', role: '' })
const projects = ref([])
const duration = ref(0)
const phase = ref('idle')
const running = ref(false)

function fakeFetch(payload, ms) {
  return new Promise(r => setTimeout(() => r(payload), ms))
}

onServerPrefetch(async () => {
  // 多个 fetch 并行
  const t0 = Date.now()
  const [u, ps] = await Promise.all([
    fakeFetch({ name: 'cheng', role: 'admin' }, 80),
    fakeFetch([{ id: 1 }, { id: 2 }, { id: 3 }], 120),
  ])
  user.value = u
  projects.value = ps
  duration.value = Date.now() - t0
})

async function simulateSSR() {
  running.value = true
  phase.value = 'rendering (onServerPrefetch running...)'
  // 手动模拟一次服务端渲染阻塞：直接执行同一组数据预取
  const t0 = Date.now()
  const [u, ps] = await Promise.all([
    fakeFetch({ name: 'cheng', role: 'admin' }, 80),
    fakeFetch([{ id: 1 }, { id: 2 }, { id: 3 }], 120),
  ])
  user.value = u
  projects.value = ps
  duration.value = Date.now() - t0
  phase.value = 'done (HTML serialized)'
  running.value = false
}

function reset() {
  user.value = { name: '', role: '' }
  projects.value = []
  duration.value = 0
  phase.value = 'idle'
}

const errorLog = ref('')
async function simulateError() {
  errorLog.value = ''
  try {
    await onServerPrefetchTry()
  } catch (e) {
    errorLog.value = `caught: ${e.message}\n`
  }
}
async function onServerPrefetchTry() {
  // 模拟预取失败
  await Promise.reject(new Error('fetch 500'))
}
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 720px;
}
.card {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 10px;
  margin: 10px 0;
  background: #fff;
}
button { padding: 4px 10px; margin-right: 4px; }
pre { background: #f6f8fa; padding: 6px; font-size: 12px; }
</style>
