<template>
  <div class="child">
    <p>子组件 count = {{ count }}</p>
    <button @click="count++">子组件内部 ++</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function focus() {
  console.log('[child] focus 被调用')
}
function reset() {
  count.value = 0
  console.log('[child] reset 被调用')
}

// 显式暴露方法给父组件
defineExpose({ focus, reset, count })
</script>

<style scoped>
.child {
  padding: 8px 12px;
  background: #ecfeff;
  border: 1px solid #67e8f9;
  border-radius: 4px;
  margin-top: 6px;
  font-size: 13px;
}
</style>