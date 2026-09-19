<template>
  <div class="app">
    <h2>导航前 vs 导航后 vs Suspense</h2>
    <nav>
      <RouterLink v-for="id in [1,2,3]" :key="id" :to="`/articles/${id}/after`">after {{ id }}</RouterLink>
      <RouterLink v-for="id in [1,2,3]" :key="`b-${id}`" :to="`/articles/${id}/before`">before {{ id }}</RouterLink>
      <RouterLink v-for="id in [1,2,3]" :key="`s-${id}`" :to="`/articles/${id}/suspense`">suspense {{ id }}</RouterLink>
    </nav>

    <!-- Suspense 必须包裹可能 async setup 的组件 -->
    <Suspense>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      <template #fallback>
        <div class="loading">加载中…</div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app nav { display: flex; gap: .25rem; flex-wrap: wrap; margin-bottom: 1rem; }
.app nav a { padding: .25rem .5rem; border: 1px solid #d0d7de; border-radius: 4px; color: #0969da; text-decoration: none; font-size: .85em; }
.app nav a.router-link-active { background: #ddf4ff; }
.app :deep(.article) { border: 1px solid #eaecef; border-radius: 6px; padding: 1rem; background: #f6f8fa; }
.app :deep(.article h3) { margin: 0 0 .5rem; }
.app :deep(.loading) { padding: 1rem; color: #57606a; }
</style>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>