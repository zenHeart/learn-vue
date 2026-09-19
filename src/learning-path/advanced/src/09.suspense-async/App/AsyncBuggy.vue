<template>
  <div class="bug">
    <p>{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
const label = await Promise.reject(new Error('async setup failed'))
</script>

<style scoped>
.bug { padding: 12px; background: #fff1f0; color: #cf1322; border-radius: 4px; }
</style>
