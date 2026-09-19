<template>
  <article class="article">
    <p v-if="loading">加载中…</p>
    <template v-else-if="article">
      <h3>{{ article.title }}</h3>
      <p>{{ article.body }}</p>
    </template>
  </article>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchArticle } from './api'

const route = useRoute()
const article = ref<Awaited<ReturnType<typeof fetchArticle>> | null>(null)
const loading = ref(false)

async function load(id: string | number) {
  loading.value = true
  try {
    article.value = await fetchArticle(id)
  } finally {
    loading.value = false
  }
}

onMounted(() => load(route.params.id))

// 路由参数变化时同样要重新拉取
watch(() => route.params.id, (next) => load(next))
</script>