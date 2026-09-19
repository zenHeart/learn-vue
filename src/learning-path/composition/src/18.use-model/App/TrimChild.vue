<template>
  <div class="child">
    <input :value="tag" @input="tag = $event.target.value" placeholder="输入会 trim" />
  </div>
</template>

<script setup>
import { useModel } from 'vue'

const props = defineProps(['modelValue'])

// transform：写入前自动 trim
const tag = useModel(props, 'modelValue', {
  transform: (v) => (typeof v === 'string' ? v.trim() : v),
})
</script>

<style scoped>
.child input { padding: 4px 8px; }
</style>
