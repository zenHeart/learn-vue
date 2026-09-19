<template>
  <div class="demo">
    <h2>onErrorCaptured 错误捕获链</h2>
    <p class="hint">点击子组件「点我抛错」观察：onErrorCaptured 收到 → 渲染降级 UI → 全局 errorHandler 仍可兜底。</p>
    <Boundary>
      <Buggy />
    </Boundary>
  </div>
</template>

<script setup lang="ts">
import { onMounted, getCurrentInstance } from 'vue'
import Buggy from './Buggy.vue'
import Boundary from './Boundary.vue'

onMounted(() => {
  // 全局兜底：errorHandler 不阻止冒泡，仅作监控
  const inst = getCurrentInstance()
  if (inst) {
    const app = inst.appContext.app as any
    app.config.errorHandler = (err: Error) => {
      // eslint-disable-next-line no-console
      console.warn('[app.config.errorHandler]', err.message)
    }
  }
})
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
h2 { margin-top: 0; }
.hint { font-size: 12px; color: #64748b; margin: 0 0 14px; }
</style>