<template>
  <div class="nc">
    <h4>{{ title }}</h4>
    <p>深度: {{ depth }}</p>
    <button @click="add" v-if="depth < 3">递归一层</button>
    <div class="child">
      <NamedCard v-if="depth > 0" :title="title" :depth="depth - 1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 通过 defineOptions 暴露组件名，使递归调用可解析到自身
defineOptions({ name: 'NamedCard' })

defineProps<{ title: string; depth?: number }>()
const localDepth = ref(0)
const add = () => localDepth.value++
</script>

<style scoped>
.nc { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
.child { margin-left: 16px; padding: 8px; border-left: 2px solid #ccc; }
button { margin-top: 6px; padding: 4px 10px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
