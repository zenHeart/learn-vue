<template>
  <div class="params">
    <h3>{{ title }}</h3>
    <p>path: <code>{{ route.path }}</code></p>
    <p>params: <code>{{ route.params }}</code></p>
    <p>query: <code>{{ route.query }}</code></p>
    <p class="hint">
      打开 IDE,把 <code>route.params.id</code> 改成 <code>route.params.name</code> —— 立刻能看到红线。
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => {
  // route.params 在 typed-routes 开启时是 { id: string }
  return route.params.id ? '用户 #' + route.params.id : '首页'
})
</script>
