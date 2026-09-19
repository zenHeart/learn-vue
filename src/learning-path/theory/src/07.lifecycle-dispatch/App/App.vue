<script setup lang="ts">
import { ref } from 'vue'

/* ============================================================
 * 极简 currentInstance + 生命周期调度
 * 仿 packages/runtime-core/src/lifecycle.ts
 * ============================================================ */

type Hook = 'beforeMount' | 'mounted' | 'beforeUnmount' | 'unmounted'

interface CompInstance {
  name: string
  children: CompInstance[]
  hooks: Record<Hook, Function[]>
}

const log = ref<string[]>([])
let step = 0
const record = (msg: string) => log.value.unshift(`#${++step} ${msg}`)

let __current: CompInstance | null = null
function setCurrent(i: CompInstance | null) {
  const prev = __current
  __current = i
  return () => { __current = prev }
}

function onBeforeMount(fn: Function) {
  if (!__current) return
  __current.hooks.beforeMount.push(fn)
}
function onMounted(fn: Function) {
  if (!__current) return
  __current.hooks.mounted.push(fn)
}
function onBeforeUnmount(fn: Function) {
  if (!__current) return
  __current.hooks.beforeUnmount.push(fn)
}
function onUnmounted(fn: Function) {
  if (!__current) return
  __current.hooks.unmounted.push(fn)
}

// SSR 模拟标志位
const isSSR = ref(false)

function makeInstance(name: string, children: CompInstance[] = []): CompInstance {
  return { name, children, hooks: { beforeMount: [], mounted: [], beforeUnmount: [], unmounted: [] } }
}

// 模拟组件的 setup
function runSetup(inst: CompInstance, fn: (api: { onBeforeMount: Function; onMounted: Function; onBeforeUnmount: Function; onUnmounted: Function }) => void) {
  const reset = setCurrent(inst)
  try {
    fn({ onBeforeMount, onMounted, onBeforeUnmount, onUnmounted })
  } finally {
    reset()
  }
}

// mountComponent：递归 mount 子组件
function mountComponent(inst: CompInstance) {
  record(`mount ${inst.name}: beforeMount 触发`)
  for (const h of inst.hooks.beforeMount) h()
  // 递归 mount 子组件
  for (const c of inst.children) mountComponent(c)
  record(`mount ${inst.name}: mounted 触发（post 队列，此处同步模拟）`)
  for (const h of inst.hooks.mounted) h()
}

// unmountComponent：先父 beforeUnmount 再子 unmounted（先深后冒泡的反向）
function unmountComponent(inst: CompInstance) {
  record(`unmount ${inst.name}: beforeUnmount 触发`)
  for (const h of inst.hooks.beforeUnmount) h()
  // 递归 unmount 子组件
  for (const c of inst.children) unmountComponent(c)
  record(`unmount ${inst.name}: unmounted 触发`)
  for (const h of inst.hooks.unmounted) h()
}

/* ============================================================
 * 演示
 * ============================================================ */

const Tree = ref<CompInstance>(null as any)
const mounted = ref(false)

function setupDemo() {
  const leaf = makeInstance('Leaf')
  const child = makeInstance('Child', [leaf])
  const root = makeInstance('Root', [child])

  // 在 setup 内注册钩子
  runSetup(root, ({ onMounted, onBeforeUnmount }) => {
    onMounted(() => record('>> Root mounted 回调执行'))
    onBeforeUnmount(() => record('>> Root beforeUnmount 回调执行'))
  })
  runSetup(child, ({ onMounted, onBeforeUnmount }) => {
    onMounted(() => record('>> Child mounted 回调执行'))
    onBeforeUnmount(() => record('>> Child beforeUnmount 回调执行'))
  })
  runSetup(leaf, ({ onMounted, onUnmounted }) => {
    onMounted(() => record('>> Leaf mounted 回调执行'))
    onUnmounted(() => record('>> Leaf unmounted 回调执行'))
  })

  Tree.value = root
  mounted.value = false
  log.value = []
}

function doMount() {
  if (!Tree.value) return
  record('--- mountComponent 开始 ---')
  mountComponent(Tree.value)
  mounted.value = true
  record('--- mountComponent 完成 ---')
}

function doUnmount() {
  if (!Tree.value || !mounted.value) return
  record('--- unmountComponent 开始 ---')
  unmountComponent(Tree.value)
  mounted.value = false
  record('--- unmountComponent 完成 ---')
}

function clearLog() { log.value = [] }
</script>

<template>
  <div class="lc-demo">
    <h3>07 · 生命周期调度</h3>

    <div class="row">
      <label><input type="checkbox" v-model="isSSR" /> SSR 模式（mounted 会被跳过）</label>
    </div>

    <div class="row">
      <button @click="setupDemo">注册钩子（setup）</button>
      <button @click="doMount" :disabled="!Tree || mounted">执行 mount</button>
      <button @click="doUnmount" :disabled="!mounted">执行 unmount</button>
      <button @click="clearLog">清空日志</button>
    </div>

    <div class="grid">
      <section>
        <h4>组件树</h4>
        <ul v-if="Tree">
          <li>Root
            <ul>
              <li>Child
                <ul><li>Leaf</li></ul>
              </li>
            </ul>
          </li>
        </ul>
        <p v-else>未注册</p>
      </section>

      <section>
        <h4>trace 日志</h4>
        <ul class="log">
          <li v-for="(l, i) in log.slice(0, 30)" :key="i" v-html="l"></li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.lc-demo { padding: 1rem; font-family: 'JetBrains Mono', monospace; }
.row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; margin-bottom: .75rem; }
button { padding: .35rem .8rem; border: 1px solid #888; background: #fff; border-radius: 4px; cursor: pointer; }
button:disabled { opacity: .5; cursor: not-allowed; }
.grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 1rem; }
section { background: #fafafa; padding: .75rem; border-radius: 6px; min-height: 260px; }
section h4 { margin: 0 0 .5rem; font-size: .9rem; }
.log { max-height: 320px; overflow: auto; font-size: .78rem; padding-left: 1rem; }
ul { list-style: disc; }
</style>
