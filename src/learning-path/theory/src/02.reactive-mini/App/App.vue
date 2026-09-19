<script setup lang="ts">
import { ref, computed } from 'vue'

/* ============================================================
 * 极简 reactive / effect / track / trigger 实现
 * 借鉴 packages/reactivity/src/effect.ts 的核心结构
 * ============================================================ */

// 类型
type Dep = Set<{ run: () => void; deps: Dep[] }> & { cleanup?: () => void }
type KeyToDepMap = Map<unknown, Dep>

// 全局依赖收集结构
const targetMap = new WeakMap<object, KeyToDepMap>()
let activeEffect: { run: () => void; deps: Dep[] } | undefined
const effectStack: { run: () => void; deps: Dep[] }[] = []

// 创建带 cleanup 的 dep 集合
function createDep(): Dep {
  const set = new Set() as Dep
  ;(set as any).cleanup = () => set.clear()
  return set
}

// track：读取属性时记录依赖
function track(target: object, key: unknown) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))
  let dep = depsMap.get(key)
  if (!dep) depsMap.set(key, (dep = createDep()))
  // 双向收集：dep 持有 effect，effect 也持有 dep（用于 cleanup）
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

// trigger：写入属性时通知 effect
function trigger(target: object, key: unknown) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep = depsMap.get(key)
  if (dep) (dep as any).cleanup?.()
  dep.forEach((eff) => eff.run())
}

// reactive：基于 Proxy 的极简实现
function reactive<T extends object>(target: T): T {
  return new Proxy(target, {
    get(t, key) {
      track(t, key)
      const v = Reflect.get(t, key)
      return typeof v === 'object' && v !== null ? reactive(v) : v
    },
    set(t, key, value) {
      const old = (t as any)[key]
      const ok = Reflect.set(t, key, value)
      if (old !== value) trigger(t, key)
      return ok
    }
  })
}

// effect：注册一个响应式副作用
function effect(fn: () => void) {
  const e = {
    deps: [] as Dep[],
    run() {
      // cleanup：清理上一次收集到的依赖，避免分支切换残留
      e.deps.forEach((d) => d.delete(e))
      e.deps.length = 0
      // 入栈
      effectStack.push(e)
      activeEffect = e
      try {
        fn()
      } finally {
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }
  e.run()
  return e
}

/* ============================================================
 * 演示区
 * ============================================================ */

// 1. 基础 reactive + effect 演示
const state = reactive({ count: 0, branch: 'A' as 'A' | 'B' })
const log = ref<string[]>([])
const addLog = (msg: string) => log.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)

// effect1: 订阅 count
let runCount = 0
effect(() => {
  runCount++
  addLog(`effect1 触发 #${runCount}, count=${state.count}`)
})

// 2. 嵌套 effect 演示（组件渲染 + watchEffect 场景）
const innerRuns = ref(0)
const outerRuns = ref(0)
effect(() => {
  outerRuns.value++
  // 内层 effect：模拟组件 setup 里 watchEffect
  effect(() => {
    innerRuns.value++
    // 仅访问 branch A 时的依赖
    if (state.branch === 'A') {
      addLog(`内层 effect 看到 branch=A`)
    }
  })
})

// 3. 可视化 targetMap
const depSnapshot = ref<Record<string, string[]>>({})
function refreshSnapshot() {
  const snap: Record<string, string[]> = {}
  for (const [t, dm] of targetMap) {
    const k = (t as any).__label ?? Object.values(t).join('-') ?? 'state'
    snap[k] = []
    for (const [key, dep] of dm) {
      snap[k].push(`${String(key)} -> ${dep.size} effect`)
    }
  }
  depSnapshot.value = snap
}
refreshSnapshot()

// 操作触发
function incCount() { state.count++ ; refreshSnapshot() }
function switchBranch() { state.branch = state.branch === 'A' ? 'B' : 'A' ; refreshSnapshot() }

const c = computed(() => state.count * 2)
</script>

<template>
  <div class="mini-reactive">
    <h3>02 · 极简 reactive / effect</h3>

    <div class="row">
      <button @click="incCount">count++</button>
      <button @click="switchBranch">切换分支 {{ state.branch }}</button>
      <span>double = {{ c }}</span>
    </div>

    <div class="grid">
      <section>
        <h4>依赖图 targetMap</h4>
        <ul>
          <li v-for="(deps, target) in depSnapshot" :key="target">
            <code>{{ target }}</code>
            <ul>
              <li v-for="d in deps" :key="d">{{ d }}</li>
            </ul>
          </li>
        </ul>
        <p class="hint">注意：当分支切换到 B，cleanup 会清掉 A 上残留的 effect 订阅。</p>
      </section>

      <section>
        <h4>运行计数</h4>
        <p>外层 effect: {{ outerRuns }} 次</p>
        <p>内层 effect: {{ innerRuns }} 次</p>
        <p>addCount total: {{ runCount }}</p>
      </section>

      <section>
        <h4>trace 日志</h4>
        <ul class="log">
          <li v-for="(l, i) in log.slice(0, 12)" :key="i">{{ l }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.mini-reactive { padding: 1rem; font-family: 'JetBrains Mono', monospace; }
.row { display: flex; gap: .5rem; align-items: center; margin-bottom: 1rem; }
button { padding: .35rem .8rem; border: 1px solid #888; background: #fff; border-radius: 4px; cursor: pointer; }
button:hover { background: #f0f0f0; }
.grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
section { background: #fafafa; padding: .75rem; border-radius: 6px; min-height: 220px; }
section h4 { margin: 0 0 .5rem; font-size: .9rem; }
.log { max-height: 220px; overflow: auto; font-size: .78rem; padding-left: 1rem; }
.hint { font-size: .75rem; color: #888; }
</style>
