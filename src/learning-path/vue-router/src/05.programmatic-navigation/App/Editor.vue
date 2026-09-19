<template>
  <section>
    <h3>编辑器</h3>
    <p>模拟有"未保存草稿"的状态，离开时会被守卫拦截。</p>
    <button @click="markDirty = !markDirty">
      切换草稿状态：{{ markDirty ? '有未保存改动' : '干净' }}
    </button>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const markDirty = ref(false)

onBeforeRouteLeave((to) => {
  if (!markDirty.value) return true
  // 真实场景应当用对话框；这里用 confirm 演示异步确认
  return window.confirm(`草稿未保存，确认前往 ${to.fullPath}?`)
})
</script>