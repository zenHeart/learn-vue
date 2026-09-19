<template>
  <div class="stepper">
    <p>{{ label }}：{{ count }}</p>
    <button @click="inc">+</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ label: string }>()
const count = ref(0)

function inc() { count.value++ }
function reset() { count.value = 0 }

// 暴露给父组件（template ref 拿到组件实例后可调用这些方法）
defineExpose({ inc, reset })
</script>

<style scoped>
.stepper { padding: 8px 12px; background: #fff; border: 1px solid #e5e5e5; border-radius: 4px; min-width: 100px; text-align: center; }
.stepper p { margin: 0 0 6px; font-size: 13px; }
.stepper button { width: 28px; }
</style>