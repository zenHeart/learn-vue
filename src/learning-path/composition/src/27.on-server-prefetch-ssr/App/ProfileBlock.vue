<template>
  <div class="block">
    <p v-if="profile">
      Profile #{{ uid }}: {{ profile.basic.name }} / 等级 {{ profile.level.rank }}
    </p>
    <p v-else class="hint">加载中...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onServerPrefetch } from 'vue'

const props = defineProps<{ id: number }>()

const profile = ref<{
  basic: { name: string }
  level: { rank: number }
} | null>(null)

const uid = props.id

// 多个 hook：并行等待
onServerPrefetch(async () => {
  await new Promise(r => setTimeout(r, 60))
  profile.value = {
    basic: { name: `Profile ${uid}` },
    level: { rank: 5 },
  }
})

onServerPrefetch(async () => {
  // 模拟第二源数据
  await new Promise(r => setTimeout(r, 30))
  // 也可以更新别的 ref
})
</script>

<style scoped>
.block {
  padding: 8px 12px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 4px;
}
.hint {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}
</style>