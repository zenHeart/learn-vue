<script setup>
import { ref, shallowRef, computed } from 'vue'

const ROW_COUNT = 500

function makeRows(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    name: `用户-${i}`,
    score: Math.floor(Math.random() * 100),
    note: `note-${i}`,
  }))
}

const rows = shallowRef(makeRows(ROW_COUNT))
const selectedId = ref(0)
const renderCount = ref(0)

// 用 watchEffect 间接统计重渲染（实际是组件自身 update 计数）
import { watchEffect } from 'vue'
watchEffect(() => {
  // 触发一次响应式收集
  void rows.value
  void selectedId.value
  renderCount.value++
})

const selectedRow = computed(() => rows.value.find(r => r.id === selectedId.value))

function selectRow(id) {
  selectedId.value = id
}

function replaceAll() {
  rows.value = makeRows(ROW_COUNT)
}

function patchFirstOnly() {
  // 只换第一个对象的引用，shallowRef 整体不变；v-memo 因 [item] 引用变了只重渲染第一行
  const next = rows.value.slice()
  next[0] = { ...next[0], score: next[0].score + 1 }
  rows.value = next
}
</script>

<template>
  <div class="demo">
    <p class="badge">v-memo 列表 — 跳过未变化行</p>

    <div class="metrics">
      <div class="metric">
        <span class="label">总行数</span>
        <span class="value">{{ ROW_COUNT }}</span>
      </div>
      <div class="metric">
        <span class="label">选中</span>
        <span class="value">#{{ selectedId }}</span>
      </div>
      <div class="metric">
        <span class="label">render 计数</span>
        <span class="value">{{ renderCount }}</span>
      </div>
    </div>

    <div class="actions">
      <button class="primary" @click="replaceAll">整体替换数据</button>
      <button @click="patchFirstOnly">只改第一行</button>
    </div>

    <ul class="list">
      <li
        v-for="row in rows"
        :key="row.id"
        v-memo="[row, selectedId]"
        :class="{ active: row.id === selectedId }"
        @click="selectRow(row.id)"
      >
        <span class="id">#{{ row.id }}</span>
        <span class="name">{{ row.name }}</span>
        <span class="score">{{ row.score }}</span>
      </li>
    </ul>

    <p class="tip">
      点击某行：v-memo="[row, selectedId]" 让其他行的子树跳过 vnode 创建。
    </p>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; }
.metric { background: #f6f8fa; border-radius: 8px; padding: 8px 10px; }
.label { display: block; font-size: 0.7rem; color: #888; }
.value { display: block; font-size: 1.1rem; font-weight: 700; margin-top: 2px; }
.actions { display: flex; gap: 6px; margin-bottom: 10px; }
button { padding: 5px 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.8rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.list { list-style: none; padding: 0; margin: 0; max-height: 280px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 8px; background: #fff; }
.list li { display: flex; gap: 8px; padding: 6px 10px; border-bottom: 1px solid #f0f0f0; font-size: 0.78rem; cursor: pointer; }
.list li.active { background: #fff8e1; color: #b78103; font-weight: 600; }
.id { color: #888; min-width: 40px; }
.name { flex: 1; }
.score { color: #42b883; }
.tip { font-size: 0.78rem; color: #666; margin: 8px 0 0; }
</style>
