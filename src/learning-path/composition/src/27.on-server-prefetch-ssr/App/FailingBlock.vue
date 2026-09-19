<template>
  <div class="block">
    <p v-if="data">数据: <code>{{ data.value }}</code></p>
    <p v-else-if="caught" class="error">已捕获: {{ caught }}</p>
    <p v-else class="hint">加载中...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onServerPrefetch } from 'vue'

const props = defineProps<{ id: number }>()

const data = ref<{ value: string } | null>(null)
const caught = ref<string | null>(null)

onServerPrefetch(async () => {
  try {
    await new Promise((_, reject) => setTimeout(() => reject(new Error('mock 500')), 30))
    data.value = { value: 'never' }
  } catch (e: any) {
    caught.value = e.message
  }
})
</script>

<style scoped>
.block {
  padding: 8px 12px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 4px;
}
.hint {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}
.error {
  margin: 0;
  color: #b91c1c;
}
</style>