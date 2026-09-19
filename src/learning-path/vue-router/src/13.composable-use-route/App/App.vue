<template>
  <div class="app">
    <h2>useRoute 的组合式封装</h2>
    <p class="hint">本页所有 query 都通过 <code>useRouteQueryNumber</code> / <code>useRouteQueryString</code> 访问</p>
    <router-view />
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app :deep(.search) { background: #f6f8fa; padding: 1rem; border-radius: 6px; }
.app :deep(input) { padding: .35rem .6rem; border: 1px solid #d0d7de; border-radius: 4px; }
.app :deep(.row) { display: flex; gap: .5rem; margin: .5rem 0; }
.app :deep(.result) { border-top: 1px solid #eaecef; padding-top: .75rem; }
.app :deep(button) { padding: .35rem .8rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; }
</style>