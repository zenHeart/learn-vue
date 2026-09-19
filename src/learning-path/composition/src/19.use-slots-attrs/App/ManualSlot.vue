<template>
  <div class="wrap">
    <div class="header">
      <slot name="header">默认 header</slot>
    </div>
    <div class="body">
      <slot>默认 body</slot>
    </div>
    <div class="footer">
      <slot v-if="hasFooter" name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const slots = useSlots()
const hasFooter = computed(() => !!slots.footer)
</script>

<style scoped>
.wrap { border: 1px solid #cbd5e1; padding: 8px; border-radius: 4px; }
.header { background: #e0e7ff; padding: 4px 8px; }
.body { padding: 8px; }
.footer { background: #fef3c7; padding: 4px 8px; min-height: 22px; }
</style>
