<script setup>
import { ref } from 'vue'

const log = ref([])
function line(s, kind = 'ok') {
  log.value.push({ s, kind })
}

function run() {
  log.value = []
  line('$ cy.mount(Counter, { props: { initial: 3 } })', 'cmd')
  line('  ✓ <Counter /> > renders and increments', 'ok')
  line('    cy.get(\'[data-test=count]\').should(\'contain\', \'4\')', 'muted')
  line('', 'muted')
  line('$ cy.mount(Counter, { props: { max: 5 } })', 'cmd')
  line('  ✓ <Counter /> > respects max prop', 'ok')
  line('    after 10 clicks, count stays at 5', 'muted')
  line('', 'muted')
  line('--- 2 passing (412ms) ---', 'sec')
}
</script>

<template>
  <div class="card">
    <h2>Cypress + Vue 组件测试</h2>
    <p class="hint"><code>cy.mount()</code> 在真实浏览器里挂载组件。</p>

    <button class="primary" @click="run">运行 cypress</button>

    <div v-if="log.length" class="console">
      <div v-for="(l, i) in log" :key="i" :class="l.kind" v-html="l.s || '&nbsp;'"></div>
    </div>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 480px; }
.card h2 { margin: 0 0 6px; font-size: 1rem; }
.hint { font-size: 0.8rem; color: #666; margin: 0 0 10px; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.78rem; }
button.primary { padding: 6px 12px; border-radius: 6px; background: #17202c; color: #fff; border: 0; cursor: pointer; font-size: 0.85rem; margin-bottom: 10px; }
.console { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-family: ui-monospace, monospace; font-size: 0.78rem; line-height: 1.7; }
.console .ok { color: #6ee7b7; }
.console .cmd { color: #93c5fd; }
.console .muted { color: #94a3b8; }
.console .sec { color: #fbbf24; margin-top: 4px; }
</style>
