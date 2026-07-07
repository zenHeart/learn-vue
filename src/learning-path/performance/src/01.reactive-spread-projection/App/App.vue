<template>
  <div class="perf-demo">
    <header class="hero">
      <h1>组队列表投影性能</h1>
      <p class="subtitle">
        抽象自 nn-client-all <code>buildLegacyTeamListProjection</code>（commit
        <code>166d6d2a</code>）
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
          房间数 {{ roomCount }}
          <input v-model.number="roomCount" type="range" min="10" max="300" step="10" />
        </label>
        <label>
          每房字段数 {{ fieldCount }}
          <input v-model.number="fieldCount" type="range" min="10" max="60" step="5" />
        </label>
      </div>

      <div class="actions">
        <button @click="resetData">重置数据</button>
        <button @click="simulatePagination">模拟分页 +20 房</button>
        <button @click="simulateFieldUpdate">模拟字段更新（换对象写入）</button>
        <button @click="simulateMemberUpdate">模拟成员更新（原地 splice）</button>
        <button class="primary" @click="runBenchmark">运行基准测试 ×30</button>
      </div>
    </section>

    <section class="panel metrics">
      <h2>实时指标</h2>
      <div class="metric-grid">
        <div class="metric">
          <span class="label">computed 依赖数</span>
          <span class="value" :class="depClass">{{ dependencyCount }}</span>
          <span class="hint">优化后应 &lt; 房间数×8</span>
        </div>
        <div class="metric">
          <span class="label">投影重建次数</span>
          <span class="value">{{ rebuildCount }}</span>
        </div>
        <div class="metric">
          <span class="label">上次重建耗时</span>
          <span class="value">{{ lastRebuildMs.toFixed(2) }} ms</span>
        </div>
        <div class="metric">
          <span class="label">基准 avg（×30）</span>
          <span class="value highlight">{{ benchAvgMs.toFixed(3) }} ms</span>
        </div>
        <div class="metric">
          <span class="label">对比倍数</span>
          <span class="value" :class="speedupClass">
            {{ speedupLabel }}
          </span>
        </div>
        <div class="metric">
          <span class="label">当前房间数</span>
          <span class="value">{{ projection.length }}</span>
        </div>
      </div>
    </section>

    <section class="panel list-panel">
      <h2>投影预览（前 12 条）</h2>
      <ul class="team-list">
        <li v-for="row in preview" :key="row.channelId" class="team-row">
          <span class="id">#{{ row.channelId }}</span>
          <span class="text">{{ row.contentText }}</span>
          <span class="members">{{ row.userList?.length ?? 0 }} 人</span>
          <span class="tag">{{ row.cardType }}</span>
        </li>
      </ul>
    </section>

    <section class="panel insight">
      <h2>观察要点</h2>
      <ol>
        <li>
          <strong>关闭优化</strong>：依赖数 ≈ 房间数 × 字段数（如 50 房 × 50 键 ≈ 2500+）
        </li>
        <li>
          <strong>开启优化</strong>：依赖数降为 O(房间数)，基准耗时显著下降（线上微基准 5.3×）
        </li>
        <li>
          <strong>字段更新</strong>：换对象写入会触发投影重算；成员 splice 不触发整表重建
        </li>
        <li>
          <strong>业务语义</strong>：不能裸返原始对象，需 toRaw 浅拷贝 + 保留 memberList 响应式引用
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  applyChannelUpdate,
  benchmarkProjection,
  buildManyTeamChannels,
  buildProjectionBad,
  buildProjectionOptimized,
  createChannelListFactState,
  mergeTeamList,
  updateMembers,
} from './channelListModel.js'

const useOptimized = ref(false)
const roomCount = ref(80)
const fieldCount = ref(40)
const rebuildCount = ref(0)
const lastRebuildMs = ref(0)
const dependencyCount = ref(0)
const benchAvgMs = ref(0)
const baselineAvgMs = ref(null)
const optimizedAvgMs = ref(null)

const state = reactive(createChannelListFactState())

function resetData() {
  state.channelMap.clear()
  state.teamChannelIds.length = 0
  mergeTeamList(state, buildManyTeamChannels(roomCount.value, fieldCount.value))
  rebuildCount.value = 0
  benchAvgMs.value = 0
}

resetData()

watch([roomCount, fieldCount], () => resetData())

const projection = computed(
  () => {
    const t0 = performance.now()
    rebuildCount.value++
    const buildFn = useOptimized.value
      ? buildProjectionOptimized
      : buildProjectionBad
    const result = buildFn(state)
    lastRebuildMs.value = performance.now() - t0
    return result
  },
  {
    onTrack: () => {
      dependencyCount.value++
    },
  },
)

const preview = computed(() => projection.value.slice(0, 12))

const depClass = computed(() =>
  dependencyCount.value > roomCount.value * 8 ? 'bad' : 'good',
)

const speedupLabel = computed(() => {
  if (baselineAvgMs.value && optimizedAvgMs.value) {
    const ratio = baselineAvgMs.value / optimizedAvgMs.value
    return `${ratio.toFixed(1)}× 更快`
  }
  return '运行基准后显示'
})

const speedupClass = computed(() => {
  if (!baselineAvgMs.value || !optimizedAvgMs.value) return ''
  return optimizedAvgMs.value < baselineAvgMs.value ? 'good' : 'bad'
})

function simulatePagination() {
  const start = state.teamChannelIds.length
  const more = buildManyTeamChannels(20, fieldCount.value).map((ch, i) => ({
    ...ch,
    channelId: 10000 + start + i,
  }))
  mergeTeamList(state, more)
}

function simulateFieldUpdate() {
  const first = state.teamChannelIds[0]
  if (!first) return
  applyChannelUpdate(state, {
    channelId: Number(first),
    contentText: `更新于 ${Date.now() % 10000}`,
  })
}

function simulateMemberUpdate() {
  const first = state.teamChannelIds[0]
  if (!first) return
  updateMembers(state, {
    channelId: Number(first),
    memberList: [
      { userId: 1, name: 'A' },
      { userId: 2, name: 'B' },
      { userId: 3, name: 'C' },
    ],
  })
}

function runBenchmark() {
  dependencyCount.value = 0
  const buildFn = useOptimized.value
    ? buildProjectionOptimized
    : buildProjectionBad
  const result = benchmarkProjection(buildFn, state, 30)
  benchAvgMs.value = result.avgMs
  if (useOptimized.value) {
    optimizedAvgMs.value = result.avgMs
  } else {
    baselineAvgMs.value = result.avgMs
  }
}

watch(useOptimized, () => {
  dependencyCount.value = 0
  void projection.value
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
.hero h1 {
  font-size: 1.4rem;
  margin: 0 0 4px;
}
.subtitle {
  color: #666;
  font-size: 0.85rem;
  margin: 0 0 16px;
}
code {
  background: #f0f0f0;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.8em;
}
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
.sliders label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 8px;
}
.sliders input[type='range'] {
  width: 100%;
  margin-top: 4px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 0.82rem;
}
button:hover {
  background: #f5f5f5;
}
button.primary {
  background: #42b883;
  color: #fff;
  border-color: #42b883;
}
h2 {
  font-size: 1rem;
  margin: 0 0 10px;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.metric {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 10px;
}
.metric .label {
  display: block;
  font-size: 0.75rem;
  color: #888;
}
.metric .value {
  display: block;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 4px 0;
}
.metric .value.bad {
  color: #e74c3c;
}
.metric .value.good {
  color: #42b883;
}
.metric .value.highlight {
  color: #3498db;
}
.metric .hint {
  font-size: 0.7rem;
  color: #aaa;
}
.team-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.team-row {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  border-bottom: 1px solid #eee;
  font-size: 0.82rem;
}
.team-row .id {
  color: #999;
  min-width: 48px;
}
.team-row .text {
  flex: 1;
}
.team-row .members {
  color: #666;
}
.team-row .tag {
  background: #42b88322;
  color: #42b883;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}
.insight ol {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
  line-height: 1.7;
}
</style>
