<template>
  <div class="app">
    <h2>router-view 插槽</h2>
    <p class="hint">淡入淡出过渡 + KeepAlive 缓存已访问的商品</p>

    <ProductList />

    <!-- 作用域插槽：拿到 Component 与 route -->
    <router-view v-slot="{ Component, route: r }">
      <transition name="fade" mode="out-in">
        <KeepAlive>
          <!-- key 让每个 productId 各自缓存一份组件状态 -->
          <component :is="Component" :key="r.fullPath" />
        </KeepAlive>
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import ProductList from './ProductList.vue'
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app :deep(.list) { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1rem; }
.app :deep(.list a) { padding: .25rem .6rem; border: 1px solid #d0d7de; border-radius: 4px; color: #0969da; text-decoration: none; }
.app :deep(.list a.router-link-active) { background: #ddf4ff; }
.app :deep(.card) { border: 1px solid #eaecef; border-radius: 6px; padding: 1rem; background: #f6f8fa; }
.app :deep(.scroll) { height: 120px; overflow: auto; background: #fff; border: 1px solid #eaecef; padding: .5rem; }
</style>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>