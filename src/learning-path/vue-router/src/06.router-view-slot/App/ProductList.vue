<template>
  <nav class="list">
    <RouterLink v-for="p in products" :key="p.id" :to="`/products/${p.id}`">
      {{ p.name }}
    </RouterLink>
    <RouterLink to="/products">返回列表</RouterLink>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
const products = [
  { id: 1, name: '商品 A' },
  { id: 2, name: '商品 B' },
  { id: 3, name: '商品 C' },
]
</script>