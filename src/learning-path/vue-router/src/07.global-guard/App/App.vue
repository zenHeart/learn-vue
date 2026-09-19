<template>
  <div class="app">
    <h2>全局守卫</h2>
    <p class="hint">
      访问 <RouterLink to="/admin">/admin</RouterLink> 时，守卫会等待异步权限校验
    </p>
    <p>当前 token：<code>{{ token }}</code></p>
    <button @click="login">模拟登录</button>
    <button @click="logout">退出</button>
    <router-view />
  </div>
</template>

<script setup>
import { RouterLink, getCurrentInstance } from 'vue-router'

const token = getCurrentInstance().appContext.config.globalProperties.$tokenStore
function login() { token.value = 'mock-jwt-123' }
function logout() { token.value = '' }
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app :deep(code) { background: #eef1f4; padding: 1px 4px; border-radius: 3px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app button { padding: .35rem .8rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; margin-right: .5rem; }
.app :deep(.admin) { border: 1px solid #1f883d; background: #dafbe1; border-radius: 6px; padding: 1rem; margin-top: 1rem; }
.app :deep(.login) { border: 1px solid #cf222e; background: #ffebe9; border-radius: 6px; padding: 1rem; margin-top: 1rem; }
</style>