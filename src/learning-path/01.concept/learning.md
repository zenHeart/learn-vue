---
layout: page
aside: false
footer: false
returnToTop: false
---


<script>
import { defineAsyncComponent, onMounted } from 'vue'
import ReplLoading from '@theme/components/ReplLoading.vue'
import { data } from './topic.data'


export default {
  components: {
    LearningPathRepl: defineAsyncComponent({
      loader: () => import('@theme/components/Vue3Repl/index.vue'),
      loadingComponent: ReplLoading
    })
  },
  setup() {
    onMounted(() => {
      console.log('Reactivity path data:', data)
    })
    return {
      data
    }
  }
}
</script>

<ClientOnly>
  <LearningPathRepl :data="data"  />
</ClientOnly>
