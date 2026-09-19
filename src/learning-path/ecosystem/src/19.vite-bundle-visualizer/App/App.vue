<script setup>
import { computed } from 'vue'

// 模拟 manualChunks 拆 vendor 后的产物分布
const chunks = [
  { name: 'vendor-framework', raw: 56.4, gzip: 21.3, color: '#3b82f6', desc: 'vue + vue-router + pinia' },
  { name: 'vendor-runtime', raw: 78.2, gzip: 28.5, color: '#10b981', desc: '@vueuse/core + vue-i18n + dayjs' },
  { name: 'vendor-heavy', raw: 298.7, gzip: 96.4, color: '#f59e0b', desc: 'echarts + monaco-editor (按需未触发)' },
  { name: 'vendor', raw: 42.1, gzip: 15.8, color: '#8b5cf6', desc: '其他 node_modules' },
  { name: 'app:home', raw: 24.3, gzip: 8.7, color: '#ef4444', desc: '首页路由 + Home.vue' },
  { name: 'app:admin', raw: 31.5, gzip: 11.2, color: '#ec4899', desc: 'admin 路由懒加载' },
  { name: 'app:chart', raw: 18.9, gzip: 6.8, color: '#06b6d4', desc: 'chart 路由懒加载' },
]

const totals = computed(() => ({
  raw: chunks.reduce((s, c) => s + c.raw, 0),
  gzip: chunks.reduce((s, c) => s + c.gzip, 0),
}))

// 计算每个 chunk 占总 raw 比例，用作 treemap 宽度
function widthFor(c) {
  return (c.raw / totals.value.raw) * 100
}
</script>

<template>
  <div class="card">
    <h2>Vite vendor 拆分分析</h2>
    <p class="hint">
      <code>rollup-plugin-visualizer</code> 输出的 treemap 视图。
      <strong>vendor-framework / vendor-runtime / vendor-heavy / vendor</strong> 由
      <code>manualChunks</code> 函数切分，业务代码按路由懒加载自动拆。
    </p>

    <!-- 简化版 treemap -->
    <div class="treemap">
      <div
        v-for="c in chunks"
        :key="c.name"
        class="block"
        :style="{ width: widthFor(c) + '%', background: c.color }"
        :title="`${c.name}: ${c.raw.toFixed(1)} KB (gzip ${c.gzip.toFixed(1)})`"
      >
        <strong>{{ c.name }}</strong>
        <span>{{ c.raw.toFixed(1) }} KB</span>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>chunk</th>
          <th class="num">raw (KB)</th>
          <th class="num">gzip (KB)</th>
          <th class="num">占比</th>
          <th>包含</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in chunks" :key="c.name">
          <td>
            <span class="dot" :style="{ background: c.color }"></span>
            <code>{{ c.name }}</code>
          </td>
          <td class="num">{{ c.raw.toFixed(1) }}</td>
          <td class="num">{{ c.gzip.toFixed(1) }}</td>
          <td class="num">{{ widthFor(c).toFixed(1) }}%</td>
          <td class="desc">{{ c.desc }}</td>
        </tr>
        <tr class="total">
          <td>合计</td>
          <td class="num">{{ totals.raw.toFixed(1) }}</td>
          <td class="num">{{ totals.gzip.toFixed(1) }}</td>
          <td class="num">100%</td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <h3>拆分原则</h3>
    <ul>
      <li><strong>framework</strong>：极稳定，hash 几乎不变 → 命中长缓存</li>
      <li><strong>runtime</strong>：版本跟随业务迭代 → 中期缓存</li>
      <li><strong>heavy</strong>：按需加载；初始 chunk 不引入，只在路由命中时拉</li>
      <li><strong>vendor</strong>：兜底 chunk</li>
    </ul>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 580px; }
.card h2 { margin: 0 0 6px; font-size: 1rem; }
.hint { font-size: 0.78rem; color: #666; margin: 0 0 12px; line-height: 1.5; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.78rem; }
.treemap { display: flex; width: 100%; height: 80px; border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
.block { padding: 4px 6px; color: #fff; font-size: 0.7rem; display: flex; flex-direction: column; justify-content: center; border-right: 1px solid rgba(255,255,255,0.3); overflow: hidden; }
.block:last-child { border-right: 0; }
.block strong { font-size: 0.72rem; }
.table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
.table th { text-align: left; color: #888; font-weight: 500; padding: 4px 6px; border-bottom: 1px solid #eee; }
.table td { padding: 4px 6px; border-bottom: 1px solid #f1f5f9; }
.table .num { text-align: right; font-family: ui-monospace, monospace; }
.table tr.total td { font-weight: 700; border-top: 2px solid #213547; }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
.desc { color: #666; font-size: 0.74rem; }
.card h3 { margin: 12px 0 6px; font-size: 0.88rem; color: #35495e; }
ul { font-size: 0.82rem; padding-left: 20px; margin: 6px 0; }
ul li { margin: 3px 0; line-height: 1.5; }
</style>
