<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <input
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :ref="refName"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  label: string
  modelValue: string
  placeholder?: string
  refName?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

// 每个 FormField 实例独立 id，SSR hydration 也会保持一致
const id = useId()

defineExpose({
  focus: (el?: HTMLInputElement | null) => {
    if (el && typeof el.focus === 'function') el.focus()
  },
})
</script>

<style scoped>
.field { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
.field label { width: 60px; font-size: 12px; color: #555; }
.field input { flex: 1; padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; }
</style>
