<template>
  <span class="app-badge" :class="`app-badge--${tone}`">
    <slot />
  </span>
</template>

<script setup lang="ts">
type Tone = 'neutral' | 'success' | 'warn' | 'error'

withDefaults(
  defineProps<{
    tone?: Tone
  }>(),
  { tone: 'neutral' },
)
</script>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.app-badge--neutral { background: #f1f5f9; color: #475569; }
.app-badge--success { background: #dcfce7; color: #166534; }
.app-badge--warn { background: #fef3c7; color: #854d0e; }
.app-badge--error { background: #fee2e2; color: #991b1b; }
</style>