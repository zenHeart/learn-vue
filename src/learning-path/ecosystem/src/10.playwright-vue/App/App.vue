<script setup>
import { ref } from 'vue'

const log = ref([])
function line(s, kind = 'ok') {
  log.value.push({ s, kind })
}

function run() {
  log.value = []
  line('$ npx playwright test', 'cmd')
  line('', 'muted')
  line('Running 3 tests using 3 workers', 'muted')
  line('  ✓ counter.spec.ts:5 > counter increments (412ms)', 'ok')
  line('  ✓ counter.spec.ts:12 > counter decrements (380ms)', 'ok')
  line('  ✓ counter.spec.ts:20 > counter reset (290ms)', 'ok')
  line('', 'muted')
  line('3 passed (1.1s)', 'sec')
  line('', 'muted')
  line('To open last HTML report run:', 'muted')
  line('  npx playwright show-report', 'cmd')
}
</script>

<template>
  <div class="card">
    <h2>Playwright + Vue E2E</h2>
    <p class="hint">真实跨浏览器测试，附 trace viewer 时间旅行。</p>

    <button class="primary" @click="run">运行 playwright</button>

    <div v-if="log.length" class="console">
      <div v-for="(l, i) in log" :key="i" :class="l.kind" v-html="l.s || '&nbsp;'"></div>
    </div>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 480px; }
.card h2 { margin: 0 0 6px; font-size: 1rem; }
.hint { font-size: 0.8rem; color: #666; margin: 0 0 10px; }
button.primary { padding: 6px 12px; border-radius: 6px; background: #2e8540; color: #fff; border: 0; cursor: pointer; font-size: 0.85rem; margin-bottom: 10px; }
.console { background: #0d1117; color: #d4d4d4; padding: 10px; border-radius: 6px; font-family: ui-monospace, monospace; font-size: 0.78rem; line-height: 1.7; }
.console .ok { color: #56d364; }
.console .cmd { color: #79c0ff; }
.console .muted { color: #8b949e; }
.console .sec { color: #f0883e; margin-top: 4px; }
</style>
