<template>
  <div class="app">
    <h2>命名路由 vs 路径字符串</h2>
    <p class="hint">两条导航最终都到 <code>/orders/:id</code>，但维护性天差地别</p>
    <router-view />
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app :deep(code) { background: #eef1f4; padding: 1px 4px; border-radius: 3px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app :deep(.row) { display: flex; gap: .5rem; flex-wrap: wrap; }
.app :deep(.row a) { padding: .25rem .6rem; border-radius: 4px; color: #0969da; text-decoration: none; border: 1px solid #d0d7de; }
.app :deep(.row a.router-link-active) { background: #ddf4ff; }
</style>