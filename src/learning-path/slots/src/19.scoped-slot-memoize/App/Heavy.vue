<template>
  <div class="heavy">
    <strong>{{ item.name }}</strong>
    <span class="meta">v{{ item.version }}</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const props = defineProps<{ item: { id: number; name: string; version: number } }>()
onMounted(() => console.log(`[Heavy] mounted id=${props.item.id}`))
</script>

<style scoped>
.heavy { display: inline-flex; gap: 6px; align-items: center; padding: 2px 8px; background: #fafafa; border-radius: 4px; }
.meta { font-size: 11px; color: #888; }
</style>
