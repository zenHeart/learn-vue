<template>
  <div class="mf">
    <input v-model="first" placeholder="first" />
    <input v-model="last" placeholder="last" />
  </div>
</template>

<script setup lang="ts">
// 多个 v-model，第二个参数各自不同
const first = defineModel<string>('first', {
  default: '',
  set(v) {
    return v.toUpperCase()  // first 自动转大写
  },
})
const last = defineModel<string>('last', {
  default: '',
  set(v) {
    return v.toLowerCase()  // last 自动转小写
  },
})
</script>

<style scoped>
.mf {
  display: flex;
  gap: 6px;
}
input {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}
</style>
