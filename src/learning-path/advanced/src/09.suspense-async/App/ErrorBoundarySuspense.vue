<template>
  <div class="eb">
    <Suspense v-if="!error">
      <template #default>
        <slot />
      </template>
      <template #fallback>
        <div class="fb">loading...</div>
      </template>
    </Suspense>
    <div v-else class="err">
      <strong>出错了:</strong> {{ error.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)
onErrorCaptured((err) => {
  error.value = err as Error
  return false
})
</script>

<style scoped>
.eb { padding: 8px; }
.fb { padding: 12px; background: #f0f5ff; color: #1d39c4; text-align: center; border-radius: 4px; }
.err { padding: 12px; background: #fff1f0; color: #cf1322; border-radius: 4px; border: 1px solid #ffa39e; }
</style>
