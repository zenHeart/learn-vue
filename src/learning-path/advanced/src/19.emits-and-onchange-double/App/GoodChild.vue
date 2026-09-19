<template>
  <div class="child">
    <p>✅ 正确写法子组件</p>
    <button @click="fire('world')">触发 change</button>
  </div>
</template>

<script setup lang="ts">
// ✅ 只走 emit
const emit = defineEmits<{ change: [v: string] }>()

function fire(v: string) {
  emit('change', v)
}
</script>

<style scoped>
.child { padding: 10px; background: #f6ffed; border-radius: 4px; border: 1px solid #b7eb8f; }
button { margin-right: 6px; padding: 4px 12px; }
</style>
