<template>
  <div class="counter">
    <button @click="inc">+</button>
    <span class="val">{{ value }}</span>
    <button @click="dec">-</button>
    <p class="meta">强类型 emit：change 必须传 number</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ value: number }>()

const emit = defineEmits<{
  (e: 'change', v: number): void
}>()

const inc = () => emit('change', props.value + 1)
const dec = () => emit('change', props.value - 1)
</script>

<style scoped>
.counter { display: flex; align-items: center; gap: 10px; padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
.val { font-weight: 700; min-width: 24px; text-align: center; }
.meta { margin: 6px 0 0; font-size: 12px; color: #888; }
button { padding: 5px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
