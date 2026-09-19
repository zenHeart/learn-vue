<template>
  <div class="single">
    <span class="badge">#{{ tag.id }}</span>
    <span>{{ tag.label }}</span>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  tag: {
    type: Object as PropType<{ id: number; label: string }>,
    required: true,
  },
})
</script>

<style scoped>
.single { display: inline-flex; gap: 6px; align-items: center; padding: 4px 8px; background: #f1f5f9; border-radius: 6px; }
.badge { background: #42b883; color: #fff; padding: 1px 6px; border-radius: 4px; font-size: 12px; font-weight: 600; }
</style>