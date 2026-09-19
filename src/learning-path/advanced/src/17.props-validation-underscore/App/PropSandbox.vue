<template>
  <div class="sandbox">
    <p>label = {{ label }}</p>
    <p>visible = {{ visible }}</p>
    <p>检查 props keys：<code>{{ Object.keys(inspect).join(', ') }}</code></p>
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'

defineProps<{
  visible: boolean
  label: string
}>()

// 故意不接收 $secret / _private / __v_isRef：Vue 校验时会丢弃
const attrs = useAttrs()
const inspect = attrs
</script>

<style scoped>
.sandbox { padding: 8px; background: #fff; border-radius: 4px; border: 1px solid #e5e5e5; }
code { background: #f6f8fa; padding: 1px 4px; border-radius: 3px; }
</style>
