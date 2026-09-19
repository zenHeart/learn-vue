<template>
  <div class="demo">
    <h2>Suspense 异步组件与 fallback</h2>

    <section class="card">
      <h3>1. async setup 子组件</h3>
      <button @click="trigger1">重新加载 AsyncProfile</button>
      <Suspense>
        <template #default>
          <AsyncProfile v-if="show1" />
        </template>
        <template #fallback>
          <div class="fb">正在加载用户档案...</div>
        </template>
      </Suspense>
    </section>

    <section class="card">
      <h3>2. 嵌套 Suspense + 异步组件</h3>
      <Suspense>
        <template #default>
          <OuterAsync />
        </template>
        <template #fallback>
          <div class="fb">外层等待...</div>
        </template>
      </Suspense>
    </section>

    <section class="card">
      <h3>3. 触发错误（fallback 不处理错误）</h3>
      <button @click="triggerError">触发子组件错误</button>
      <ErrorBoundarySuspense>
        <AsyncBuggy />
      </ErrorBoundarySuspense>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import AsyncProfile from './AsyncProfile.vue'
import OuterAsync from './OuterAsync.vue'
import AsyncBuggy from './AsyncBuggy.vue'
import ErrorBoundarySuspense from './ErrorBoundarySuspense.vue'

const show1 = ref(true)
const trigger1 = () => (show1.value = false) || (show1.value = true)
const triggerError = () => trigger1()

// 监听 3.5+ Suspense 事件
const inst = getCurrentInstance()
onMounted(() => {
  inst?.proxy?.$el.addEventListener('onResolve', () => {
    console.log('[Suspense] resolved')
  })
})
onBeforeUnmount(() => {
  inst?.proxy?.$el.removeEventListener('onResolve', () => {})
})
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
.fb { padding: 16px; background: #f0f5ff; color: #1d39c4; text-align: center; border-radius: 4px; }
</style>
