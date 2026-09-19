<template>
  <div class="app">
    <h2>Action 与异步</h2>
    <p class="hint">loading / error / data 三态，store.load(2) 会失败</p>

    <button :disabled="user.loading" @click="user.load(1)">加载用户 1</button>
    <button :disabled="user.loading" @click="user.load(2, true)">加载用户 2（模拟失败）</button>

    <section class="status">
      <p v-if="user.loading">加载中…</p>
      <p v-else-if="user.error" class="error">{{ user.error }}</p>
      <p v-else-if="user.current">当前：{{ user.current.name }}</p>
      <p v-else>尚未加载</p>
    </section>
  </div>
</template>

<script setup>
import { useUserStore } from './store'
const user = useUserStore()
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 640px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app button { padding: .35rem .8rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; margin-right: .25rem; }
.app button:disabled { opacity: .5; cursor: not-allowed; }
.app .status { margin-top: 1rem; padding: .75rem; border: 1px solid #eaecef; border-radius: 6px; background: #f6f8fa; }
.app .error { color: #cf222e; }
</style>