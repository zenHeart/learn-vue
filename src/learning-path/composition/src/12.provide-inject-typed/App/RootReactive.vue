<template>
  <div class="root-r">
    <p>计数: <strong>{{ count }}</strong></p>
    <button @click="count++">+1</button>
    <CounterChild />
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { CountKey } from './keys'
import CounterChild from './CounterChild.vue'

const count = ref(0)
// 注入 ref 本身，inject 拿到的还是 ref，调用方直接 .value 触发响应性
provide(CountKey, count)
</script>

<style scoped>
.root-r { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
