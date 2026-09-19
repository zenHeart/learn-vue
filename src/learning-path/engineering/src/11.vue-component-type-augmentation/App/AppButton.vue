<template>
  <button class="app-btn" :class="[`app-btn--${variant}`, `app-btn--${size}`]" @click="onClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    disabled?: boolean
  }>(),
  { variant: 'primary', size: 'md', disabled: false },
)

const emit = defineEmits<{
  (e: 'click', payload: MouseEvent): void
}>()

function onClick(e: MouseEvent) {
  if (props.disabled) return
  emit('click', e)
}
</script>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  font-family: system-ui, sans-serif;
  transition: all 0.15s;
}
.app-btn--primary { background: #42b883; color: #fff; }
.app-btn--secondary { background: #fff; color: #1e293b; border-color: #cbd5e1; }
.app-btn--ghost { background: transparent; color: #42b883; }
.app-btn--sm { padding: 3px 10px; font-size: 12px; }
.app-btn--md { padding: 6px 14px; }
.app-btn--lg { padding: 9px 18px; font-size: 14px; }
.app-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>