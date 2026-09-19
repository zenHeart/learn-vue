<template>
  <div class="demo">
    <header>
      <h2>动态路由参数</h2>
      <p>路径 <code>/user/:id</code> 与 <code>/user/:id/post/:postId</code></p>
    </header>

    <nav>
      <RouterLink v-for="i in [1, 2, 3]" :key="i" :to="`/user/${i}`">
        用户 {{ i }}
      </RouterLink>
      <RouterLink to="/user/42/post/2024">复合参数</RouterLink>
      <RouterLink to="/does-not-exist">404</RouterLink>
    </nav>

    <!-- route 是响应式对象，组件内任何依赖都会跟随 URL 变化 -->
    <User />
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import User from './User.vue'
</script>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 1rem; }
header h2 { margin: 0 0 .25rem; }
nav { display: flex; gap: .5rem; flex-wrap: wrap; margin: .75rem 0 1rem; }
nav a { padding: .25rem .6rem; border: 1px solid #d0d7de; border-radius: 4px; color: #0969da; text-decoration: none; }
nav a.router-link-active { background: #ddf4ff; }
</style>