<template>
  <span class="silent">Silent: {{ value }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref(0)

// 注意：没有 defineExpose —— 父组件拿不到方法
</script>

<style scoped>
.silent {
  display: inline-block;
  padding: 4px 12px;
  margin-right: 8px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, monospace;
}
</style>