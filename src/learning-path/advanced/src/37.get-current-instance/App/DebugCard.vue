<template>
  <div class="debug-card">
    <p>{{ label }}：count = {{ count }}</p>
    <p>local = {{ local }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue'

defineProps<{ count: number; label: string }>()
const local = ref('私有 ref')

const inst = getCurrentInstance()!

onMounted(() => {
  // 这里也能访问内部实例
  console.group('[DebugCard] getCurrentInstance')
  console.log('type.name:', inst.type.name)
  console.log('props:', inst.props)
  console.log('setupState:', inst.setupState)
  console.log('appContext.config keys:', Object.keys(inst.appContext.config))
  console.log('uid:', inst.uid)
  console.groupEnd()
})
</script>

<style scoped>
.debug-card { padding: 10px 14px; background: #fff; border: 1px solid #e5e5e5; border-radius: 6px; }
.debug-card p { margin: 0 0 4px; font-size: 13px; }
</style>