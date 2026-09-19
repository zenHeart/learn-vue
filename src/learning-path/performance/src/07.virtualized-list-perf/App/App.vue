<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const mode = ref('full') // full | virtual
const ROW_COUNT = 10000
const ROW_HEIGHT = 32
const VIEWPORT_HEIGHT = 360
const BUFFER = 6

const rows = Array.from({ length: ROW_COUNT }, (_, i) => ({
  id: i,
  name: `User-${i}`,
  score: Math.floor(Math.random() * 1000),
  role: ['admin', 'dev', 'guest'][i % 3],
}))

const scrollTop = ref(0)
const fps = ref(60)
const frameSamples = []
let rafId = null

function tick() {
  const now = performance.now()
  frameSamples.push(now)
  while (frameSamples.length && frameSamples[0] < now - 1000) frameSamples.shift()
  fps.value = frameSamples.length
  rafId = requestAnimationFrame(tick)
}
onMounted(() => { rafId = requestAnimationFrame(tick) })
onUnmounted(() => { if (rafId) cancelAnimationFrame(rafId) })

function onScroll(e) {
  scrollTop.value = e.target.scrollTop
}

const virtualSlice = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - BUFFER)
  const end = Math.min(ROW_COUNT, start + Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + BUFFER * 2)
  return { start, end, items: rows.slice(start, end), offsetTop: start * ROW_HEIGHT }
})

const domCount = computed(() => (mode.value === 'full' ? ROW_COUNT : virtualSlice.value.items.length))
</script>

<template>
  <div class="demo">
    <p class="badge">虚拟滚动 vs 全量渲染</p>

    <div class="metrics">
      <div class="metric">
        <span class="label">FPS</span>
        <span class="value" :class="{ warn: fps < 40 }">{{ fps }}</span>
      </div>
      <div class="metric">
        <span class="label">DOM 节点数</span>
        <span class="value">{{ domCount }}</span>
      </div>
      <div class="metric">
        <span class="label">模式</span>
        <span class="value">{{ mode === 'full' ? '全量' : '虚拟' }}</span>
      </div>
    </div>

    <div class="actions">
      <button :class="{ active: mode === 'full' }" @click="mode = 'full'">① 全量 v-for</button>
      <button :class="{ active: mode === 'virtual' }" @click="mode = 'virtual'">② 虚拟滚动</button>
    </div>

    <div
      class="viewport"
      :style="{ height: `${VIEWPORT_HEIGHT}px` }"
      @scroll="onScroll"
    >
      <!-- 全量渲染 -->
      <div v-if="mode === 'full'" class="inner">
        <div v-for="row in rows" :key="row.id" class="row" :style="{ height: `${ROW_HEIGHT}px` }">
          <span>#{{ row.id }}</span>
          <span>{{ row.name }}</span>
          <span>{{ row.score }}</span>
          <span>{{ row.role }}</span>
        </div>
      </div>

      <!-- 虚拟滚动 -->
      <div v-else class="inner" :style="{ height: `${ROW_COUNT * ROW_HEIGHT}px`, position: 'relative' }">
        <div
          class="window"
          :style="{ transform: `translateY(${virtualSlice.offsetTop}px)` }"
        >
          <div
            v-for="row in virtualSlice.items"
            :key="row.id"
            class="row"
            :style="{ height: `${ROW_HEIGHT}px` }"
          >
            <span>#{{ row.id }}</span>
            <span>{{ row.name }}</span>
            <span>{{ row.score }}</span>
            <span>{{ row.role }}</span>
          </div>
        </div>
      </div>
    </div>

    <p class="tip">在 ① 模式下连续滚动会看到 FPS 跌落。</p>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 480px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; }
.metric { background: #f6f8fa; border-radius: 8px; padding: 8px 10px; }
.label { display: block; font-size: 0.7rem; color: #888; }
.value { display: block; font-size: 1.1rem; font-weight: 700; margin-top: 2px; }
.value.warn { color: #e74c3c; }
.actions { display: flex; gap: 6px; margin-bottom: 10px; }
.actions button { flex: 1; padding: 5px 10px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.8rem; }
.actions button.active { background: #42b883; color: #fff; border-color: #42b883; }
.viewport { overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 8px; background: #fff; }
.inner { width: 100%; }
.row { display: grid; grid-template-columns: 60px 1fr 80px 80px; align-items: center; padding: 0 10px; border-bottom: 1px solid #f0f0f0; font-size: 0.78rem; box-sizing: border-box; }
.window { position: absolute; top: 0; left: 0; width: 100%; }
.tip { font-size: 0.78rem; color: #666; margin: 8px 0 0; }
</style>
