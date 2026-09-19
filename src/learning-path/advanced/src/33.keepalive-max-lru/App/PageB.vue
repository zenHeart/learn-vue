<template>
  <div class="page">
    <strong>Page B</strong>
    <p>文本: <input v-model="text" /></p>
    <p>当前值: <code>{{ text }}</code></p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, onDeactivated, onUnmounted } from 'vue'

const text = ref('B-init')

function log(msg: string) {
  if (typeof window !== 'undefined') {
    if (!window.__KEEP_LOG__) window.__KEEP_LOG__ = []
    window.__KEEP_LOG__.push(`[B] ${msg}`)
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
  background: #d1fae5;
  border: 1px solid #34d399;
  border-radius: 6px;
}
input {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}
code {
  font-family: 'SFMono-Regular', Consolas, monospace;
}
</style>
