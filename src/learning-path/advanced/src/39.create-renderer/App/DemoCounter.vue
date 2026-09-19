<template>
  <div class="counter">
    <strong>{{ label }}</strong>
    <span class="num">{{ count }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count: number
  label: string
}>()
</script>

<style scoped>
.counter {
  padding: 8px 12px;
  border: 1px solid #42b883;
  border-radius: 4px;
  font-family: system-ui, sans-serif;
  font-size: 14px;
  display: inline-flex;
  gap: 12px;
  align-items: center;
}
.counter .num { font-weight: 700; color: #42b883; font-variant-numeric: tabular-nums; }
</style>