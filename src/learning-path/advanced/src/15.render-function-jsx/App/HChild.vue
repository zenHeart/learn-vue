<template>
  <div class="hc">
    子组件 props.label = <strong>{{ label }}</strong>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<style scoped>
.hc { padding: 6px 10px; background: #fafafa; border: 1px dashed #aaa; border-radius: 4px; }
</style>
