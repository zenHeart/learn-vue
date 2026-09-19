<template>
  <article class="user">
    <h3>用户 #{{ route.params.id }}</h3>
    <p>已浏览：<strong>{{ visitCount }}</strong> 次（同一组件实例）</p>
    <button @click="dirty = !dirty">
      切换草稿状态：{{ dirty ? '未保存' : '已保存' }}
    </button>
  </article>
</template>

<script setup>
import { onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import { useRoute } from 'vue-router'
import { record } from './guard-log'
import { ref } from 'vue'

const route = useRoute()
const visitCount = ref(0)
const dirty = ref(false)

// 等价 beforeRouteUpdate：在 setup 中直接声明
onBeforeRouteUpdate((to, from) => {
  record(`onBeforeRouteUpdate ${from.fullPath} -> ${to.fullPath}`)
  visitCount.value += 1
})

// 等价 beforeRouteLeave
onBeforeRouteLeave((to) => {
  if (!dirty.value) return true
  return window.confirm(`草稿未保存，确认前往 ${to.fullPath}?`)
})

// 选项式 beforeRouteEnter 在 setup 中没有直接对应物，需要走 defineExpose + next(vm=>...)
// 这里改用 onMounted + record 做替代演示
import { onMounted } from 'vue'
onMounted(() => {
  record(`onMounted: 用户 ${route.params.id} 组件已创建`)
  visitCount.value = 1
})
</script>