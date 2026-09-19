<template>
  <div class="child">
    <p>attrs.class = {{ attrs.class }}</p>
    <p>attrs.data-info = {{ attrs['data-info'] }}</p>
    <p>默认插槽：<slot /></p>
    <p>extra 插槽：<slot name="extra" /></p>
  </div>
</template>

<script setup>
import { useAttrs, useSlots } from 'vue'

const attrs = useAttrs()
const slots = useSlots()
</script>

<style scoped>
.child {
  padding: 6px;
  border: 1px dashed #94a3b8;
  border-radius: 4px;
  background: #fff;
}
</style>