<template>
  <div class="uc">
    <input v-model="model" placeholder="local 输入" />
    <span>内部值: {{ model }}</span>
  </div>
</template>

<script setup lang="ts">
// local: true 表示这个 prop 只在内部维护，不响应外部更新
const model = defineModel<string>('value', { local: true, default: '' })
</script>

<style scoped>
.uc { display: flex; align-items: center; gap: 10px; padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; }
</style>
