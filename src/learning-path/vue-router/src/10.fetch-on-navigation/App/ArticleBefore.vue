<template>
  <article class="article">
    <h3>{{ article?.title }}</h3>
    <p>{{ article?.body }}</p>
  </article>
</template>

<script setup>
import { ref } from 'vue'
import { fetchArticle } from './api'

const article = ref<Awaited<ReturnType<typeof fetchArticle>> | null>(null)

// beforeRouteEnter 在组件实例化前触发；通过 next(vm => ...) 把数据塞到组件实例
defineExpose({
  async setData(payload: Awaited<ReturnType<typeof fetchArticle>>) {
    article.value = payload
  },
})

// 选项式守卫在 setup 中需要用 beforeRouteEnter 包装并通过 next 回调
import { defineComponent } from 'vue'
;(await import('vue-router')).onBeforeRouteEnter?.(() => {})
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { fetchArticle } from './api'

// 在 <script> 中（非 setup）注册 beforeRouteEnter
export default defineComponent({
  async beforeRouteEnter(to, _from, next) {
    const data = await fetchArticle(to.params.id as string)
    next((vm: any) => vm.setData(data))
  },
})
</script>