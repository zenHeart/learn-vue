<template>
  <div class="tab-inner">
    <p>Tab A</p>
    <p>内部计数: <strong>{{ count }}</strong></p>
    <button @click="count++">+1</button>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onActivated, onDeactivated, onMounted, onUnmounted } from 'vue'
const append = inject<(s: string) => void>('appendLog')

const count = ref(0)

onMounted(() => append?.('A: onMounted（首次挂载）'))
onUnmounted(() => append?.('A: onUnmounted（真实销毁）'))
onActivated(() => append?.('A: onActivated（从 KeepAlive 恢复）'))
onDeactivated(() => append?.('A: onDeactivated（被 KeepAlive 切走）'))
</script>

<style scoped>
.tab-inner {
  padding: 12px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 4px;
}
button {
  padding: 4px 12px;
  border: 1px solid #fcd34d;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
</style>