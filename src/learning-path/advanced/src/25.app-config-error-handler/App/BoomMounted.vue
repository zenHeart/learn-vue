<template>
  <div class="boom">
    <span>BoomMounted 子组件</span>
    <button @click="boom">再次触发</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

// 第一次进入 mounted 时不抛错；后续每次点击都抛
const fired = ref(false)

onMounted(() => {
  fired.value = true
})

function boom() {
  throw new Error('mounted 钩子抛错（演示）')
}
</script>

<style scoped>
.boom {
  padding: 8px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 4px;
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
button {
  padding: 2px 8px;
  border: 1px solid #fca5a5;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
</style>