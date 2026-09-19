<script setup>
import { ref, computed, defineComponent } from 'vue'

// ---------- 1. 生成测试数据 ----------
const TOTAL = 100000
const allData = Array.from({ length: TOTAL }, (_, i) => ({
  id: i,
  text: `Row #${i + 1} — ${Math.random().toString(36).slice(2, 6)}`,
  // 动态行高模式下，每 7 行一个高行
  isHigh: i % 7 === 0,
}))

// ---------- 2. 模式与配置 ----------
const mode = ref('virtual-fixed')   // 'full' | 'virtual-fixed' | 'virtual-dynamic'
const ROW_HEIGHT = 40
const BUFFER = 5
const VIEWPORT_HEIGHT = 280

// ---------- 3. 全量渲染（对比用） ----------
// 100k DOM 节点 —— 仅 dev 时千万别点，会卡死浏览器标签页
const fullRows = computed(() => allData)

// ---------- 4. 虚拟滚动：固定行高 ----------
const scrollTop = ref(0)
const visibleStart = computed(() => Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - BUFFER))
const visibleCount = computed(() => Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT))
const visibleEnd = computed(() => Math.min(TOTAL, visibleStart.value + visibleCount.value + BUFFER * 2))
const virtualFixedRows = computed(() => allData.slice(visibleStart.value, visibleEnd.value))
const fixedOffsetY = computed(() => visibleStart.value * ROW_HEIGHT)
const fixedTotalHeight = TOTAL * ROW_HEIGHT

const onScrollFixed = (e) => { scrollTop.value = e.target.scrollTop }

// ---------- 5. 虚拟滚动：动态行高 ----------
const estimatedRowHeight = 50
const positionMap = ref(Array.from({ length: TOTAL + 1 }, (_, i) => i * estimatedRowHeight))
// positionMap[i] = 第 i 行的累计起始位置

const getStartIndex = (scroll) => {
  // 二分查找：第一个 positionMap[i] >= scroll 的位置
  let lo = 0, hi = TOTAL
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (positionMap.value[mid] < scroll) lo = mid + 1
    else hi = mid
  }
  return Math.max(0, lo - 1)
}

const dynamicStart = computed(() => getStartIndex(scrollTop.value))
const dynamicEnd = computed(() => {
  const target = scrollTop.value + VIEWPORT_HEIGHT
  let lo = dynamicStart.value, hi = TOTAL
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (positionMap.value[mid] < target) lo = mid + 1
    else hi = mid
  }
  return Math.min(TOTAL, lo + BUFFER)
})
const dynamicRows = computed(() => allData.slice(dynamicStart.value, dynamicEnd.value))
const dynamicOffsetY = computed(() => positionMap.value[dynamicStart.value])
const dynamicTotalHeight = computed(() => positionMap.value[TOTAL])

const measureRow = (id, el) => {
  if (!el) return
  const realHeight = el.getBoundingClientRect().height
  const rowIndex = id
  // 更新 positionMap：第 i 行高度变化，后续所有累计位置都要修正
  if (rowIndex === 0) return
  const diff = realHeight - estimatedRowHeight
  if (Math.abs(diff) < 1) return
  for (let i = rowIndex + 1; i <= TOTAL; i++) {
    positionMap.value[i] += diff
  }
}

const onScrollDynamic = (e) => { scrollTop.value = e.target.scrollTop }
</script>

<template>
  <div class="demo">
    <p class="title">06 · 虚拟滚动列表（mini 实现）</p>

    <div class="panel">
      <p class="panel-title">渲染模式</p>
      <div class="controls">
        <button :class="{ active: mode === 'virtual-fixed' }" @click="mode = 'virtual-fixed'">虚拟 - 固定行高</button>
        <button :class="{ active: mode === 'virtual-dynamic' }" @click="mode = 'virtual-dynamic'">虚拟 - 动态行高</button>
        <button :class="{ active: mode === 'full' }" @click="mode = 'full'">全量渲染（对比）</button>
      </div>
      <p class="meta">
        <span>数据：<strong>{{ TOTAL.toLocaleString() }}</strong> 行</span>
        <span v-if="mode === 'virtual-fixed'">
          可见范围 row #{{ visibleStart + 1 }} — {{ visibleEnd }} ·
          已渲染 <strong>{{ virtualFixedRows.length }}</strong> 个 DOM
        </span>
        <span v-if="mode === 'virtual-dynamic'">
          可见范围 row #{{ dynamicStart + 1 }} — {{ dynamicEnd }} ·
          已渲染 <strong>{{ dynamicRows.length }}</strong> 个 DOM
        </span>
        <span v-if="mode === 'full'" class="warn">
          已渲染 <strong>{{ fullRows.length.toLocaleString() }}</strong> 个 DOM（dev 卡顿警告）
        </span>
      </p>
    </div>

    <!-- 固定行高 -->
    <div v-if="mode === 'virtual-fixed'" class="viewport" @scroll="onScrollFixed">
      <div class="phantom" :style="{ height: fixedTotalHeight + 'px' }" />
      <div class="rendered" :style="{ transform: `translateY(${fixedOffsetY}px)` }">
        <div v-for="row in virtualFixedRows" :key="row.id" class="row fixed">
          {{ row.text }}
        </div>
      </div>
    </div>

    <!-- 动态行高 -->
    <div v-else-if="mode === 'virtual-dynamic'" class="viewport" @scroll="onScrollDynamic">
      <div class="phantom" :style="{ height: dynamicTotalHeight + 'px' }" />
      <div class="rendered" :style="{ transform: `translateY(${dynamicOffsetY}px)` }">
        <div
          v-for="row in dynamicRows"
          :key="row.id"
          :ref="(el) => measureRow(row.id, el)"
          :class="['row', 'dynamic', { high: row.isHigh }]"
        >
          {{ row.text }}
          <span class="badge">{{ row.isHigh ? '高行' : '普通' }}</span>
        </div>
      </div>
    </div>

    <!-- 全量渲染 -->
    <div v-else class="viewport full">
      <div v-for="row in fullRows.slice(0, 2000)" :key="row.id" class="row fixed">
        {{ row.text }}
      </div>
      <div v-if="fullRows.length > 2000" class="phantom-warning">
        已截断至 2000 行（dev 模式浏览器会卡死，全量请用 console.log 看 length）
      </div>
    </div>

    <div class="hints">
      <p class="hint">观察</p>
      <ul>
        <li>固定行高 —— <code>startIndex = floor(scrollTop / rowHeight)</code>，O(1)</li>
        <li>动态行高 —— 二分查 <code>positionMap</code>；每行渲染时实测并修正后续累计</li>
        <li>无论数据多少，DOM 节点数永远 ≈ 视口行数 + 缓冲区（~30 个）</li>
        <li>Element Plus <code>el-table-v2</code> / Naive UI <code>n-data-table</code> 内部即此原理</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 640px; }
.title { font-weight: 700; font-size: 1rem; margin: 0 0 10px; }
.panel { background: #f6f8fa; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
.panel-title { margin: 0 0 8px; font-size: 0.85rem; font-weight: 600; }
.controls { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.controls button { padding: 5px 10px; border-radius: 4px; border: 1px solid #dcdfe6; background: #fff; cursor: pointer; font-size: 0.78rem; }
.controls button.active { background: #42b883; color: #fff; border-color: #42b883; }
.meta { font-size: 0.78rem; margin: 0; display: flex; gap: 12px; flex-wrap: wrap; }
.meta .warn { color: #e74c3c; }
.meta strong { color: #42b883; font-weight: 700; }

.viewport { height: 280px; overflow-y: auto; border: 1px solid #dcdfe6; border-radius: 6px; background: #fff; position: relative; }
.viewport.full { height: auto; max-height: 280px; }
.phantom { width: 1px; }
.rendered { position: absolute; top: 0; left: 0; right: 0; will-change: transform; }
.row { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 0.82rem; display: flex; align-items: center; justify-content: space-between; }
.row.fixed { height: 40px; }
.row.dynamic { min-height: 30px; }
.row.high { min-height: 60px; background: #f3e8ff; }
.row .badge { font-size: 0.7rem; background: #7c3aed; color: #fff; padding: 1px 6px; border-radius: 8px; }
.phantom-warning { padding: 12px; color: #e74c3c; font-size: 0.78rem; text-align: center; }

.hints { margin-top: 10px; font-size: 0.78rem; color: #666; }
.hints ul { margin: 4px 0 0; padding-left: 20px; line-height: 1.7; }
.hint { font-weight: 600; margin: 0; }
code { background: #f6f8fa; padding: 1px 5px; border-radius: 3px; font-size: 0.78rem; color: #5b21b6; }
</style>
