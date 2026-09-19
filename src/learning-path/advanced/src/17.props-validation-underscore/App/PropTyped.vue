<template>
  <div class="typed">
    <p>count = {{ count }} ({{ typeof count }})</p>
    <p>mode = {{ mode }}</p>
  </div>
</template>

<script setup lang="ts">
// props 同时声明 type / required / validator：运行时按顺序校验
const props = defineProps({
  count: {
    type: Number,
    required: true, // 缺这个 prop 会警告
  },
  mode: {
    type: String,
    validator: (v: string) => ['auto', 'manual', 'hybrid'].includes(v),
  },
})

// 这里只是给 dev console 看一眼
console.log('[PropTyped] received', props)
</script>

<style scoped>
.typed { padding: 8px; background: #fff; border-radius: 4px; border: 1px solid #e5e5e5; }
</style>
