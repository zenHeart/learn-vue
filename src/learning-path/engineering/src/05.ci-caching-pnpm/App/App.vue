<script setup>
import { ref, computed } from 'vue'

const cached = ref(false)
const monorepo = ref(false)
const turborepo = ref(false)

const baseTimes = {
  install: 180,
  build: 220,
  test: 80,
}
const cachedTimes = {
  install: 25,
  build: 45,
  test: 25,
}

function calcTimes() {
  let t = { ...(cached.value ? cachedTimes : baseTimes) }
  if (monorepo.value) {
    t = {
      install: Math.round(t.install * 0.6),
      build: Math.round(t.build * 0.4),
      test: Math.round(t.test * 0.7),
    }
  }
  if (turborepo.value) {
    t.build = Math.round(t.build * 0.5)
  }
  return t
}

const times = computed(calcTimes)
const total = computed(() => times.value.install + times.value.build + times.value.test)
const baseTotal = baseTimes.install + baseTimes.build + baseTimes.test
</script>

<template>
  <div class="demo">
    <p class="badge">GitHub Actions 缓存</p>

    <div class="controls">
      <label><input type="checkbox" v-model="cached" /> 缓存命中</label>
      <label><input type="checkbox" v-model="monorepo" /> monorepo 过滤</label>
      <label><input type="checkbox" v-model="turborepo" /> Turborepo Remote Cache</label>
    </div>

    <table class="times">
      <thead><tr><th>阶段</th><th>无缓存</th><th>当前</th></tr></thead>
      <tbody>
        <tr><td>pnpm install</td><td>{{ baseTimes.install }}s</td><td :class="{ save: cached }">{{ times.install }}s</td></tr>
        <tr><td>pnpm build</td><td>{{ baseTimes.build }}s</td><td :class="{ save: cached }">{{ times.build }}s</td></tr>
        <tr><td>pnpm test</td><td>{{ baseTimes.test }}s</td><td :class="{ save: cached }">{{ times.test }}s</td></tr>
        <tr class="total"><td>合计</td><td>{{ baseTotal }}s</td><td :class="{ save: cached }">{{ total }}s</td></tr>
      </tbody>
    </table>

    <p class="save">节省: <strong>{{ Math.round(((baseTotal - total) / baseTotal) * 100) }}%</strong></p>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.controls { display: flex; gap: 12px; margin-bottom: 10px; font-size: 0.78rem; flex-wrap: wrap; }
.controls label { display: flex; gap: 4px; align-items: center; }
.times { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.times th, .times td { padding: 5px 10px; border-bottom: 1px solid #f0f0f0; text-align: left; }
.times tr.total { font-weight: 700; background: #f6f8fa; }
.times td.save { color: #27ae60; font-weight: 600; }
.save { font-size: 0.85rem; color: #27ae60; margin: 10px 0 0; }
</style>
