<template>
  <div class="child">
    <p>attrs.class = {{ attrs.class }}</p>
    <p>默认插槽：<slot /></p>
    <p>具名插槽 extra：<slot name="extra" /></p>
    <button @click="emit('greet', { from: 'child', ts: Date.now() })">emit greet</button>
  </div>
</template>

<script setup>
import { useAttrs, useSlots } from 'vue'

const emit = defineEmits(['greet'])
const attrs = useAttrs()
const slots = useSlots()

defineExpose({ slots })
</script>

<style scoped>
.child {
  padding: 8px;
  border: 1px dashed #94a3b8;
  border-radius: 4px;
  background: #fff;
  margin-bottom: 8px;
}
button {
  margin-top: 6px;
  padding: 4px 10px;
}
</style>