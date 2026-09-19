<template>
  <section>
    <h3>文章列表</h3>
    <label>
      筛选: <input v-model="keyword" placeholder="输入关键字" />
    </label>
    <ul>
      <li v-for="p in filtered" :key="p.id">
        <RouterLink :to="`/posts/${p.id}`">{{ p.title }}</RouterLink>
        <input type="checkbox" v-model="picked" :value="p.id" /> 收藏
      </li>
    </ul>
    <p class="hint">已选: {{ picked.length }} 项</p>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

const all = [
  { id: '1', title: 'vue-router 入门' },
  { id: '2', title: 'Pinia 与 setup store' },
  { id: '3', title: 'Transition 实战' },
]

const keyword = ref('')
const picked = ref<string[]>([])

const filtered = computed(() =>
  all.filter((p) => p.title.includes(keyword.value)),
)
</script>
