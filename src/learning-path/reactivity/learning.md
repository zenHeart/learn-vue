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
    return {
      data
    }
  }
}
</script>

<ClientOnly>
  <LearningPathRepl :data="data"  />
</ClientOnly>

## 响应式 demo 清单

- **24.effectscope-detached-and-parent** — `effectScope(true)` 不被父 scope 收集；`scope.parent` 仅对非 detached 有效；`onScopeDispose(fn, true)` 异步分支静默；SSR 安全的 scope 生命周期。
- **25.use-id-and-template-ref** — Vue 3.5+ `useId()` SSR hydration 稳定 id；`useTemplateRef` 类型推断 + shallowRef；表单 label/input 配对场景。
