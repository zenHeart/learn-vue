<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 单源预取</h4>
      <UserBlock :id="1" />
      <p class="hint">组件内部 onServerPrefetch(async () =&gt; fetch('/api/...'))</p>
    </section>

    <section class="card">
      <h4>② 多源并行 + 全部 resolve 后再渲染</h4>
      <ProfileBlock :id="2" />
      <p class="hint">三个 hook 同时注册，等所有 Promise 完成后渲染</p>
    </section>

    <section class="card">
      <h4>③ 错误传播：拒绝会让整次 SSR 失败</h4>
      <FailingBlock :id="3" />
      <p class="hint">hook 抛错需要在内部 try/catch —— 否则 SSR 返回 500</p>
    </section>

    <section class="card">
      <h4>④ SSR 等待耗时可视化</h4>
      <p>单 hook 平均耗时: <strong>{{ singleLatency }}ms</strong></p>
      <p>并行三 hook 总耗时: <strong>{{ parallelLatency }}ms</strong></p>
      <p class="hint">Promise.all 让多源并行；总耗时取决于最慢那一条</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onServerPrefetch } from 'vue'
import UserBlock from './UserBlock.vue'
import ProfileBlock from './ProfileBlock.vue'
import FailingBlock from './FailingBlock.vue'

const title = ref('onServerPrefetch 完整 SSR 数据预取')

/* === ④ 等待耗时可视化 === */
const singleLatency = ref(0)
const parallelLatency = ref(0)

async function fakeApi(latencyMs: number, payload: unknown): Promise<unknown> {
  await new Promise(r => setTimeout(r, latencyMs))
  return payload
}

onServerPrefetch(async () => {
  const t0 = performance.now()
  await fakeApi(80, { ok: true })
  singleLatency.value = Math.round(performance.now() - t0)
})

onServerPrefetch(async () => {
  const t0 = performance.now()
  await Promise.all([
    fakeApi(60, { a: 1 }),
    fakeApi(90, { b: 2 }),
    fakeApi(120, { c: 3 }),
  ])
  parallelLatency.value = Math.round(performance.now() - t0)
})
</script>

<style scoped>
.demo {
  max-width: 820px;
  margin: 16px auto;
  padding: 16px;
  color: #213547;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.card {
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #1e293b;
}
.hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: #64748b;
}
</style>