<template>
  <div class="app">
    <h2>跨 store 调用</h2>
    <p class="hint">点击结账会触发：扣库存 + 扣积分 + 清购物车</p>

    <h4>商品</h4>
    <ul>
      <li v-for="p in products" :key="p.id">
        {{ p.name }}（{{ p.price }} 元，库存：{{ inventory.stock[p.id] ?? 0 }}）
        <button @click="cart.items.push({ id: p.id, qty: 1, price: p.price })">加入购物车</button>
      </li>
    </ul>

    <h4>购物车</h4>
    <p v-if="cart.items.length === 0">空</p>
    <ul v-else>
      <li v-for="(it, i) in cart.items" :key="i">
        商品 {{ it.id }} × {{ it.qty }}
      </li>
    </ul>

    <p>积分余额：<strong>{{ points.balance }}</strong></p>
    <button :disabled="cart.items.length === 0" @click="cart.checkout()">结账</button>
  </div>
</template>

<script setup>
import { useInventoryStore, usePointsStore, useCartStore } from './store'

const inventory = useInventoryStore()
const points = usePointsStore()
const cart = useCartStore()

const products = [
  { id: 1, name: 'Vue 入门', price: 60 },
  { id: 2, name: '键盘', price: 600 },
]
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 640px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app ul { list-style: none; padding: 0; }
.app li { display: flex; justify-content: space-between; padding: .25rem 0; border-bottom: 1px solid #eaecef; }
.app button { padding: .25rem .6rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; }
.app h4 { margin: .75rem 0 .25rem; }
</style>