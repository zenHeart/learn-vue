<template>
  <div class="ge">
    子组件 - 内部只声明了 known 事件
    <button @click="triggerKnown">触发已声明</button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'known', payload: string): void
}>()

const triggerKnown = () => emit('known', 'hello')

// 暴露 emit 让父组件可以直接调用未声明事件，触发 dev warn
defineExpose({ emit })
</script>

<style scoped>
.ge { padding: 8px 10px; background: #fff; border: 1px dashed #aaa; border-radius: 4px; }
button { padding: 4px 10px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; margin-left: 6px; }
</style>
