<template>
  <div class="demo">
    <h3>15 · defineAsyncComponent 三阶段</h3>

    <section class="card">
      <h4>① 基础：delay=300 → loadingComponent → success</h4>
      <button @click="show1 = !show1">toggle (慢速加载)</button>
      <component :is="show1 ? AsyncSlow : null" v-if="show1" />
    </section>

    <section class="card">
      <h4>② errorComponent + timeout</h4>
      <button @click="show2 = !show2">toggle (会失败)</button>
      <Suspense v-if="show2">
        <AsyncBroken v-if="show2" />
        <template #fallback><div class="loading">Suspense fallback...</div></template>
      </Suspense>
      <p class="hint">suspensible=true 时，Suspense 的 fallback 会取代 loadingComponent。</p>
    </section>

    <section class="card">
      <h4>③ onError retry 链（attempts 计数）</h4>
      <button @click="show3 = !show3">toggle (retry)</button>
      <p>当前 attempts = <strong>{{ attempts }}</strong></p>
      <AsyncRetry v-if="show3" />
      <p class="hint">前 2 次 loader 拒绝，第 3 次成功；onError 内 setTimeout(retry, 300)。</p>
    </section>

    <section class="card">
      <h4>④ suspensible: false 强制走 loadingComponent</h4>
      <button @click="show4 = !show4">toggle (suspensible:false)</button>
      <Suspense v-if="show4">
        <AsyncNonSuspensible v-if="show4" />
        <template #fallback><div class="loading">Suspense fallback（应被忽略）</div></template>
      </Suspense>
    </section>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import Loading from './Loading.vue'
import Error from './Error.vue'

const show1 = ref(false)
const show2 = ref(false)
const show3 = ref(false)
const show4 = ref(false)

const attempts = ref(0)

const AsyncSlow = defineAsyncComponent({
  loader: () => new Promise<{ default: typeof Loading }>((r) =>
    setTimeout(() => r({ default: Loading }), 1200),
  ),
  loadingComponent: Loading,
  delay: 300,
})

const AsyncBroken = defineAsyncComponent({
  loader: () => new Promise((_, reject) =>
    setTimeout(() => reject(new Error('chunk 404')), 600),
  ),
  errorComponent: Error,
  timeout: 2000,
  suspensible: true,
})

const AsyncRetry = defineAsyncComponent({
  loader: () => new Promise<{ default: typeof Loading }>((resolve, reject) => {
    attempts.value++
    if (attempts.value < 3) {
      setTimeout(() => reject(new Error(`attempt ${attempts.value}`)), 200)
    } else {
      setTimeout(() => resolve({ default: Loading }), 200)
    }
  }),
  loadingComponent: Loading,
  errorComponent: Error,
  delay: 100,
  onError(_e, retry, _fail, _n) {
    setTimeout(retry, 300)
  },
})

const AsyncNonSuspensible = defineAsyncComponent({
  loader: () => new Promise<{ default: typeof Loading }>((r) =>
    setTimeout(() => r({ default: Loading }), 1200),
  ),
  loadingComponent: Loading,
  delay: 300,
  suspensible: false,   // 强制走 loadingComponent 路径
})
</script>

<style scoped>
.demo { padding: 1rem; font-family: system-ui; }
.card { padding: 10px; margin: 8px 0; background: #fafafa; border: 1px solid #e5e5e5; border-radius: 6px; }
.card h4 { margin: 0 0 6px; font-size: 13px; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; margin-right: 6px; }
.hint { color: #888; font-size: 12px; margin-top: 4px; }
.loading { padding: 12px; background: #f0f5ff; border: 1px dashed #adc6ff; border-radius: 4px; }
</style>
