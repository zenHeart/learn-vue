<template>
  <div class="app">
    <h2>路由懒加载</h2>
    <p class="hint">观察 Network：每个报表独立切分，首屏只下载 Home chunk</p>
    <nav>
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/dashboard">仪表盘</RouterLink>
      <RouterLink to="/reports">报表</RouterLink>
      <RouterLink to="/heavy">重型组件</RouterLink>
    </nav>

    <Suspense>
      <router-view />
      <template #fallback>
        <div class="loading">分包加载中…</div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app nav { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1rem; }
.app nav a { padding: .25rem .6rem; border: 1px solid #d0d7de; border-radius: 4px; color: #0969da; text-decoration: none; }
.app nav a.router-link-active { background: #ddf4ff; }
.app :deep(.loading) { padding: 1rem; color: #57606a; }
.app :deep(.card) { border: 1px solid #eaecef; border-radius: 6px; padding: 1rem; background: #f6f8fa; }
.app :deep(.bar) { height: 8px; background: #ddf4ff; border-radius: 4px; margin: .25rem 0; }
.app :deep(.heavy) { background: #fff8c5; padding: 1rem; border: 1px solid #d4a72c; border-radius: 6px; }
</style>