<template>
  <section class="child">
    <h5>子组件（接收 prop：{{ count }}）</h5>
    <p>子组件内部 DOM 渲染完成</p>
  </section>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue'

const props = defineProps<{ count: number }>()

function record(s: string) {
  // 推到 window 上由父组件收集（简化跨组件日志收集）
  ;(window as any).__lifeLog = (window as any).__lifeLog ?? []
  ;(window as any).__lifeLog.push(s)
}

onBeforeMount(() => record('[child] beforeMount'))
onMounted(() => record('[child] mounted'))
onBeforeUpdate(() => record(`[child] beforeUpdate (count=${props.count})`))
onUpdated(() => record(`[child] updated (count=${props.count})`))
onBeforeUnmount(() => record('[child] beforeUnmount'))
onUnmounted(() => record('[child] unmounted'))
</script>

<style scoped>
.child {
  padding: 10px 12px;
  background: #fef3c7;
  border-radius: 6px;
  margin-top: 8px;
  font-size: 13px;
}
h5 { margin: 0 0 4px; font-size: 13px; }
p { margin: 0; color: #92400e; }
</style>