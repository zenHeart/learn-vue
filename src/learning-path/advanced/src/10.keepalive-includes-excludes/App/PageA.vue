<template>
  <div class="page">
    <h4>PageA</h4>
    <input v-model="text" placeholder="A 的输入" />
    <p>输入内容: {{ text }}</p>
    <p class="hint">该页面有内部状态，切走再回来会保留</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'

defineOptions({ name: 'PageA' })

const text = ref('')
onActivated(() => console.log('[PageA] activated'))
onDeactivated(() => console.log('[PageA] deactivated'))
</script>

<style scoped>
.page { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; }
.hint { font-size: 12px; color: #888; }
</style>
