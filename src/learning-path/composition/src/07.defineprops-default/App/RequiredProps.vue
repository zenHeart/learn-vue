<template>
  <div class="rq">required msg = {{ msg }}</div>
</template>

<script setup lang="ts">
defineProps<{ msg: string }>()
</script>

<style scoped>
.rq { padding: 10px; background: #fffbe6; border-radius: 4px; border: 1px dashed #f5b400; font-size: 13px; }
</style>
