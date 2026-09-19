<template>
  <section class="detail">
    <h3>订单详情 #{{ id }}</h3>
    <p>来源：<code>{{ route.query.from ?? 'unknown' }}</code></p>
    <p>完整路径：<code>{{ route.fullPath }}</code></p>
    <button @click="goBack">返回列表</button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 开启路由 props: true 后，params 会作为 prop 直接注入
const props = defineProps({ id: { type: String, required: true } })
const route = useRoute()
const router = useRouter()

function goBack() {
  // 命名路由也可以写在 push 里
  router.push({ name: 'orders' })
}
</script>

<style scoped>
.detail { border: 1px solid #eaecef; border-radius: 6px; padding: 1rem; background: #f6f8fa; }
.detail button { margin-top: .5rem; padding: .3rem .8rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; }
</style>