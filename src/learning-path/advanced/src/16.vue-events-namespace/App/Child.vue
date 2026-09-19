<template>
  <div class="child">
    <button @click="$emit('save', { id: 1 })">emit save</button>
    <button @click="$emit('update:value', new Date().toLocaleTimeString())">emit update:value</button>
  </div>
</template>

<script setup>
const emit = defineEmits(['save', 'update:value'])
</script>

<style scoped>
.child button {
  margin-right: 6px;
  padding: 4px 10px;
}
</style>