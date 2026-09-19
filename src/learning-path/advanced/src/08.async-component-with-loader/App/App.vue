<template>
  <div class="demo">
    <h2>defineAsyncComponent 完整选项</h2>

    <section class="card">
      <h3>1. 基础 loader + loadingComponent</h3>
      <button @click="show1 = !show1">切换显示</button>
      <div class="wrap" v-if="show1">
        <AsyncChart />
      </div>
    </section>

    <section class="card">
      <h3>2. delay + errorComponent + timeout</h3>
      <button @click="show2 = !show2">切换显示 (会失败)</button>
      <div class="wrap" v-if="show2">
        <AsyncBroken />
      </div>
    </section>

    <section class="card">
      <h3>3. onError retry 机制</h3>
      <button @click="show3 = !show3">切换显示</button>
      <p>attempts 计数: {{ attempts }}</p>
      <div class="wrap" v-if="show3">
        <AsyncRetry />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import Loading from './Loading.vue'
import ErrorPanel from './ErrorPanel.vue'

const attempts = ref(0)

const AsyncChart = defineAsyncComponent({
  loader: () => new Promise<{ default: typeof Loading }>((resolve) => {
    setTimeout(() => resolve({ default: Loading }), 1500)
  }),
  loadingComponent: { template: '<div class="loading">加载中...</div>' },
  delay: 200,
})

const AsyncBroken = defineAsyncComponent({
  loader: () => new Promise((_, reject) => {
    // 模拟加载失败
    setTimeout(() => reject(new Error('chunk 404')), 500)
  }),
  errorComponent: ErrorPanel,
  timeout: 2000,
})

const AsyncRetry = defineAsyncComponent({
  loader: () => new Promise<{ default: typeof Loading }>((resolve, reject) => {
    attempts.value++
    if (attempts.value < 3) {
      setTimeout(() => reject(new Error(`fail ${attempts.value}`)), 300)
    } else {
      setTimeout(() => resolve({ default: Loading }), 300)
    }
  }),
  loadingComponent: { template: '<div class="loading">loading...</div>' },
  errorComponent: ErrorPanel,
  delay: 100,
  onError(_err, retry, _fail, _attempts) {
    setTimeout(retry, 500)
  },
})

const show1 = ref(false)
const show2 = ref(false)
const show3 = ref(false)
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
.wrap { margin-top: 8px; padding: 8px; background: #fff; border-radius: 4px; min-height: 60px; }
.loading { padding: 16px; text-align: center; color: #888; }
</style>
