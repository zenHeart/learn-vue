<template>
  <div class="demo">
    <h2>动态插槽名</h2>

    <section class="card">
      <h3>1. 单个动态插槽</h3>
      <div class="tabs">
        <button v-for="t in tabs" :key="t.id" :class="{ active: active === t.id }" @click="active = t.id">
          {{ t.label }}
        </button>
      </div>
      <Tabs :active="active">
        <template #[active]>
          <div class="content">当前激活: <strong>{{ active }}</strong></div>
        </template>
      </Tabs>
    </section>

    <section class="card">
      <h3>2. 动态拼接插槽名</h3>
      <div class="tabs">
        <button v-for="t in tabs" :key="t.id" :class="{ active: active === t.id }" @click="active = t.id">
          {{ t.label }}
        </button>
      </div>
      <Tabs2 :active="active">
        <template #[dynamicSlotName]>
          <p class="content">拼接后的插槽名: {{ dynamicSlotName }}</p>
        </template>
      </Tabs2>
    </section>

    <section class="card">
      <h3>3. 父组件控制 slot props</h3>
      <Tabs :active="active">
        <template #[active]="{ tab }">
          <p>{{ tab.label }} - <em>{{ tab.note }}</em></p>
        </template>
      </Tabs>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Tabs from './Tabs.vue'
import Tabs2 from './Tabs2.vue'

const tabs = [
  { id: 'home', label: '首页', note: '这是首页' },
  { id: 'docs', label: '文档', note: '文档区' },
  { id: 'about', label: '关于', note: '关于我' },
]
const active = ref('home')
const dynamicSlotName = computed(() => `tab-${active.value}`)
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.tabs { display: flex; gap: 6px; margin-bottom: 8px; }
.tabs button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
.tabs button.active { background: #1677ff; color: #fff; border-color: #1677ff; }
.content { padding: 8px 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
</style>
