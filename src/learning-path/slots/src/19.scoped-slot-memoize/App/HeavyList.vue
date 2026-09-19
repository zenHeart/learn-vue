<template>
  <div class="hl">
    <div v-for="item in items" :key="item.id" class="row">
      <slot :item="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: { id: number; name: string; version: number }[] }>()
</script>

<style scoped>
.hl { display: flex; flex-direction: column; gap: 6px; }
.row { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #fff; border: 1px solid #e5e5e5; border-radius: 4px; }
</style>
