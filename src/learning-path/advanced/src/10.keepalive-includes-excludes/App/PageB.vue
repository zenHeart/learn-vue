<template>
  <div class="page">
    <h4>PageB</h4>
    <p>counter: {{ n }}</p>
    <button @click="n++">+1</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'PageB' })

const n = ref(0)
</script>

<style scoped>
.page { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
