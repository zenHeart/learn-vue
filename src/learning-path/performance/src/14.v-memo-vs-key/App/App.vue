<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>基准：{{ ROWS }} 行输入框，单行修改 N 次</h4>
      <p>只改第 <strong>{{ focusIndex }}</strong> 行；其它 {{ ROWS - 1 }} 行不动</p>
      <label>
        焦点行:
        <input v-model.number="focusIndex" type="number" min="0" :max="ROWS - 1" />
      </label>
      <label>
        修改次数:
        <input v-model.number="rounds" type="number" min="1" max="100" />
      </label>
      <label>
        <input type="checkbox" v-model="useMemo" /> 启用 v-memo="[row.dirty]"
      </label>
      <button @click="runBench">运行基准</button>
    </section>

    <section class="card">
      <h4>结果</h4>
      <p>耗时: <strong>{{ elapsed.toFixed(2) }}ms</strong></p>
      <p>是否启用 v-memo: <strong>{{ useMemo ? '是' : '否' }}</strong></p>
      <p class="hint">同一基准多跑几次取较稳定的一次；浏览器/设备差异显著</p>
    </section>

    <section class="card">
      <h4>行预览（仅前 5 行）</h4>
      <div v-if="useMemo">
        <div v-for="r in preview" :key="r.id" v-memo="[r.dirty]" class="row">
          <span>#{{ r.id }}</span>
          <input v-model="r.text" />
        </div>
      </div>
      <div v-else>
        <div v-for="r in preview" :key="r.id" class="row">
          <span>#{{ r.id }}</span>
          <input v-model="r.text" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const title = ref('v-memo vs v-for :key：微观基准对比')

const ROWS = 1000
const focusIndex = ref(0)
const rounds = ref(20)
const useMemo = ref(true)
const elapsed = ref(0)

const rows = ref(
  Array.from({ length: ROWS }, (_, i) => ({
    id: i,
    text: `row-${i}`,
    dirty: false,
  })),
)

const preview = computed(() => rows.value.slice(0, 5))

async function runBench() {
  rows.value.forEach((r) => (r.dirty = false))
  await new Promise((r) => requestAnimationFrame(r))

  const t0 = performance.now()
  for (let i = 0; i < rounds.value; i++) {
    const row = rows.value[focusIndex.value]
    row.text = `row-${row.id}-${i}`
    row.dirty = !row.dirty
  }
  await nextTick()
  elapsed.value = performance.now() - t0
}
</script>

<style scoped>
.demo {
  max-width: 820px;
  margin: 16px auto;
  padding: 16px;
  color: #213547;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.card {
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #1e293b;
}
.hint {
  font-size: 12px;
  color: #64748b;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
}
label {
  display: inline-block;
  margin-right: 12px;
  font-size: 13px;
}
input {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}
.row {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 2px 0;
}
</style>