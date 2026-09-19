<template>
  <input
    type="text"
    :value="localValue"
    @input="onInput"
    :placeholder="placeholder"
  />
</template>

<script setup lang="ts">
// 演示目的：实现一个「内部立刻响应、emit 延迟」的 v-model
// 这里用 props+emit 手写 —— 因为 defineModel 的 set 是同步转 emit，
// 真正的 debounce 必须发生在「接收输入到 emit」之间。
const props = defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const localValue = ref(props.modelValue)

// 父组件 prop 变化时同步本地
watch(() => props.modelValue, (v) => { localValue.value = v })

let timer: ReturnType<typeof setTimeout> | null = null
function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  localValue.value = v   // 内部立刻响应
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => emit('update:modelValue', v), 300)
}

import { ref, watch } from 'vue'
</script>

<style scoped>
input {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
