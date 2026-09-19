<template>
  <div class="demo">
    <h2>defineSlots 强类型插槽</h2>

    <section class="card">
      <h3>1. 基础用法：带类型的默认插槽</h3>
      <CardWithTypedSlot :items="['Vue', 'Vite', 'Pinia']">
        <template #default="{ item, index }">
          <span class="badge">{{ index }}. {{ item }}</span>
        </template>
      </CardWithTypedSlot>
    </section>

    <section class="card">
      <h3>2. 多个命名插槽</h3>
      <PageLayout>
        <template #header>
          <strong>页面头部</strong>
        </template>
        <template #default>
          <p>主内容区</p>
        </template>
        <template #footer="{ meta }">
          <span>共 {{ meta.len }} 个项目</span>
        </template>
      </PageLayout>
    </section>

    <section class="card">
      <h3>3. 在 setup 中以 useSlots() 获取</h3>
      <SlotInspector :items="items" />
      <p class="hint">组件内部用 useSlots() 检测哪些插槽被传入</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CardWithTypedSlot from './CardWithTypedSlot.vue'
import PageLayout from './PageLayout.vue'
import SlotInspector from './SlotInspector.vue'

const items = ref<string[]>(['Apple', 'Banana', 'Cherry'])
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0 0; font-size: 12px; color: #888; }
.badge { display: inline-block; padding: 2px 8px; margin: 2px; background: #e6f4ff; border-radius: 4px; font-size: 12px; }
</style>
