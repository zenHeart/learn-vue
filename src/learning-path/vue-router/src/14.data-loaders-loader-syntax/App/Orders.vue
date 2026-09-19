<template>
  <div>
    <button @click="refresh">refresh()</button>
    <p v-if="loader.pending.value">拉取中...</p>
    <p v-else-if="loader.error.value" class="err">{{ loader.error.value.message }}</p>
    <table v-else>
      <thead>
        <tr><th>ID</th><th>客户</th><th>金额</th><th /></tr>
      </thead>
      <tbody>
        <tr v-for="o in loader.data.value" :key="o.id">
          <td>{{ o.id }}</td>
          <td>{{ o.customer }}</td>
          <td>{{ o.total }}</td>
          <td><RouterLink :to="`/orders/${o.id}`">查看</RouterLink></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { orderListLoader } from './loaders'

const loader = orderListLoader
// 进入本页即拉一次
loader.refresh()
</script>
