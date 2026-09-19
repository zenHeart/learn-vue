<template>
  <div class="demo">
    <h2>作用域插槽 v-memo 缓存</h2>

    <section class="card">
      <h3>1. 不使用 v-memo (每次 render 都执行)</h3>
      <button @click="otherState++">其他状态 +1 ({{ otherState }})</button>
      <HeavyList :items="items">
        <template #default="{ item }">
          <span>callCount = {{ counters[item.id] }}</span>
          <Heavy :item="item" />
        </template>
      </HeavyList>
    </section>

    <section class="card">
      <h3>2. 使用 v-memo (只有 item.version 变化才执行)</h3>
      <button @click="bumpVersion">bump 全部 version</button>
      <button @click="otherState2++">otherState +1 ({{ otherState2 }})</button>
      <HeavyList :items="items">
        <template #default="{ item }" v-memo="[item.version]">
          <span>memoCallCount = {{ memoCounters[item.id] }}</span>
          <Heavy :item="item" />
        </template>
      </HeavyList>
      <p class="hint">otherState 变化但 item.version 不变时，插槽不会重渲染</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import HeavyList from './HeavyList.vue'
import Heavy from './Heavy.vue'

interface Item { id: number; name: string; version: number }
const items = ref<Item[]>([
  { id: 1, name: 'A', version: 1 },
  { id: 2, name: 'B', version: 1 },
  { id: 3, name: 'C', version: 1 },
])

const otherState = ref(0)
const otherState2 = ref(0)

// 模拟计数器：每次插槽执行 +1
const counters = reactive<Record<number, number>>({})
const memoCounters = reactive<Record<number, number>>({})

const bumpVersion = () => {
  items.value = items.value.map((i) => ({ ...i, version: i.version + 1 }))
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0 0; font-size: 12px; color: #888; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; margin-right: 6px; }
span { display: inline-block; margin-right: 6px; padding: 2px 6px; background: #fafafa; border: 1px dashed #ccc; border-radius: 3px; font-size: 11px; }
</style>
