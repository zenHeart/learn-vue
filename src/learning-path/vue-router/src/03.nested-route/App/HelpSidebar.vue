<template>
  <aside class="sidebar">
    <h4>需要帮助？</h4>
    <p>本侧栏由命名视图 <code>sidebar</code> 渲染，与主路由切换独立。</p>
    <small>组件挂载于 {{ mountedAt }}</small>
  </aside>
</template>

<script setup>
import { onMounted, ref } from 'vue'
const mountedAt = ref('')
onMounted(() => { mountedAt.value = new Date().toLocaleTimeString() })
</script>