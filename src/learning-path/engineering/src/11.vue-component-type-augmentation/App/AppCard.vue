<template>
  <article class="app-card">
    <header v-if="title || $slots.title">
      <slot name="title">{{ title }}</slot>
    </header>
    <div class="app-card__body">
      <slot />
    </div>
  </article>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    bordered?: boolean
  }>(),
  { bordered: true },
)
</script>

<style scoped>
.app-card {
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}
.app-card header {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  margin-bottom: 6px;
}
.app-card__body { color: #475569; font-size: 13px; }
</style>