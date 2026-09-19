<template>
  <div class="app">
    <h2>Transition × KeepAlive × RouterView</h2>
    <p class="hint">
      在 Posts 页勾选 / 输入筛选项 → 切到详情 → 返回列表:状态被保留,即 KeepAlive 生效。
    </p>
    <nav>
      <RouterLink to="/">文章列表</RouterLink>
      <RouterLink to="/posts/1">文章 1</RouterLink>
      <RouterLink to="/posts/2">文章 2</RouterLink>
      <RouterLink to="/about">关于(不缓存)</RouterLink>
    </nav>

    <router-view v-slot="{ Component, route }">
      <Transition name="fade" mode="out-in">
        <KeepAlive :exclude="excludeNames">
          <component :is="Component" :key="route.fullPath" />
        </KeepAlive>
      </Transition>
    </router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

// 让 /about 路由每次重建实例(meta.keepAlive = false)
const excludeNames = computed(() => ['about'])
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 760px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app nav { display: flex; gap: .8rem; margin: .5rem 0 1rem; }

/* fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
