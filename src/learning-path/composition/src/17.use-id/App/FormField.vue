<template>
  <div class="field">
    <label :for="id">{{ label }}：</label>
    <input :id="id" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
    <span class="hint">(id={{ id }})</span>
  </div>
</template>

<script setup>
import { useId } from 'vue'

defineProps({
  label: String,
  modelValue: String,
})
defineEmits(['update:modelValue'])

// SSR 安全：每次实例独立 ID，hydrate 时保持稳定
const id = useId()
</script>

<style scoped>
.field { margin: 4px 0; }
.hint { color: #94a3b8; font-size: 11px; margin-left: 6px; }
</style>
