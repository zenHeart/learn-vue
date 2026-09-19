---
layout: page
title: 任务案例交互练习
aside: false
footer: false
returnToTop: false
---
<script setup>
import { defineAsyncComponent } from 'vue'
import ReplLoading from '@theme/components/ReplLoading.vue'
import { data } from './topic.data'
const LearningPathRepl = defineAsyncComponent({
  loader: () => import('@theme/components/Vue3Repl/index.vue'),
  loadingComponent: ReplLoading
})
</script>

<ClientOnly>
  <LearningPathRepl path="cases" :data="data" />
</ClientOnly>
