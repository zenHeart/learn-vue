<template>
  <div class="app">
    <h2>Pinia + Vue Router</h2>
    <nav>
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/admin">控制台</RouterLink>
      <RouterLink to="/login">登录</RouterLink>
    </nav>

    <p class="status">
      当前用户：<code>{{ auth.user?.name ?? '未登录' }}</code>
      <span v-if="auth.isAdmin" class="badge">管理员</span>
    </p>

    <div v-if="auth.isLoggedIn">
      <button @click="auth.logoutAndGoLogin()">退出登录</button>
    </div>

    <router-view />
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from './store'
const auth = useAuthStore()
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 640px; }
.app nav { display: flex; gap: .5rem; margin-bottom: .5rem; }
.app nav a { padding: .25rem .6rem; border: 1px solid #d0d7de; border-radius: 4px; color: #0969da; text-decoration: none; }
.app nav a.router-link-active { background: #ddf4ff; }
.app .status { color: #57606a; }
.app .badge { background: #1f883d; color: #fff; padding: 1px 6px; border-radius: 3px; font-size: .8em; margin-left: .25rem; }
.app button { padding: .25rem .6rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; }
.app :deep(.admin) { background: #dafbe1; border: 1px solid #1f883d; padding: 1rem; border-radius: 6px; }
.app :deep(.login) { background: #f6f8fa; padding: 1rem; border-radius: 6px; }
.app code { background: #eef1f4; padding: 1px 4px; border-radius: 3px; }
</style>