<template>
  <div class="default">
    <p>items.length = {{ items.length }}</p>
    <p>items === otherItems ? {{ String(items === otherItems) }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

// 数组默认值必须用工厂函数：避免多实例共享同一引用
withDefaults(
  defineProps<{
    items?: number[]
  }>(),
  {
    items: () => [Math.random()],
  },
)

// 演示两个实例：每次 new 一个组件实例时，default 工厂都会返回新数组
// （对比另一个组件实例）
</script>

<style scoped>
.default { padding: 8px; background: #fff; border-radius: 4px; border: 1px solid #e5e5e5; }
</style>
