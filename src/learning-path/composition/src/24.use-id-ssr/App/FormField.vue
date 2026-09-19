<template>
  <div class="field">
    <label :for="id">{{ label }}:</label>
    <input
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :aria-describedby="`${id}-hint`"
    />
    <span :id="`${id}-hint`" class="hint">id = {{ id }}</span>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

const props = defineProps<{ label: string; modelValue: string }>()
defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const id = useId()
console.log('[FormField]', props.label, 'id =', id)
</script>

<style scoped>
.field {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}
.hint {
  font-size: 11px;
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, monospace;
}
input {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}
</style>