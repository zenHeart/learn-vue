<template>
  <section class="secret">
    <h3>订单 {{ route.params.id }} 的保密字段</h3>
    <p>毛利率、采购价、买家邮箱……</p>
  </section>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>