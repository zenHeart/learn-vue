<template>
  <div class="fp">
    <p>本组件挂载次数: <strong>{{ mountCount }}</strong></p>
    <input v-model="text" placeholder="本组件内输入" />
    <p class="hint">父组件 :key 变化时本组件重建 —— mountCount 累加</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const mountCount = ref(0)
const text = ref('')

onMounted(() => {
  mountCount.value++
})
</script>

<style scoped>
.fp {
  padding: 12px;
  background: #ecfeff;
  border: 1px solid #67e8f9;
  border-radius: 6px;
  margin-top: 6px;
}
input {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  margin-top: 6px;
}
.hint {
  font-size: 12px;
  color: #0e7490;
  margin-top: 4px;
}
</style>
