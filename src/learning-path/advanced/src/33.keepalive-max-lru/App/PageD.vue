<template>
  <div class="page">
    <strong>Page D</strong>
    <p>D 页面 — 触发 max=3 时的 LRU 淘汰</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onActivated, onDeactivated, onUnmounted } from 'vue'

function log(msg: string) {
  if (typeof window !== 'undefined') {
    if (!window.__KEEP_LOG__) window.__KEEP_LOG__ = []
    window.__KEEP_LOG__.push(`[D] ${msg}`)
  }
}

onMounted(() => log('mounted'))
onActivated(() => log('activated'))
onDeactivated(() => log('deactivated'))
onUnmounted(() => log('unmounted'))
</script>

<style scoped>
.page {
  padding: 12px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 6px;
}
</style>
