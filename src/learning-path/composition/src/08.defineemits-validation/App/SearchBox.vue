<template>
  <div class="search">
    <input v-model="kw" placeholder="搜索" @keyup.enter="emitSubmit" />
    <button @click="emitSubmit">搜索</button>
    <button @click="emitObject">高级</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const kw = ref('')

const emit = defineEmits<{
  (e: 'submit', payload: string | { q: string }): void
}>()

const emitSubmit = () => emit('submit', kw.value)
const emitObject = () => emit('submit', { q: kw.value || 'all' })
</script>

<style scoped>
.search { display: flex; gap: 8px; padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 5px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
