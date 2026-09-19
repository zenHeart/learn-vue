<template>
  <section class="user">
    <p>当前 URL：<code>{{ route.fullPath }}</code></p>
    <h3>用户档案 #{{ route.params.id }}</h3>
    <p v-if="route.params.postId">
      正在查看文章 <strong>{{ route.params.postId }}</strong>
    </p>
    <p class="hint">
      组件挂载时间：{{ mountedAt }}
      <span v-if="remounted" class="badge">已重新挂载</span>
    </p>
    <p class="meta">
      通过 <code>route.params</code> 访问，值为 <code>{{ paramsSnapshot }}</code>
    </p>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'

const route = useRoute()
const mountedAt = ref('')
const remounted = ref(false)
const paramsSnapshot = ref({})

onMounted(() => {
  mountedAt.value = new Date().toLocaleTimeString()
  paramsSnapshot.value = { ...route.params }
})

// 同一个组件实例在不同参数间切换：onMounted 不会再触发，需要在这里响应变化
onBeforeRouteUpdate((to, from) => {
  console.log('[onBeforeRouteUpdate]', from.fullPath, '->', to.fullPath)
  paramsSnapshot.value = { ...to.params }
})

watch(
  () => route.params,
  (next) => {
    console.log('[watch route.params]', next)
  },
)

onBeforeUnmount(() => {
  // 切到其它路由导致组件卸载时才会进入；同组件复用不会触发
  remounted.value = true
})
</script>

<style scoped>
.user { border: 1px solid #eaecef; border-radius: 6px; padding: 1rem; background: #f6f8fa; }
.badge { background: #ffd33d; color: #1f2328; padding: 1px 6px; border-radius: 3px; font-size: .8em; margin-left: .5rem; }
code { background: #eef1f4; padding: 1px 4px; border-radius: 3px; }
.meta { color: #57606a; font-size: .9em; }
</style>