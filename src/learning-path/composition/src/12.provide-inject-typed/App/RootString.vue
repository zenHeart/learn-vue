<template>
  <div class="root-s">
    <p>字符串 key 注入的 raw 数据: {{ raw }}</p>
    <p class="hint">类型为 unknown / any，没有编译期保护</p>
  </div>
</template>

<script setup lang="ts">
import { provide, inject } from 'vue'

// 字符串 key 没有 InjectionKey<T> 包裹，因此 inject 拿到的值类型是 unknown
provide('raw-data', { foo: 'bar' })

const raw = inject('raw-data') as { foo: string }
</script>

<style scoped>
.root-s { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
.hint { font-size: 12px; color: #888; }
</style>
