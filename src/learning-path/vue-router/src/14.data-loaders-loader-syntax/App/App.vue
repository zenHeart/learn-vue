<template>
  <div class="app">
    <h2>实验性 loader · 数据获取</h2>
    <p class="hint">
      切换路由时,路由记录上注册的 loader 会先并行执行,然后才完成导航。
    </p>
    <nav>
      <RouterLink to="/">订单列表</RouterLink>
      <RouterLink to="/orders/2">订单详情 /orders/2</RouterLink>
      <RouterLink to="/orders/999">不存在的 /orders/999</RouterLink>
    </nav>
    <router-view v-slot="{ Component, route }">
      <Suspense>
        <component :is="Component" :key="route.fullPath" />
        <template #fallback>
          <p class="pending">loader 正在拉取数据...</p>
        </template>
      </Suspense>
    </router-view>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 760px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app nav { display: flex; gap: .8rem; margin: .5rem 0 1rem; }
.app :deep(.pending) { color: #6e7781; font-style: italic; }
.app :deep(table) { border-collapse: collapse; width: 100%; }
.app :deep(th), .app :deep(td) { border: 1px solid #d0d7de; padding: 4px 8px; text-align: left; }
.app :deep(.err) { color: #cf222e; background: #ffebe9; padding: .5rem; border-radius: 4px; }
.app :deep(.card) { border: 1px solid #d0d7de; padding: .8rem; border-radius: 6px; }
.app :deep(button) { padding: .25rem .6rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
