<template>
  <div class="app">
    <h2>组件级守卫</h2>
    <nav>
      <RouterLink v-for="i in [1,2,3]" :key="i" :to="`/user/${i}`">用户 {{ i }}</RouterLink>
      <RouterLink to="/">首页</RouterLink>
    </nav>
    <router-view />
    <h4>守卫日志</h4>
    <ol class="log">
      <li v-for="(line, i) in log" :key="i">{{ line }}</li>
    </ol>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { log } from './guard-log'
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app nav { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1rem; }
.app nav a { padding: .25rem .6rem; border: 1px solid #d0d7de; border-radius: 4px; color: #0969da; text-decoration: none; }
.app nav a.router-link-active { background: #ddf4ff; }
.app .log { background: #f6f8fa; border-radius: 6px; padding: .75rem 1rem; font-family: ui-monospace, monospace; font-size: .85em; max-height: 220px; overflow: auto; }
.app :deep(.user) { border: 1px solid #eaecef; border-radius: 6px; padding: 1rem; background: #fff; margin-bottom: 1rem; }
</style>