<template>
  <div class="app">
    <h2>嵌套路由 + 命名视图</h2>
    <p class="hint">父路由 <code>/settings</code> 负责主区，命名视图 <code>sidebar</code> 负责侧栏</p>
    <router-view />
    <router-view name="sidebar" />
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app :deep(.layout) { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-top: 1rem; }
.app :deep(.layout > .pane) { border: 1px solid #eaecef; border-radius: 6px; padding: 1rem; background: #fff; }
.app :deep(.layout > .sidebar) { background: #f6f8fa; }
.app :deep(nav.tabs) { display: flex; gap: .5rem; margin-bottom: 1rem; }
.app :deep(nav.tabs a) { padding: .25rem .6rem; border-radius: 4px; color: #0969da; text-decoration: none; border: 1px solid transparent; }
.app :deep(nav.tabs a.router-link-active) { background: #ddf4ff; border-color: #b6e3ff; }
.app :deep(code) { background: #eef1f4; padding: 1px 4px; border-radius: 3px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
</style>