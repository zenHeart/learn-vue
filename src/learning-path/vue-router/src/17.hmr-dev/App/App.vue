<template>
  <div class="app">
    <h2>HMR × RouterView</h2>
    <p class="hint">
      修改 <code>Counter.vue</code> 里的初始值或模板,保存后无需刷新即可看到效果;
      切换到 /profile,再回来,count 不会清零。
    </p>
    <nav>
      <RouterLink to="/">Counter</RouterLink>
      <RouterLink to="/profile">Profile</RouterLink>
    </nav>
    <router-view />
    <p class="hint">
      当前组件: <code>{{ $route.name }}</code>, 完整 path: <code>{{ $route.fullPath }}</code>
    </p>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app :deep(code) { background: #eef1f4; padding: 1px 4px; border-radius: 3px; }
.app nav { display: flex; gap: .8rem; margin: .5rem 0 1rem; }
</style>
