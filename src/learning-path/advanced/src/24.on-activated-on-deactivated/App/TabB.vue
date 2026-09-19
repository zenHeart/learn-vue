<template>
  <div class="tab-inner">
    <p>Tab B — 文本：<input v-model="text" /></p>
    <p class="hint">去别的 tab 再回来看看 text 还在不在</p>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onActivated, onDeactivated, onMounted, onUnmounted } from 'vue'
const append = inject<(s: string) => void>('appendLog')

const text = ref('')

onMounted(() => append?.('B: onMounted'))
onUnmounted(() => append?.('B: onUnmounted'))
onActivated(() => append?.('B: onActivated'))
onDeactivated(() => append?.('B: onDeactivated'))
</script>

<style scoped>
.tab-inner {
  padding: 12px;
  background: #ecfeff;
  border: 1px solid #67e8f9;
  border-radius: 4px;
}
input {
  padding: 4px 8px;
  border: 1px solid #67e8f9;
  border-radius: 4px;
  margin-left: 8px;
}
.hint {
  font-size: 12px;
  color: #64748b;
}
</style>