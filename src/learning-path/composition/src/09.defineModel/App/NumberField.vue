<template>
  <input
    type="text"
    :value="value"
    @input="onInput"
    placeholder="数字输入"
  />
</template>

<script setup lang="ts">
// defineModel 第二个参数支持 get/set 转换
const value = defineModel<number | string>({
  default: 0,
  // 把 trim/number 等修饰符在子组件消费
  get(v) {
    return v
  },
  set(v) {
    // 在子组件层把字符串转 number，父组件拿到的就是 number
    if (typeof v === 'string') {
      const num = parseFloat(v)
      return Number.isFinite(num) ? num : v
    }
    return v
  },
})

function onInput(e: Event) {
  value.value = (e.target as HTMLInputElement).value
}
</script>

<style scoped>
input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; }
</style>
