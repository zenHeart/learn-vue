<script setup>
import { computed, reactive, ref } from 'vue'
import {
  buildManyItems,
  buildProjectionOptimized,
  countProjectionDeps,
  createListStore,
  DEMO_FIELD_COUNT,
  DEMO_ITEM_COUNT,
  measureOnce,
  mergeItems,
} from './listProjectionModel.js'

const store = reactive(createListStore())
mergeItems(store, buildManyItems())

// ✅ 优化写法：toRaw 浅拷贝 + 保留 memberList 引用
const list = computed(() => buildProjectionOptimized(store))

const depCount = ref(null)
const runMs = ref(null)

function countDeps() {
  depCount.value = countProjectionDeps(buildProjectionOptimized, store)
}

function measure() {
  runMs.value = measureOnce(buildProjectionOptimized, store)
  countDeps()
}
</script>

<template>
  <div class="demo">
    <p class="badge good">② 优化代码 — toRaw 快照派生</p>

    <p class="meta">
      数据规模：<strong>{{ DEMO_ITEM_COUNT }}</strong> 条 ×
      <strong>{{ DEMO_FIELD_COUNT }}</strong> 字段
    </p>

    <div class="metrics">
      <div class="metric">
        <span class="label">computed 依赖数</span>
        <span class="value good-text">{{ depCount ?? '—' }}</span>
      </div>
      <div class="metric">
        <span class="label">单次求值耗时</span>
        <span class="value">{{ runMs != null ? `${runMs.toFixed(3)} ms` : '—' }}</span>
      </div>
    </div>

    <div class="actions">
      <button @click="countDeps">统计依赖数</button>
      <button class="primary" @click="measure">测一次耗时</button>
    </div>

    <ul class="preview">
      <li v-for="row in list.slice(0, 5)" :key="row.id">
        {{ row.title }} · {{ row.userList?.length ?? 0 }} 人
      </li>
    </ul>

    <p class="tip">依赖数应明显低于 ①。关键改动在 listProjectionModel.js 的 buildProjectionOptimized。</p>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 420px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.82rem; font-weight: 600; margin: 0 0 10px; }
.badge.good { background: #e8f8f0; color: #27ae60; }
.meta { font-size: 0.85rem; color: #666; margin: 0 0 12px; }
.metrics { display: flex; gap: 10px; margin-bottom: 12px; }
.metric { flex: 1; background: #f6f8fa; border-radius: 8px; padding: 10px; }
.label { display: block; font-size: 0.72rem; color: #888; }
.value { display: block; font-size: 1.4rem; font-weight: 700; margin-top: 4px; }
.good-text { color: #27ae60; }
.actions { display: flex; gap: 8px; margin-bottom: 12px; }
button { padding: 6px 14px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.85rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.preview { margin: 0; padding-left: 1.2rem; font-size: 0.85rem; line-height: 1.8; }
.tip { font-size: 0.8rem; color: #888; margin: 12px 0 0; }
</style>
