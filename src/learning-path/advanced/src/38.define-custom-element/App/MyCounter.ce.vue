<template>
  <div class="counter">
    <button @click="dec">-</button>
    <strong>{{ count }}</strong>
    <button @click="inc">+</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  start?: number
}>()

const emit = defineEmits<{
  (e: 'change', value: number): void
}>()

const count = ref(props.start ?? 0)

function inc() {
  count.value++
  emit('change', count.value)
}
function dec() {
  count.value--
  emit('change', count.value)
}
</script>

<style scoped>
.counter {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #d4d4d8;
  border-radius: 6px;
  font-family: system-ui, sans-serif;
}
.counter button {
  width: 28px;
  height: 28px;
  border: none;
  background: #42b883;
  color: #fff;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}
.counter strong {
  min-width: 32px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
</style>