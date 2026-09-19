<template>
  <div class="block">
    <p v-if="error" class="error">错误: {{ error }}</p>
    <p v-else-if="user">用户名: <strong>{{ user.name }}</strong></p>
    <p v-else class="hint">加载中...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onServerPrefetch } from 'vue'

const props = defineProps<{ id: number }>()

const user = ref<{ name: string } | null>(null)
const error = ref<string | null>(null)

onServerPrefetch(async () => {
  try {
    // 模拟 fetch
    await new Promise(r => setTimeout(r, 50))
    user.value = { name: `用户 #${props.id}` }
  } catch (e: any) {
    error.value = e.message
  }
})
</script>

<style scoped>
.block {
  padding: 8px 12px;
  background: #ecfeff;
  border: 1px solid #67e8f9;
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