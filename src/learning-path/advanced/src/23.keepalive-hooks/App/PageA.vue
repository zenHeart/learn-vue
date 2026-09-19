<template>
  <div class="page">
    <h4>PageA</h4>
    <input v-model="text" placeholder="A 的输入" />
    <p>输入：{{ text }}</p>
    <p>激活次数：{{ activateCount }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated } from 'vue'

const text = ref('')
const activateCount = ref(0)

onMounted(() => {
  // 通过自定义事件向上汇报
  window.dispatchEvent(new CustomEvent('demo-log', { detail: '[PageA] mounted' }))
})
onActivated(() => {
  activateCount.value++
  window.dispatchEvent(new CustomEvent('demo-log', { detail: '[PageA] activated #' + activateCount.value }))
})
onDeactivated(() => {
  window.dispatchEvent(new CustomEvent('demo-log', { detail: '[PageA] deactivated' }))
})
</script>

<style scoped>
.page { padding: 10px; background: #f8fafc; border-radius: 4px; border: 1px dashed #cbd5e1; }
input { padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; }
</style>
