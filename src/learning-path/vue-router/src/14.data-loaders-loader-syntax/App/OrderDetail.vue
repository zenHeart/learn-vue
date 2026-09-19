<template>
  <div class="card">
    <h3>订单详情</h3>
    <p v-if="loader.pending.value">拉取中...</p>
    <p v-else-if="loader.error.value" class="err">{{ loader.error.value.message }}</p>
    <pre v-else>{{ loader.data.value }}</pre>
    <button @click="refresh">refresh()</button>
  </div>
</template>

<script setup>
import { orderLoader } from './loaders'

const loader = orderLoader
loader.refresh()
</script>
