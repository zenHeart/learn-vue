<template>
  <div class="page">
    <strong>Page C</strong>
    <p>C 页面</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onActivated, onDeactivated, onUnmounted } from 'vue'

function log(msg: string) {
  if (typeof window !== 'undefined') {
    if (!window.__KEEP_LOG__) window.__KEEP_LOG__ = []
    window.__KEEP_LOG__.push(`[C] ${msg}`)
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
  background: #fee2e2;
  border: 1px solid #f87171;
  border-radius: 6px;
}
</style>
