<template>
  <div class="card">
    <header>卡片列表</header>
    <ul>
      <li v-for="(item, index) in items" :key="item">
        <!-- 把插槽作为函数调用，由调用方决定渲染 -->
        <slot :item="item" :index="index" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: string[] }>()

// 给 default 插槽声明形参类型，IDE 会基于此推断消费者 v-slot 的解构参数
defineSlots<{
  default(props: { item: string; index: number }): any
}>()
</script>

<style scoped>
.card { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
header { font-weight: 700; padding-bottom: 6px; border-bottom: 1px solid #eee; }
ul { list-style: none; padding: 6px 0 0; margin: 0; }
li { padding: 3px 0; }
</style>
