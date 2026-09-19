<script setup>
import { ref } from 'vue'

const logs = ref([])
function log(msg) {
  logs.value.push({ time: new Date().toLocaleTimeString(), msg })
}

function runTests() {
  logs.value = []
  log('✓ Counter > renders initial count')
  log('  expect(wrapper.text()).toContain("5")  // got "Count: 5"')
  log('✓ Counter > increments on click')
  log('  expect(wrapper.text()).toContain("1")  // got "Count: 1"')
  log('✓ Counter > decrements below zero')
  log('  expect(wrapper.text()).toContain("-1")')
  log('--- 3 passed in 28ms ---')
}
</script>

<template>
  <div class="card">
    <h2>vitest + @vue/test-utils 组件测试</h2>
    <p class="hint">右侧 REPL 模拟一次测试运行。真实项目在 <code>vitest</code> CLI 下执行。</p>

    <button class="primary" @click="runTests">运行测试</button>

    <div v-if="logs.length" class="console">
      <div v-for="(l, i) in logs" :key="i" :class="{ ok: l.msg.startsWith('✓'), sec: l.msg.startsWith('---') }">
        {{ l.msg }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { font-family: ui-monospace, monospace; padding: 12px; color: #213547; max-width: 480px; }
.card h2 { font-family: system-ui, sans-serif; margin: 0 0 6px; font-size: 1rem; }
.hint { font-family: system-ui, sans-serif; font-size: 0.8rem; color: #666; margin: 0 0 10px; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.78rem; }
button.primary { padding: 6px 12px; border-radius: 6px; background: #42b883; color: #fff; border: 0; cursor: pointer; font-size: 0.85rem; margin-bottom: 10px; }
.console { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-size: 0.78rem; line-height: 1.7; }
.console .ok { color: #6ee7b7; }
.console .sec { color: #fbbf24; margin-top: 4px; }
</style>
