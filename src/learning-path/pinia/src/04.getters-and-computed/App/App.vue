<template>
  <div class="app">
    <h2>getters 与 computed</h2>
    <p class="hint">总数：{{ catalog.totalCount }}，均价：{{ catalog.avgPrice.toFixed(1) }}</p>

    <h4>所有商品</h4>
    <ul>
      <li v-for="p in catalog.products" :key="p.id">
        {{ p.name }}（{{ p.category }}）— {{ p.price }} 元
      </li>
    </ul>

    <h4>byCategory('book') —— 参数化 selector</h4>
    <ul>
      <li v-for="p in catalog.byCategory('book')" :key="p.id">{{ p.name }}</li>
    </ul>

    <h4>findById(3)</h4>
    <p>id=3 对应：<code>{{ catalog.findById(3)?.name ?? '不存在' }}</code></p>
  </div>
</template>

<script setup>
import { useCatalogStore } from './store'
const catalog = useCatalogStore()
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 640px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app ul { padding-left: 1.25rem; }
.app code { background: #eef1f4; padding: 1px 4px; border-radius: 3px; }
.app h4 { margin-bottom: .25rem; }
</style>