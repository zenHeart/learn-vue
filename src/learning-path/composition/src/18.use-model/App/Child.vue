<template>
  <div class="child">
    <input :value="model" @input="model = $event.target.value" />
    <span class="hint">子组件读 props.modelValue</span>
  </div>
</template>

<script setup>
import { useModel } from 'vue'

const props = defineProps(['modelValue'])
// 默认绑 modelValue + update:modelValue
const model = useModel(props, 'modelValue')
</script>

<style scoped>
.child input { padding: 4px 8px; }
.hint { font-size: 11px; color: #94a3b8; margin-left: 6px; }
</style>
