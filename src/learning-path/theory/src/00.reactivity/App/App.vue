<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <p>state.count = {{ state.count }}</p>
    <p>state.double = {{ state.double }}</p>
    <button @click="state.count++">count++</button>
    <p class="meta">
      本 demo 同时跑一个 mini reactive：<code>track</code> 在 getter 收集依赖，<code>trigger</code> 在 setter 派发更新。
    </p>
    <p>mini reactive count = {{ mini.count }}</p>
    <button @click="mini.count++">mini++</button>
  </div>
</template>

<script setup>
import { ref, reactive, computed, effect } from 'vue'

const title = ref('响应式原理：手写 mini reactive')

const state = reactive({
  count: 0,
  double: computed(() => state.count * 2)
})

// 手写 30 行 reactive + effect
const targetMap = new WeakMap()
const stack = []
let active = null

function track(t, k) {
  if (!active) return
  let m = targetMap.get(t)
  if (!m) targetMap.set(t, (m = new Map()))
  let s = m.get(k)
  if (!s) m.set(k, (s = new Set()))
  s.add(active)
}
function trigger(t, k) {
  const m = targetMap.get(t)
  if (!m) return
  const s = m.get(k)
  s && s.forEach((fn) => fn())
}
function reactive2(obj) {
  return new Proxy(obj, {
    get(t, k) { track(t, k); return Reflect.get(t, k) },
    set(t, k, v) { const res = Reflect.set(t, k, v); trigger(t, k); return res }
  })
}

const mini = reactive2({ count: 0 })
effect(() => console.log('[mini] count =', mini.count))
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 520px;
}
button {
  margin-right: 6px;
  padding: 4px 10px;
}
code {
  background: #e2e8f0;
  padding: 0 4px;
  border-radius: 3px;
}
.meta {
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
}
</style>