<template>
  <div class="row">
    <!-- defineModel 返回 WritableComputedRef，可直接 v-model -->
    <input v-model="first" placeholder="first" />
    <input v-model="last" placeholder="last" />
  </div>
</template>

<script setup lang="ts">
// 多个 v-model 在 3.4+ 通过 defineModel 重载形式指定 prop 名
const first = defineModel<string>('first', { default: '' })
const last = defineModel<string>('last', { default: '' })
</script>

<style scoped>
.row { display: flex; gap: 8px; }
input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; }
</style>
