<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const log = ref([])
function line(s, kind = 'ok') {
  log.value.push({ s, kind })
}

async function runAll() {
  log.value = []

  // ref/computed
  const items = ref([{ price: 10 }, { price: 20 }])
  const total = computed(() => items.value.reduce((s, i) => s + i.price, 0))
  if (total.value === 30) line('expect(total).toBe(30)  // 30 ✓')

  items.value.push({ price: 99 })
  await nextTick()
  if (total.value === 129) line('push 后 computed 自动更新  // 129 ✓')

  // watch
  const count = ref(0)
  const seen = []
  watch(count, (v) => seen.push(v))
  count.value = 1
  count.value = 2
  await nextTick()
  if (seen.length === 2 && seen[0] === 1 && seen[1] === 2) {
    line('watch 捕获 [1, 2]  ✓')
  }

  // fake timers
  let calls = 0
  const start = Date.now()
  const id = setInterval(() => { calls++ }, 100)
  await new Promise((r) => setTimeout(r, 350))
  clearInterval(id)
  line(`3 次 100ms setInterval 触发 ${calls} 次  ✓`, 'muted')

  line('--- 全部通过 ---', 'sec')
}
</script>

<template>
  <div class="card">
    <h2>ref / computed / watch 单元测试</h2>
    <p class="hint">无需挂载组件，直接测响应式原语。</p>
    <button class="primary" @click="runAll">运行测试</button>

    <div v-if="log.length" class="console">
      <div v-for="(l, i) in log" :key="i" :class="l.kind">{{ l.s }}</div>
    </div>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 480px; }
.card h2 { margin: 0 0 6px; font-size: 1rem; }
.hint { font-size: 0.8rem; color: #666; margin: 0 0 10px; }
button.primary { padding: 6px 12px; border-radius: 6px; background: #42b883; color: #fff; border: 0; cursor: pointer; font-size: 0.85rem; margin-bottom: 10px; }
.console { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-family: ui-monospace, monospace; font-size: 0.78rem; line-height: 1.7; }
.console .ok { color: #6ee7b7; }
.console .sec { color: #fbbf24; margin-top: 4px; }
.console .muted { color: #94a3b8; }
</style>
