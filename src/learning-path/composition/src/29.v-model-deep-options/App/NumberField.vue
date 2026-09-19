<template>
  <input
    type="text"
    :value="model"
    @input="onInput"
  />
</template>

<script setup lang="ts">
// set 中把字符串转 number，父组件拿到的就是 number
const model = defineModel<number | string>({
  default: 0,
  set(v) {
    if (typeof v === 'string') {
      const num = parseFloat(v)
      return Number.isFinite(num) ? num : v
    }
    return v
  },
})

function onInput(e: Event) {
  model.value = (e.target as HTMLInputElement).value
}
</script>

<style scoped>
input {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
