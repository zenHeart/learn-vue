<template>
  <div class="async-child">
    <p>异步组件加载完成。setup 中会抛错。</p>
  </div>
</template>

<script setup lang="ts">
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

await sleep(500)
throw new Error('AsyncChild 故意抛错（Suspense #error 应捕获）')
</script>

<style scoped>
.async-child {
  padding: 10px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 13px;
}
</style>