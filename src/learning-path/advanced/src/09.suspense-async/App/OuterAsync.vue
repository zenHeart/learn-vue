<template>
  <div class="oa">
    <h4>外层异步组件</h4>
    <Suspense>
      <template #default>
        <InnerAsync />
      </template>
      <template #fallback>
        <div class="fb">内层等待...</div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import InnerAsync from './InnerAsync.vue'

// 外层 async：触发外层 Suspense
const data = await new Promise<{ tag: string }>((r) =>
  setTimeout(() => r({ tag: 'outer-resolved' }), 800)
)
</script>

<style scoped>
.oa { padding: 12px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
.fb { padding: 12px; background: #f6ffed; color: #389e0d; text-align: center; border-radius: 4px; }
</style>
