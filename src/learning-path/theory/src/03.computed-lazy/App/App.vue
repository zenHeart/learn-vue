<script setup lang="ts">
import { ref, computed } from 'vue'

/* ============================================================
 * 极简 myComputed：lazy + dirty
 * 仿 packages/reactivity/src/computed.ts
 * ============================================================ */
const __targetMap = new WeakMap<object, Map<unknown, Set<() => void>>>()
let __active: (() => void) | undefined

function __track(t: object, k: unknown) {
  if (!__active) return
  let m = __targetMap.get(t); if (!m) __targetMap.set(t, (m = new Map()))
  let s = m.get(k); if (!s) m.set(k, (s = new Set()))
  s.add(__active)
}
function __trigger(t: object, k: unknown) {
  const m = __targetMap.get(t); if (!m) return
  const s = m.get(k); if (!s) return
  for (const fn of [...s]) fn()
}

function myRef<T>(v: T) {
  const r = { value: v }
  const proxy = new Proxy(r, {
    get(t, k) { __track(t, k); return Reflect.get(t, k) },
    set(t, k, v) { const old = (t as any)[k]; const ok = Reflect.set(t, k, v); if (old !== v) __trigger(t, k); return ok }
  })
  return proxy as { value: T }
}

function myComputed<T>(getter: () => T) {
  let dirty = true
  let cached!: T
  let dep: Set<() => void> = new Set()

  function recompute() {
    if (!dirty) return
    cached = getter()
    dirty = false
  }

  const prevActive = __active
  __active = () => {
    if (!dirty) {
      dirty = true
      // 通知下游
      for (const fn of [...dep]) fn()
    }
  }
  recompute()
  __active = prevActive

  return {
    get value() {
      if (__active) dep.add(__active)
      if (dirty) {
        cached = getter()
        dirty = false
      }
      return cached
    }
  }
}

/* ============================================================
 * 演示
 * ============================================================ */

const a = myRef(2)
const b = myRef(3)

// 1) lazy 演示：computed 定义时不计算 getter
let lazyHits = 0
const sumLazy = myComputed(() => { lazyHits++; return a.value + b.value })

// 2) 普通 effect：依赖变立即同步执行
const normalLog = ref<string[]>([])
let normalRuns = 0
const _trackActive = () => { normalRuns++; normalLog.value.unshift(`[${normalRuns}] 普通 effect 触发: a=${a.value}, b=${b.value}`) }
;(() => {
  // 模拟普通 effect 注册
  const prev = __active
  __active = _trackActive
  void a.value
  void b.value
  __active = prev
})()

// 3) computed 读：触发下游重算计数
const consumerLog = ref<string[]>([])
let consumerRuns = 0
;(function registerConsumer() {
  const prev = __active
  __active = () => { consumerRuns++; consumerLog.value.unshift(`consumer #${consumerRuns} 看到 sum=${sumLazy.value}`) }
  void sumLazy.value
  __active = prev
})()

const dirty = ref(true)
function bumpA() { a.value++ ; dirty.value = true }
function bumpB() { b.value++ ; dirty.value = true }

const readSum = () => { dirty.value = false; return sumLazy.value }
</script>

<template>
  <div class="computed-demo">
    <h3>03 · computed lazy / dirty</h3>

    <div class="row">
      <button @click="bumpA">a++  (a={{ a.value }})</button>
      <button @click="bumpB">b++  (b={{ b.value }})</button>
      <button @click="readSum">读取 sum.value</button>
      <span>lazy getter 实际执行次数: <b>{{ lazyHits }}</b></span>
    </div>

    <div class="grid">
      <section>
        <h4>lazy 行为</h4>
        <p>定义 computed 时 getter 不执行（点击按钮不增加 lazyHits）。</p>
        <p>当前 sum = {{ sumLazy.value }}</p>
        <p>dirty = {{ dirty }}</p>
      </section>

      <section>
        <h4>普通 effect</h4>
        <ul class="log">
          <li v-for="(l, i) in normalLog.slice(0, 6)" :key="i">{{ l }}</li>
        </ul>
      </section>

      <section>
        <h4>computed 下游 consumer</h4>
        <p>总触发次数: {{ consumerRuns }}</p>
        <ul class="log">
          <li v-for="(l, i) in consumerLog.slice(0, 6)" :key="i">{{ l }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.computed-demo { padding: 1rem; font-family: 'JetBrains Mono', monospace; }
.row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
button { padding: .35rem .8rem; border: 1px solid #888; background: #fff; border-radius: 4px; cursor: pointer; }
.grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
section { background: #fafafa; padding: .75rem; border-radius: 6px; min-height: 220px; }
section h4 { margin: 0 0 .5rem; font-size: .9rem; }
.log { max-height: 180px; overflow: auto; font-size: .78rem; padding-left: 1rem; }
</style>
