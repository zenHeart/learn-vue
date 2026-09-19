<script setup lang="ts">
import { shallowRef } from 'vue'
import { createOrderBook } from './model.js'
const book = createOrderBook()
const customer = shallowRef('示例客户'), amount = shallowRef(100), role = shallowRef('operator')
const orders = shallowRef(book.list()), feedback = shallowRef('先预测：操作员能否直接审核订单？')
function act(action: () => void) {
  try { action(); orders.value = book.list(); feedback.value = '操作完成，请核对状态与版本' }
  catch (e) { feedback.value = e instanceof Error ? e.message : String(e) }
}
</script>
<template>
  <h2>订单审核 · 本地教学模型</h2>
  <p>本例验证前端状态边界，不提供服务端鉴权或持久化。</p>
  <form @submit.prevent="act(() => book.submit(customer, Number(amount)))">
    <label>客户 <input v-model="customer" /></label>
    <label>金额 <input v-model.number="amount" type="number" step="0.01" /></label>
    <button>创建订单</button>
  </form>
  <label>当前角色 <select v-model="role"><option value="operator">操作员</option><option value="reviewer">审核员</option></select></label>
  <p role="status">{{ feedback }}</p>
  <p v-if="!orders.length">暂无订单，请创建第一笔。</p>
  <ul><li v-for="order in orders" :key="order.id">{{ order.customer }} / {{ order.amount }} / {{ order.status }} / v{{ order.version }} <button @click="act(() => book.approve(order.id, role, order.version))">审核</button></li></ul>
</template>
