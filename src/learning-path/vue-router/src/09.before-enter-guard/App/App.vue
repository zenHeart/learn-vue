<template>
  <div class="app">
    <h2>路由独享守卫</h2>
    <p class="hint">
      模拟角色切换。当前角色：<code>{{ role }}</code>
      <button @click="role = 'guest'">设为 guest</button>
      <button @click="role = 'manager'">设为 manager</button>
    </p>
    <router-view />
  </div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'

const vm = getCurrentInstance()
const setRole = vm.appContext.config.globalProperties.$setRole

const role = computed({
  get: () => sessionStorage.getItem('role') || 'guest',
  set: (val) => setRole(val),
})

import { watch } from 'vue'
watch(role, (val) => console.log('[role] ->', val))
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app :deep(code) { background: #eef1f4; padding: 1px 4px; border-radius: 3px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; margin-bottom: .5rem; }
.app button { padding: .25rem .6rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; margin-left: .25rem; }
.app :deep(.orders) { display: flex; gap: .5rem; flex-wrap: wrap; }
.app :deep(.orders a) { padding: .25rem .6rem; border: 1px solid #d0d7de; border-radius: 4px; color: #0969da; text-decoration: none; }
.app :deep(.orders a.router-link-active) { background: #ddf4ff; }
.app :deep(.secret) { background: #fff8c5; border: 1px solid #d4a72c; padding: 1rem; border-radius: 6px; }
.app :deep(.denied) { background: #ffebe9; border: 1px solid #cf222e; padding: .5rem .75rem; border-radius: 6px; color: #cf222e; }
</style>