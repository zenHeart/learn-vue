<template>
  <section class="display">
    <h4>子组件</h4>
    <p>接收到的 count：<strong>{{ count }}</strong></p>
    <p>接收到的 label：<strong>{{ label }}</strong></p>
    <p class="hint">watch 触发次数：{{ watchCount }}</p>
  </section>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'

// Vue 3.5+ 直接解构仍保持响应式
const { count, label = '默认标签' } = defineProps<{
  count: number
  label?: string
}>()

const watchCount = ref(0)
watchEffect(() => {
  // 直接读取 count / label，无需 () => props.count 包装
  void count
  void label
  watchCount.value++
})
</script>

<style scoped>
.display {
  padding: 12px;
  background: #ecfeff;
  border-radius: 6px;
  font-size: 13px;
}
h4 { margin: 0 0 6px; font-size: 14px; }
.hint { font-size: 11px; color: #64748b; margin-top: 6px; }
strong { color: #0e7490; }
</style>