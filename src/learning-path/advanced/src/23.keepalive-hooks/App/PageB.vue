<template>
  <div class="page">
    <h4>PageB</h4>
    <button @click="count++">count++ {{ count }}</button>
    <p>激活次数：{{ activateCount }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated } from 'vue'

const count = ref(0)
const activateCount = ref(0)

onMounted(() => {
  window.dispatchEvent(new CustomEvent('demo-log', { detail: '[PageB] mounted' }))
})
onActivated(() => {
  activateCount.value++
  window.dispatchEvent(new CustomEvent('demo-log', { detail: '[PageB] activated #' + activateCount.value }))
})
onDeactivated(() => {
  window.dispatchEvent(new CustomEvent('demo-log', { detail: '[PageB] deactivated' }))
})
</script>

<style scoped>
.page { padding: 10px; background: #f8fafc; border-radius: 4px; border: 1px dashed #cbd5e1; }
button { padding: 4px 10px; }
</style>
