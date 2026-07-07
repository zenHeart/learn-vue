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
      loader: () => import('@theme/components/Vue2Repl/index.vue'),
      loadingComponent: ReplLoading
    })
  },
  setup() {
    return {
      data
    }
  }
}
</script>

<ClientOnly>
  <LearningPathRepl :data="data"  />
</ClientOnly>
