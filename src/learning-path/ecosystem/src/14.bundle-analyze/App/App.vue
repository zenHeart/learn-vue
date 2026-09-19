<script setup>
const modules = [
  { name: 'vue.runtime.esm-browser.js', raw: 36.2, gzip: 14.1 },
  { name: 'element-plus (按需)', raw: 142.5, gzip: 48.7 },
  { name: 'echarts', raw: 312.8, gzip: 102.4, warn: true },
  { name: '@iconify/fa-solid', raw: 188.3, gzip: 64.2, warn: true },
  { name: 'dayjs + plugins', raw: 24.6, gzip: 9.1 },
  { name: 'lodash-es (按需)', raw: 18.9, gzip: 7.3 },
  { name: 'axios', raw: 22.5, gzip: 8.8 },
  { name: 'app code (sum)', raw: 64.1, gzip: 22.4 },
]

const totalRaw = modules.reduce((s, m) => s + m.raw, 0)
const totalGzip = modules.reduce((s, m) => s + m.gzip, 0)
</script>

<template>
  <div class="card">
    <h2>Bundle 体积分析（模拟）</h2>
    <p class="hint">真实报告：<code>dist/stats.html</code>（treemap / sunburst / network）。</p>

    <table class="table">
      <thead>
        <tr>
          <th>模块</th>
          <th class="num">raw (KB)</th>
          <th class="num">gzip (KB)</th>
          <th class="num">占比</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in modules" :key="m.name" :class="{ warn: m.warn }">
          <td>{{ m.name }}</td>
          <td class="num">{{ m.raw.toFixed(1) }}</td>
          <td class="num">{{ m.gzip.toFixed(1) }}</td>
          <td class="num">{{ ((m.raw / totalRaw) * 100).toFixed(1) }}%</td>
        </tr>
        <tr class="total">
          <td>合计</td>
          <td class="num">{{ totalRaw.toFixed(1) }}</td>
          <td class="num">{{ totalGzip.toFixed(1) }}</td>
          <td class="num">100%</td>
        </tr>
      </tbody>
    </table>

    <h3>优化建议</h3>
    <ul>
      <li class="warn-text">echarts 312KB — 改按需 import + 走 CDN</li>
      <li class="warn-text">@iconify/fa-solid 188KB — 改 svg sprite 或子集</li>
      <li>vue runtime 走 production build（vue.runtime）</li>
      <li>app code 可进一步 manualChunks 拆分 vendor</li>
    </ul>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 540px; }
.card h2 { margin: 0 0 6px; font-size: 1.05rem; }
.card h3 { margin: 12px 0 6px; font-size: 0.9rem; }
.hint { font-size: 0.82rem; color: #666; margin: 0 0 10px; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.82rem; }
.table { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
.table th, .table td { padding: 5px 8px; border-bottom: 1px solid #eee; text-align: left; }
.table th { color: #888; font-weight: 500; font-size: 0.78rem; }
.table .num { text-align: right; font-family: ui-monospace, monospace; }
.table tr.warn td { color: #b45309; background: #fff7ed; }
.table tr.total td { font-weight: 700; border-top: 2px solid #213547; }
ul { font-size: 0.85rem; padding-left: 20px; margin: 6px 0; }
.warn-text { color: #b45309; }
</style>
