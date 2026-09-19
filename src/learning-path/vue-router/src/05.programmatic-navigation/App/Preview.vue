<template>
  <section>
    <h3>预览页 #{{ route.params.draftId }}</h3>
    <p>token：<code>{{ route.query.token ?? '(none)' }}</code></p>
  </section>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>