<template>
  <div class="public">
    <div class="title">{{ title }}</div>
    <div class="count">count = {{ count }}</div>
  </div>
</template>

<script setup lang="ts">
// 这个组件对外暴露 _internal* 字段，演示 ExtractPublicPropTypes
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
  _internalCache: { type: Object, default: () => new Map() },
  _internalKey: { type: String, default: '' },
})

// 业务代码可以访问 _internal* 但不应当暴露给外部文档
void props._internalCache
</script>

<style scoped>
.public { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-family: system-ui, sans-serif; }
.title { font-weight: 600; color: #1e293b; font-size: 14px; }
.count { color: #64748b; font-size: 12px; margin-top: 4px; }
</style>