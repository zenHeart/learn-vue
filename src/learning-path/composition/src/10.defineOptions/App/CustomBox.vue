<template>
  <div class="cb">
    <h4>{{ title }}</h4>
    <p>customOptions.tags: {{ tags.join(', ') }}</p>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'

defineOptions({
  name: 'CustomBox',
  customOptions: {
    tags: ['demo', 'composition', 'macro'],
    version: '1.0.0',
  },
})

const title = '组件级 customOptions 演示'
const instance = getCurrentInstance()
const tags = (instance?.proxy?.$options?.customOptions?.tags as string[]) ?? []
</script>

<style scoped>
.cb { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
</style>
