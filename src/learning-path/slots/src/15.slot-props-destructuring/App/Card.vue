<template>
  <div class="card">
    <slot :title="title" :desc="desc" />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ title?: string; desc?: string }>(),
  { title: '', desc: '' }
)
</script>

<style scoped>
.card { padding: 12px; background: #fff; border: 1px dashed #aaa; border-radius: 4px; }
</style>
