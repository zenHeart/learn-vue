<template>
  <article class="article">
    <h3>{{ article.title }}</h3>
    <p>{{ article.body }}</p>
    <p class="hint">由 async setup 配合外层 Suspense 提供加载态</p>
  </article>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { fetchArticle } from './api'

const route = useRoute()
// 直接 await，Vue + Suspense 会接管 pending 状态
const article = await fetchArticle(route.params.id as string)
</script>