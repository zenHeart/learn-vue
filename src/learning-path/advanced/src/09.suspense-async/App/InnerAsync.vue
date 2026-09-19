<template>
  <div class="ia">
    <h4>内层异步组件</h4>
    <p>loaded: {{ data.value }}</p>
  </div>
</template>

<script setup lang="ts">
const data = await new Promise<{ value: string }>((r) =>
  setTimeout(() => r({ value: 'inner-loaded' }), 1500)
)
</script>

<style scoped>
.ia { padding: 12px; background: #fafafa; border-radius: 4px; border: 1px dashed #aaa; }
</style>
