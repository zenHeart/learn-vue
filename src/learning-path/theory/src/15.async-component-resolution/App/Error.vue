<template>
  <div class="err">加载失败：{{ error?.message }}</div>
</template>

<script setup lang="ts">
defineProps<{ error?: Error }>()
</script>

<style scoped>
.err { padding: 12px; background: #fff1f0; border: 1px solid #ffa39e; border-radius: 4px; color: #cf1322; }
</style>
