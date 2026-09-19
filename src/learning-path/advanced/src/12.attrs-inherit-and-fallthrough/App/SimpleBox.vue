<template>
  <div class="sb" @click="$emit('custom-event', { msg: 'clicked' })">
    单根节点 (class / data-id 透传)
  </div>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'custom-event', payload: { msg: string }): void }>()
</script>

<style scoped>
.sb { padding: 10px; background: #fff; border-radius: 4px; border: 1px solid #ccc; cursor: pointer; }
</style>
