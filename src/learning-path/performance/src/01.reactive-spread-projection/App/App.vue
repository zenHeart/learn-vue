<template>
  <div class="perf-demo">
    <header class="hero">
      <h1>列表投影性能对比</h1>
      <p class="subtitle">
        虚拟列表分页场景：computed 内 spread 响应式代理 vs toRaw 快照派生
      </p>
    </header>

    <section class="panel controls">
      <label class="switch-row">
        <input v-model="useOptimized" type="checkbox" />
        <span>
          <strong>{{ useOptimized ? '✅ 优化后' : '❌ 优化前' }}</strong>
          — {{ useOptimized ? 'toRaw 快照派生' : 'spread 响应式代理' }}
        </span>
      </label>

      <div class="sliders">
        <label>
          列表项数 {{ itemCount }}
          <input v-model.number="itemCount" type="range" min="10" max="200" step="10" />
        </label>
        <label>
          每项字段数 {{ fieldCount }}
          <input v-model.number="fieldCount" type="range" min="10" max="60" step="5" />
        </label>
      </div>

      <div class="actions">
        <button @click="resetData">重置数据</button>
        <button @click="simulatePagination">模拟分页 +20</button>
        <button @click="simulateFieldUpdate">模拟字段更新</button>
        <button @click="simulateMemberUpdate">模拟成员更新</button>
        <button @click="measureDeps">统计依赖数</button>
        <button class="primary" @click="runBenchmark">基准测试 ×30</button>
      </div>
    </section>

    <section class="panel metrics">
      <h2>实时指标</h2>
      <div class="metric-grid">
        <div class="metric">
          <span class="label">computed 依赖数</span>
          <span class="value" :class="depClass">{{ dependencyCount ?? '—' }}</span>
          <span class="hint">优化后应 &lt; 项数×8</span>
        </div>
        <div class="metric">
          <span class="label">投影重建次数</span>
          <span class="value">{{ rebuildCount }}</span>
        </div>
        <div class="metric">
          <span class="label">基准 avg（×30）</span>
          <span class="value highlight">{{ benchAvgMs.toFixed(3) }} ms</span>
        </div>
        <div class="metric">
          <span class="label">对比倍数</span>
          <span class="value" :class="speedupClass">{{ speedupLabel }}</span>
        </div>
        <div class="metric">
          <span class="label">当前项数</span>
          <span class="value">{{ projection.length }}</span>
        </div>
      </div>
    </section>

    <section class="panel list-panel">
      <h2>投影预览（前 12 条）</h2>
      <ul class="item-list">
        <li v-for="row in preview" :key="row.id" class="item-row">
          <span class="id">#{{ row.id }}</span>
          <span class="text">{{ row.title }}</span>
          <span class="members">{{ row.userList?.length ?? 0 }} 人</span>
          <span class="tag">{{ row.type }}</span>
        </li>
      </ul>
    </section>

    <section class="panel insight">
      <h2>观察要点</h2>
      <ol>
        <li><strong>关闭优化</strong>：依赖数 ≈ 项数 × 字段数</li>
        <li><strong>开启优化</strong>：依赖数降为 O(项数)，基准耗时显著下降</li>
        <li><strong>字段更新</strong>：换对象写入触发重算；成员 splice 不触发整表重建</li>
        <li><strong>语义契约</strong>：toRaw 浅拷贝 + 保留 memberList 响应式引用</li>
      </ol>
    </section>

    <section class="panel refs">
      <h2>延伸阅读</h2>
      <ul class="ref-list">
        <li>
          <a href="https://vuejs.org/guide/best-practices/performance.html" target="_blank" rel="noopener">Vue Performance 指南</a>
        </li>
        <li>
          <a href="https://vuejs.org/api/reactivity-advanced.html#toraw" target="_blank" rel="noopener">toRaw() API</a>
        </li>
        <li>
          <a href="https://vuejs.org/guide/extras/reactivity-in-depth.html#computed-debugging" target="_blank" rel="noopener">Computed Debugging (onTrack)</a>
        </li>
        <li>
          <a href="https://github.com/vuejs/vue/issues/6660" target="_blank" rel="noopener">vue#6660 — computed 依赖累积</a>
        </li>
        <li>
          <a href="https://github.com/vuejs/core/issues/13613" target="_blank" rel="noopener">core#13613 — toRaw 失效边界</a>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  applyItemUpdate,
  benchmarkProjection,
  buildManyItems,
  buildProjectionBad,
  buildProjectionOptimized,
  countProjectionDeps,
  createListStore,
  mergeItems,
  updateMembers,
} from './listProjectionModel.js'

const useOptimized = ref(false)
const itemCount = ref(60)
const fieldCount = ref(40)
const rebuildCount = ref(0)
const dependencyCount = ref(null)
const benchAvgMs = ref(0)
const baselineAvgMs = ref(null)
const optimizedAvgMs = ref(null)

const store = reactive(createListStore())

function getBuildFn() {
  return useOptimized.value ? buildProjectionOptimized : buildProjectionBad
}

function resetData() {
  store.itemMap.clear()
  store.orderedIds.length = 0
  mergeItems(store, buildManyItems(itemCount.value, fieldCount.value))
  rebuildCount.value = 0
  benchAvgMs.value = 0
  dependencyCount.value = null
}

resetData()

watch([itemCount, fieldCount], resetData)

// 纯 computed，无副作用
const projection = computed(() => getBuildFn()(store))

watch(projection, () => {
  rebuildCount.value++
})

const preview = computed(() => projection.value.slice(0, 12))

const depClass = computed(() => {
  if (dependencyCount.value == null) return ''
  return dependencyCount.value > itemCount.value * 8 ? 'bad' : 'good'
})

const speedupLabel = computed(() => {
  if (baselineAvgMs.value && optimizedAvgMs.value) {
    return `${(baselineAvgMs.value / optimizedAvgMs.value).toFixed(1)}× 更快`
  }
  return '两次基准后显示'
})

const speedupClass = computed(() => {
  if (!baselineAvgMs.value || !optimizedAvgMs.value) return ''
  return optimizedAvgMs.value < baselineAvgMs.value ? 'good' : 'bad'
})

function measureDeps() {
  dependencyCount.value = countProjectionDeps(getBuildFn(), store)
}

function simulatePagination() {
  const start = store.orderedIds.length
  const more = buildManyItems(20, fieldCount.value).map((item, i) => ({
    ...item,
    id: 10000 + start + i,
  }))
  mergeItems(store, more)
}

function simulateFieldUpdate() {
  const first = store.orderedIds[0]
  if (!first) return
  applyItemUpdate(store, {
    id: Number(first),
    title: `更新于 ${Date.now() % 10000}`,
  })
}

function simulateMemberUpdate() {
  const first = store.orderedIds[0]
  if (!first) return
  updateMembers(store, {
    id: Number(first),
    memberList: [
      { userId: 1, name: 'A' },
      { userId: 2, name: 'B' },
      { userId: 3, name: 'C' },
    ],
  })
}

function runBenchmark() {
  const result = benchmarkProjection(getBuildFn(), store, 30)
  benchAvgMs.value = result.avgMs
  if (useOptimized.value) {
    optimizedAvgMs.value = result.avgMs
  } else {
    baselineAvgMs.value = result.avgMs
  }
  measureDeps()
}

watch(useOptimized, () => {
  dependencyCount.value = null
  baselineAvgMs.value = null
  optimizedAvgMs.value = null
  benchAvgMs.value = 0
})
</script>

<style scoped>
.perf-demo {
  font-family: system-ui, sans-serif;
  max-width: 720px;
  margin: 0 auto;
  padding: 12px;
  color: #213547;
}
.hero h1 { font-size: 1.4rem; margin: 0 0 4px; }
.subtitle { color: #666; font-size: 0.85rem; margin: 0 0 16px; }
.panel {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
}
.switch-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  cursor: pointer;
}
.sliders label { display: block; font-size: 0.85rem; margin-bottom: 8px; }
.sliders input[type='range'] { width: 100%; margin-top: 4px; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 0.82rem;
}
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
h2 { font-size: 1rem; margin: 0 0 10px; }
.metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.metric { background: #fff; border: 1px solid #eee; border-radius: 6px; padding: 10px; }
.metric .label { display: block; font-size: 0.75rem; color: #888; }
.metric .value { display: block; font-size: 1.3rem; font-weight: 700; margin: 4px 0; }
.metric .value.bad { color: #e74c3c; }
.metric .value.good { color: #42b883; }
.metric .value.highlight { color: #3498db; }
.metric .hint { font-size: 0.7rem; color: #aaa; }
.item-list { list-style: none; padding: 0; margin: 0; }
.item-row {
  display: flex; gap: 8px; align-items: center;
  padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 0.82rem;
}
.item-row .id { color: #999; min-width: 48px; }
.item-row .text { flex: 1; }
.item-row .tag {
  background: #42b88322; color: #42b883;
  padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;
}
.insight ol, .ref-list {
  margin: 0; padding-left: 1.2rem; font-size: 0.85rem; line-height: 1.7;
}
.ref-list a { color: #3498db; text-decoration: none; }
</style>
