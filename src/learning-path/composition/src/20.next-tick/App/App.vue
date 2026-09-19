<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 同步读 DOM：旧 vs 新</h4>
      <p ref="counterEl">count = {{ count }}</p>
      <button @click="bump">count++ 并测试 nextTick</button>
      <pre>{{ log }}</pre>
    </section>

    <section class="card">
      <h4>② 自动滚到底部</h4>
      <div ref="listEl" class="list">
        <div v-for="i in items" :key="i" class="item">item {{ i }}</div>
      </div>
      <button @click="addItem">添加并自动滚动</button>
    </section>

    <section class="card">
      <h4>③ ECharts-style resize</h4>
      <div ref="chartEl" class="chart">{{ chartTick }}</div>
      <button @click="resizeChart">模拟 resize</button>
      <p class="hint">width 改变 → 状态更新 → nextTick 后"图表已 resize"</p>
    </section>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const title = ref('nextTick：等待 DOM 更新')

/* === ① 同步 vs 异步 === */
const count = ref(0)
const counterEl = ref(null)
const log = ref('')

async function bump() {
  count.value++
  // 同步读：旧值
  const before = counterEl.value.textContent
  await nextTick()
  // 异步读：新值
  const after = counterEl.value.textContent
  log.value = `before: "${before}"\nafter : "${after}"\n`
}

/* === ② 滚动 === */
const items = ref([1, 2, 3])
const listEl = ref(null)
async function addItem() {
  items.value.push(items.value.length + 1)
  await nextTick()
  listEl.value.scrollTop = listEl.value.scrollHeight
}

/* === ③ resize === */
const width = ref(200)
const chartTick = ref(0)
const chartEl = ref(null)
async function resizeChart() {
  width.value = width.value + 50
  chartTick.value++
  await nextTick()
  chartEl.value.textContent = `图表已 resize (width=${width.value}, tick=${chartTick.value})`
}
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 720px;
}
.card {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 10px;
  margin: 10px 0;
  background: #fff;
}
.list {
  height: 120px;
  overflow-y: auto;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  margin: 6px 0;
}
.item { padding: 4px 8px; border-bottom: 1px dashed #e2e8f0; }
.chart {
  background: #dbeafe;
  padding: 8px;
  border-radius: 4px;
  text-align: center;
  font-family: monospace;
}
pre { background: #f6f8fa; padding: 6px; font-size: 12px; }
button { padding: 4px 10px; }
.hint { font-size: 12px; color: #888; }
</style>
