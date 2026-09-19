<template>
  <input
    type="text"
    :value="model"
    @input="(e) => (model.value = (e.target as HTMLInputElement).value)"
    :placeholder="placeholder"
  />
</template>

<script setup lang="ts">
// 父组件传 .trim 修饰符，子组件消费 modifiers.trim
const [model, modifiers] = defineModel('value', {
  set(v: string) {
    return modifiers.trim ? v.trim() : v
  },
})

defineProps<{ placeholder?: string }>()
</script>

<style scoped>
input {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
