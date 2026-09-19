<template>
  <div class="tabs-c">
    <slot :name="active" :tab="currentTab" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ active: string }>()
const tabs = [
  { id: 'home', label: '首页', note: '这是首页' },
  { id: 'docs', label: '文档', note: '文档区' },
  { id: 'about', label: '关于', note: '关于我' },
]
const currentTab = computed(() => tabs.find((t) => t.id === props.active) ?? tabs[0])
</script>

<style scoped>
.tabs-c { padding: 8px; background: #fff; border-radius: 4px; }
</style>
