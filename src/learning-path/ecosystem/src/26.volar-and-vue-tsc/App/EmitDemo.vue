<template>
  <button class="emit-btn" @click="fire">{{ label }}</button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'change', value: number): void
}>()

const label = '触发 change 事件'

function fire() {
  emit('change', Math.floor(Math.random() * 100))
}
</script>

<style scoped>
.emit-btn {
  padding: 6px 14px;
  background: #42b883;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
</style>