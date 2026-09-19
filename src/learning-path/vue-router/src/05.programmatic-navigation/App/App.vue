<template>
  <div class="app">
    <header>
      <h2>编程式导航</h2>
      <p>栈深度：<strong>{{ stackDepth }}</strong>　当前位置：<code>{{ route.fullPath }}</code></p>
    </header>

    <Toolbar />
    <router-view />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Toolbar from './Toolbar.vue'

const route = useRoute()
// 演示用：用 ref 模拟历史栈深度
const stackDepth = ref(1)
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app :deep(code) { background: #eef1f4; padding: 1px 4px; border-radius: 3px; }
.app :deep(.toolbar) { display: flex; gap: .5rem; flex-wrap: wrap; margin: .5rem 0 1rem; }
.app :deep(.toolbar button) { padding: .35rem .8rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; }
.app :deep(.toolbar button:disabled) { opacity: .5; cursor: not-allowed; }
.app :deep(.log) { background: #f6f8fa; border-radius: 6px; padding: .5rem .75rem; font-family: ui-monospace, monospace; font-size: .85em; margin-top: .75rem; max-height: 160px; overflow: auto; }
</style>