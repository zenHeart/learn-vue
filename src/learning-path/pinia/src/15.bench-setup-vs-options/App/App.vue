<template>
  <div class="app">
    <h2>Setup vs Options · 微型基准</h2>
    <p class="hint">
      点击下方按钮,在 DevTools console 里查看 setup / options 的创建、读取、订阅耗时。
      数字因设备而异,看相对趋势即可。
    </p>

    <section>
      <h3>1) 创建 N 次 store</h3>
      <button @click="benchCreate">创建 1000 次</button>
      <pre v-if="createResult">{{ createResult }}</pre>
    </section>

    <section>
      <h3>2) 读取 state 字段</h3>
      <button @click="benchRead">读取 100000 次</button>
      <pre v-if="readResult">{{ readResult }}</pre>
    </section>

    <section>
      <h3>3) $subscribe 订阅触发</h3>
      <button @click="benchSubscribe">触发 5000 次 mutation</button>
      <pre v-if="subResult">{{ subResult }}</pre>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBenchSetupStore } from './stores/setup'
import { useBenchOptionsStore } from './stores/options'

const createResult = ref<string | null>(null)
const readResult = ref<string | null>(null)
const subResult = ref<string | null>(null)

function bench(label: string, fn: () => void) {
  const t0 = performance.now()
  fn()
  const t1 = performance.now()
  return (t1 - t0).toFixed(2)
}

function benchCreate() {
  const setup = bench('setup', () => {
    for (let i = 0; i < 1000; i++) useBenchSetupStore()
  })
  const options = bench('options', () => {
    for (let i = 0; i < 1000; i++) useBenchOptionsStore()
  })
  createResult.value = `setup: ${setup}ms\noptions: ${options}ms`
}

function benchRead() {
  const setup = useBenchSetupStore()
  const options = useBenchOptionsStore()
  const t0 = performance.now()
  let s = 0
  for (let i = 0; i < 100000; i++) s += setup.count
  const t1 = performance.now()
  let o = 0
  for (let i = 0; i < 100000; i++) o += options.count
  const t2 = performance.now()
  readResult.value = `setup: ${(t1 - t0).toFixed(2)}ms (sum=${s})\noptions: ${(t2 - t1).toFixed(2)}ms (sum=${o})`
}

function benchSubscribe() {
  const setup = useBenchSetupStore()
  const options = useBenchOptionsStore()
  let setupHits = 0
  let optionsHits = 0
  const sSub = setup.$subscribe(() => setupHits++)
  const oSub = options.$subscribe(() => optionsHits++)

  const t0 = performance.now()
  for (let i = 0; i < 5000; i++) {
    setup.count = i
    options.count = i
  }
  const t1 = performance.now()
  sSub()
  oSub()
  subResult.value =
    `耗时: ${(t1 - t0).toFixed(2)}ms\n` +
    `setup 订阅触发 ${setupHits} 次,options 订阅触发 ${optionsHits} 次`
}
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 760px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app section { margin: 1rem 0; padding: .6rem; border: 1px solid #d0d7de; border-radius: 6px; }
.app section h3 { margin: 0 0 .4rem; font-size: 1rem; }
.app pre { background: #f6f8fa; padding: .5rem; border-radius: 4px; font-size: .85em; }
.app button { padding: .25rem .6rem; border: 1px solid #d0d7de; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
