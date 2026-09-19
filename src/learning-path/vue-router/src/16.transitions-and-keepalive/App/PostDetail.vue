<template>
  <section>
    <h3>文章详情 #{{ id }}</h3>
    <p>这里是文章 {{ id }} 的内容。</p>
    <button @click="count++">阅读进度 +1(切走后再切回会清零,因未缓存)</button>
    <p v-if="count > 0">count: {{ count }}</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const id = computed(() => route.params.id as string)
const count = ref(0)
</script>
