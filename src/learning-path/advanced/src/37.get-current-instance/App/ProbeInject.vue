<template>
  <div class="probe-inject">
    <p>通过 inject 拿到：{{ fromInj }}</p>
    <p>通过 inst.setupState 拿到：{{ fromInst }}</p>
    <p>fall-through attrs（useAttrs）：{{ attrs }}</p>
  </div>
</template>

<script setup lang="ts">
import { inject, useAttrs, getCurrentInstance } from 'vue'

// 推荐方式
const fromInj = inject('demoKey', 'fallback')
// 兜底：直接从内部实例拿
const inst = getCurrentInstance()!
const fromInst = (inst.provides as any).demoKey ?? '(无)'
// useAttrs 内部就是 inst.attrs
const attrs = useAttrs()
</script>

<style scoped>
.probe-inject { padding: 10px 14px; background: #fff; border: 1px solid #e5e5e5; border-radius: 6px; font-size: 13px; }
.probe-inject p { margin: 0 0 4px; }
</style>