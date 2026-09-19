<template>
  <article class="doc">
    <h3>文档 #{{ id }}</h3>
    <p>滚动本页面到下方，再点击浏览器后退观察 savedPosition 行为。</p>
    <p class="anchor" id="chapter-1">第一章</p>
    <p class="anchor" id="chapter-2">第二章</p>
    <p class="anchor" id="chapter-3">第三章</p>
    <button @click="$router.back()">浏览器后退</button>
  </article>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id
</script>