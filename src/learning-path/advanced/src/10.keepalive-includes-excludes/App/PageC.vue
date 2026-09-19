<template>
  <div class="page">
    <h4>PageC</h4>
    <p>{{ mountedAt }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'PageC' })

const mountedAt = ref(new Date().toLocaleTimeString())
</script>

<style scoped>
.page { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
</style>
