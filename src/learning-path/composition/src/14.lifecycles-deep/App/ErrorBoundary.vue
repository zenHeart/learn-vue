<template>
  <div class="eb">
    <div v-if="error" class="error">
      <strong>出错了:</strong> {{ error.message }}
    </div>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err as Error
  // 返回 false 阻止错误继续向上传播
  return false
})
</script>

<style scoped>
.eb { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
.error { padding: 8px; background: #fff1f0; color: #cf1322; border-radius: 4px; }
</style>
