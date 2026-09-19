<template>
  <div class="counter">
    <span>count: {{ count }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function add() {
  count.value++
}

function reset() {
  count.value = 0
}

defineExpose({ add, reset })
</script>

<style scoped>
.counter {
  display: inline-block;
  padding: 6px 12px;
  background: #ecfeff;
  border: 1px solid #67e8f9;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, monospace;
}
</style>