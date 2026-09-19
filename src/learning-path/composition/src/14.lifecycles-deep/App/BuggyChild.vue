<template>
  <div class="bc">
    <button @click="boom">boom</button>
  </div>
</template>

<script setup lang="ts">
const boom = () => {
  throw new Error('模拟子组件抛出错误')
}
</script>

<style scoped>
.bc { padding: 10px; }
button { padding: 4px 12px; border: 1px solid #f5222d; background: #fff1f0; color: #cf1322; border-radius: 4px; cursor: pointer; }
</style>
