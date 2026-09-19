<template>
  <div class="app">
    <h2>Setup Store</h2>
    <p class="hint">访问 store.items 不需要 .value —— Pinia 自动解包 ref</p>

    <ul>
      <li v-for="p in products" :key="p.id">
        {{ p.name }}（{{ p.price }} 元）
        <button @click="cart.add(p)">加入购物车</button>
      </li>
    </ul>

    <section class="summary">
      <p>商品总数：<strong>{{ cart.totalQty }}</strong></p>
      <p>小计：<strong>{{ cart.subtotal }}</strong> 元</p>
      <button @click="cart.clear()">清空</button>
    </section>

    <details>
      <summary>当前 store.items（JSON）</summary>
      <pre>{{ JSON.stringify(cart.items, null, 2) }}</pre>
    </details>
  </div>
</template>

<script setup>
import { useCartStore } from './store'

const cart = useCartStore()
const products = [
  { id: 1, name: 'Vue 实战', price: 99, qty: 1 },
  { id: 2, name: 'Pinia 指南', price: 49, qty: 1 },
  { id: 3, name: 'VitePress 笔记', price: 39, qty: 1 },
]
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 640px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app ul { list-style: none; padding: 0; }
.app li { display: flex; justify-content: space-between; align-items: center; padding: .25rem 0; border-bottom: 1px solid #eaecef; }
.app button { padding: .25rem .6rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; }
.app .summary { margin-top: 1rem; padding: .75rem; background: #f6f8fa; border-radius: 6px; }
.app details { margin-top: 1rem; }
.app pre { background: #f6f8fa; padding: .5rem; border-radius: 6px; font-size: .8em; }
</style>