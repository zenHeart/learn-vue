<template>
  <div class="child-slot" data-slots-check :data-default="hasDefault ? '1' : '0'" :data-header="hasHeader ? '1' : '0'">
    <div v-if="hasHeader" class="slot-header">
      <slot name="header" />
    </div>
    <div v-if="hasDefault" class="slot-default">
      <slot />
    </div>
    <p v-if="!hasDefault && !hasHeader" class="empty">父组件未传入任何插槽</p>
  </div>
</template>

<script setup lang="ts">
import { useSlots, computed } from 'vue'

const slots = useSlots()
const hasDefault = computed(() => !!slots.default)
const hasHeader = computed(() => !!slots.header)
</script>

<style scoped>
.child-slot {
  padding: 10px;
  border: 1px dashed #94a3b8;
  border-radius: 4px;
  background: #f8fafc;
}
.slot-header {
  padding-bottom: 6px;
  margin-bottom: 6px;
  border-bottom: 1px solid #cbd5e1;
  color: #1e293b;
}
.slot-default {
  color: #334155;
  font-size: 13px;
}
.empty {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}
</style>