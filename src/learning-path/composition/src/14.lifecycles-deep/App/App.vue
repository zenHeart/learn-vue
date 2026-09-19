<template>
  <div class="demo">
    <h2>组合式 API 全生命周期</h2>

    <section class="card">
      <h3>1. 基础生命周期</h3>
      <BasicDemo :n="basicN" />
      <button @click="basicN++">count++ 触发 onBeforeUpdate / onUpdated</button>
    </section>

    <section class="card">
      <h3>2. 错误捕获 + 渲染追踪（开发模式）</h3>
      <button @click="throwError">触发子组件错误</button>
      <ErrorBoundary>
        <BuggyChild v-if="showBug" />
      </ErrorBoundary>
    </section>

    <section class="card">
      <h3>3. KeepAlive 激活/停用</h3>
      <button @click="toggleKeep">切换 keep 组件</button>
      <KeepAlive>
        <KeptChild v-if="showKeep" />
      </KeepAlive>
    </section>

    <section class="card">
      <h3>4. onServerPrefetch 钩子 (SSR 占位)</h3>
      <pre>{{ ssrLog }}</pre>
      <p class="hint">在浏览器中此钩子不会执行，但 dev 工具会标记</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onServerPrefetch } from 'vue'
import BasicDemo from './BasicDemo.vue'
import ErrorBoundary from './ErrorBoundary.vue'
import BuggyChild from './BuggyChild.vue'
import KeptChild from './KeptChild.vue'

const basicN = ref(0)
const showBug = ref(true)
const showKeep = ref(true)
const ssrLog = ref<string[]>([])

const throwError = () => {
  // 不在这里抛，让子组件内部逻辑控制
  showBug.value = true
}

const toggleKeep = () => {
  showKeep.value = !showKeep.value
}

// 仅在 SSR 时执行
onServerPrefetch(async () => {
  ssrLog.value.push('[onServerPrefetch] 等待异步数据完成')
})
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0 0; font-size: 12px; color: #888; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
pre { background: #1f1f1f; color: #f5f5f5; padding: 8px; border-radius: 4px; font-size: 12px; }
</style>
