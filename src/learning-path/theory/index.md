---
page: true
title: Vue 理论基础学习路径
aside: false
footer: false
returnToTop: false
---

<script>
import { defineAsyncComponent } from 'vue'
import ReplLoading from '@theme/components/ReplLoading.vue'
import { data } from './topic.data'

export default {
  components: {
    LearningPathRepl: defineAsyncComponent({
      loader: () => import('@theme/components/Vue3Repl/index.vue'),
      loadingComponent: ReplLoading
    })
  },
  provide() {
    return {
      learningPathData: data
    }
  }
}
</script>

<ClientOnly>
  <LearningPathRepl path="theory" :data="data" />
</ClientOnly>
