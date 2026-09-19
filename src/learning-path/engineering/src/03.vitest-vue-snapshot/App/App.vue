<script setup>
import { ref, computed } from 'vue'

const props = ref({ initial: 5 })
const filterDynamic = ref(false)

const rawSnapshot = computed(() => {
  const p = props.value.initial
  return `<div class="counter" data-testid="counter-${Date.now()}">
  <p class="count">Count: ${p}</p>
  <button>+1</button>
</div>`
})

const snapshot = computed(() => {
  if (!filterDynamic.value) return rawSnapshot.value
  return rawSnapshot.value.replace(/data-testid="counter-\d+"/, 'data-testid="counter-X"')
})

const coverage = ref({
  lines: 92,
  branches: 85,
  functions: 100,
  statements: 92,
})

const gate = 80
const pass = computed(() => Object.values(coverage.value).every(v => v >= gate))
</script>

<template>
  <div class="demo">
    <p class="badge">Vitest 组件快照</p>

    <h4>示例组件（Counter.vue）</h4>
    <div class="props">
      <label>initial: <input type="number" v-model.number="props.initial" /></label>
      <label><input type="checkbox" v-model="filterDynamic" /> 过滤动态属性</label>
    </div>

    <h4>快照输出</h4>
    <pre class="snap">{{ snapshot }}</pre>

    <h4>覆盖率（门禁 {{ gate }}%）</h4>
    <table class="cov">
      <tr v-for="(v, k) in coverage" :key="k">
        <td>{{ k }}</td>
        <td :class="{ fail: v < gate }">{{ v }}%</td>
      </tr>
    </table>
    <div :class="['gate', pass ? 'ok' : 'fail']">
      {{ pass ? '✓ 门禁通过' : '✗ 门禁失败' }}
    </div>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 520px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
h4 { font-size: 0.85rem; margin: 10px 0 4px; color: #444; }
.props { display: flex; gap: 12px; margin-bottom: 8px; font-size: 0.78rem; }
.props label { display: flex; gap: 4px; align-items: center; }
.snap { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 8px; font-family: ui-monospace, monospace; font-size: 0.74rem; overflow-x: auto; white-space: pre-wrap; }
.cov { width: 100%; border-collapse: collapse; font-size: 0.78rem; margin-bottom: 6px; }
.cov td { padding: 4px 8px; border-bottom: 1px solid #f0f0f0; }
.cov td.fail { color: #c0392b; font-weight: 600; }
.gate { padding: 6px 10px; border-radius: 6px; font-weight: 600; text-align: center; }
.gate.ok { background: #e8f8f0; color: #27ae60; }
.gate.fail { background: #fdecea; color: #c0392b; }
</style>
