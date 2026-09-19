<template>
  <section>
    <h3>文档列表</h3>
    <nav class="list">
      <RouterLink v-for="id in [1,2,3,4,5,6]" :key="id" :to="`/doc/${id}#chapter-2`">
        文档 #{{ id }}（带 hash）
      </RouterLink>
    </nav>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>