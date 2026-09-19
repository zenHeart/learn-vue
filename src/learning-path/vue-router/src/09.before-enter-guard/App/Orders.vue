<template>
  <section>
    <p v-if="route.query.denied" class="denied">
      访问 <code>{{ route.query.denied }}</code> 被守卫拒绝，角色不足。
    </p>
    <h3>订单列表</h3>
    <nav class="orders">
      <RouterLink v-for="id in [101, 102]" :key="id" :to="`/orders/${id}/secret`">
        订单 {{ id }} 的保密信息
      </RouterLink>
    </nav>
  </section>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'
const route = useRoute()
</script>