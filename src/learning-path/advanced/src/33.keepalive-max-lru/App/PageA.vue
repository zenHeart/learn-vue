<template>
  <div class="page">
    <strong>Page A</strong>
    <p>内部计数（状态保留测试）: {{ count }}</p>
    <button @click="count++">A 内部 +1</button>
    <p class="hint">重新挂载时计数会重置；命中缓存时保留</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, onDeactivated, onUnmounted } from 'vue'

const count = ref(0)

function log(msg: string) {
  if (typeof window !== 'undefined') {
    if (!window.__KEEP_LOG__) window.__KEEP_LOG__ = []
    window.__KEEP_LOG__.push(`[A] ${msg}`)
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
  background: #ede9fe;
  border: 1px solid #a78bfa;
  border-radius: 6px;
}
.hint {
  font-size: 12px;
  color: #6b21a8;
  margin-top: 4px;
}
</style>
