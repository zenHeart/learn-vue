<template>
  <div class="app">
    <h2>滚动行为</h2>
    <p class="hint">点击列表条目 → 详情 → 浏览器后退，观察滚动位置还原</p>
    <router-view />
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app :deep(.list) { display: flex; flex-direction: column; gap: .25rem; }
.app :deep(.list a) { padding: .5rem .75rem; border: 1px solid #d0d7de; border-radius: 4px; color: #0969da; text-decoration: none; }
.app :deep(.list a.router-link-active) { background: #ddf4ff; }
.app :deep(.doc) { padding: 1rem; background: #f6f8fa; border-radius: 6px; }
.app :deep(.doc h3) { margin-top: 0; }
.app :deep(.anchor) { padding-top: 600px; }
</style>