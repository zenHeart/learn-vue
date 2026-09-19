<template>
  <div class="async">
    <p>Hello, {{ name }}!</p>
    <p class="meta">本组件在 setup 中通过 await 模拟异步加载</p>
  </div>
</template>

<script setup>
const props = defineProps({ name: { type: String, default: 'Vue' } })
// 模拟异步数据获取
await new Promise((r) => setTimeout(r, 250))
console.log('[AsyncHello] mounted with', props.name)
</script>

<style scoped>
.async {
  padding: 6px;
  border: 1px dashed #94a3b8;
  border-radius: 4px;
  background: #fff;
}
.meta {
  font-size: 12px;
  color: #64748b;
}
</style>