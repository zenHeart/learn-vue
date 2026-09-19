<template>
  <div class="async-layout">
    <p>AsyncLayout 加载完成</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
await sleep(700)
</script>

<style scoped>
.async-layout {
  padding: 10px;
  background: #ecfeff;
  border: 1px solid #67e8f9;
  border-radius: 4px;
  font-size: 13px;
}
</style>