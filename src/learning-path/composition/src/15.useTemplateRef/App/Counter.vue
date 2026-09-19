<template>
  <div class="counter">
    <span>Counter: {{ count }}</span>
    <button @click="add">+</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineExpose({
  add,
})

const count = ref(0)
function add() {
  count.value++
}
</script>

<style scoped>
.counter { display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
button { padding: 2px 8px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
