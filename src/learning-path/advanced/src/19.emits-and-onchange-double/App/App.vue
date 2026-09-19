<template>
  <div class="demo">
    <h2>19 · emits + props.onChange 双触发</h2>

    <section class="card">
      <h3>① ❌ 错误写法：emit + props.onChange 同时调用</h3>
      <BadChild @change="onBadChange" />
      <p>父级 handler 触发次数：<strong>{{ badCount }}</strong></p>
      <p class="hint">每次点击子组件按钮，change 被 emit 触发一次 + props.onChange 主动调一次 → 重复 2 次。</p>
    </section>

    <section class="card">
      <h3>② ✅ 正确写法：只走 emit</h3>
      <GoodChild @change="onGoodChange" />
      <p>父级 handler 触发次数：<strong>{{ goodCount }}</strong></p>
      <p class="hint">每次点击只触发 1 次。</p>
    </section>

    <section class="card">
      <h3>③ Vue 2 兼容写法：纯 props.onChange 函数</h3>
      <LegacyChild :on-change="onLegacyChange" />
      <p>父级 handler 触发次数：<strong>{{ legacyCount }}</strong></p>
      <p class="hint">仿 React 风格的"传函数当 prop"——Vue 3 仍然支持，但需要显式在父级写 <code>:on-change</code>。</p>
    </section>

    <section class="card">
      <h3>trace 日志</h3>
      <pre>{{ log }}</pre>
      <button @click="reset">清空</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BadChild from './BadChild.vue'
import GoodChild from './GoodChild.vue'
import LegacyChild from './LegacyChild.vue'

const badCount = ref(0)
const goodCount = ref(0)
const legacyCount = ref(0)
const log = ref('')

function append(msg: string) {
  log.value = `[${new Date().toLocaleTimeString()}] ${msg}\n` + log.value
}

function onBadChange(v: string) {
  badCount.value++
  append(`❌ Bad: 收到 "${v}"（第 ${badCount.value} 次）`)
}
function onGoodChange(v: string) {
  goodCount.value++
  append(`✅ Good: 收到 "${v}"（第 ${goodCount.value} 次）`)
}
function onLegacyChange(v: string) {
  legacyCount.value++
  append(`🟦 Legacy: 收到 "${v}"（第 ${legacyCount.value} 次）`)
}

function reset() {
  badCount.value = 0
  goodCount.value = 0
  legacyCount.value = 0
  log.value = ''
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { color: #888; font-size: 12px; margin-top: 4px; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 8px; font-size: 12px; max-height: 200px; overflow: auto; border-radius: 4px; }
code { background: #f6f8fa; padding: 1px 4px; border-radius: 3px; }
</style>
