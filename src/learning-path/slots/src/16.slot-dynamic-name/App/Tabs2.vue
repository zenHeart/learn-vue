<template>
  <div class="tabs2">
    <slot :name="`tab-${active}`" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ active: string }>()
</script>

<style scoped>
.tabs2 { padding: 8px; background: #fff; border-radius: 4px; }
</style>
