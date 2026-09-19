<template>
  <section class="r21">
    <h2>reactive vs ref vs shallowRef 性能基准</h2>

    <div class="card">
      <h3>基准配置</h3>
      <label>字段数: <input type="number" v-model.number="size" /></label>
      <label>读次数: <input type="number" v-model.number="iterations" /></label>
      <button @click="run">运行基准</button>
      <button @click="reset">重置</button>
    </div>

    <div class="card">
      <h3>结果（毫秒）</h3>
      <table>
        <thead>
          <tr><th>API</th><th>首次创建</th><th>读取 N 次</th></tr>
        </thead>
        <tbody>
          <tr><td>plain</td><td>{{ result.plain.create.toFixed(3) }}</td><td>{{ result.plain.read.toFixed(3) }}</td></tr>
          <tr><td>reactive</td><td>{{ result.reactive.create.toFixed(3) }}</td><td>{{ result.reactive.read.toFixed(3) }}</td></tr>
          <tr><td>ref</td><td>{{ result.ref.create.toFixed(3) }}</td><td>{{ result.ref.read.toFixed(3) }}</td></tr>
          <tr><td>shallowRef</td><td>{{ result.shallowRef.create.toFixed(3) }}</td><td>{{ result.shallowRef.read.toFixed(3) }}</td></tr>
        </tbody>
      </table>
      <p v-if="result.note">{{ result.note }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, shallowRef } from 'vue'

const size = ref(1000)
const iterations = ref(10000)

const result = ref({
  plain: { create: 0, read: 0 },
  reactive: { create: 0, read: 0 },
  ref: { create: 0, read: 0 },
  shallowRef: { create: 0, read: 0 },
  note: ''
})

function makeObj(n: number) {
  const o: Record<string, number> = {}
  for (let i = 0; i < n; i++) o['k' + i] = i
  return o
}

function bench(name: string, createFn: () => any, readFn: (o: any) => number) {
  // warmup
  for (let i = 0; i < 3; i++) {
    const o = createFn()
    readFn(o)
  }
  // 创建耗时
  const t0 = performance.now()
  const obj = createFn()
  const t1 = performance.now()
  // 读取耗时
  let sum = 0
  const t2 = performance.now()
  for (let i = 0; i < iterations.value; i++) {
    sum += readFn(obj)
  }
  const t3 = performance.now()
  ;(result.value as any)[name].create = t1 - t0
  ;(result.value as any)[name].read = t3 - t2
}

function run() {
  const n = size.value
  bench('plain', () => makeObj(n), o => {
    let s = 0
    for (const k in o) s += o[k]
    return s
  })
  bench('reactive', () => reactive(makeObj(n)), o => {
    let s = 0
    for (const k in o) s += o[k]
    return s
  })
  bench('ref', () => ref(makeObj(n)), o => {
    const inner = o.value
    let s = 0
    for (const k in inner) s += inner[k]
    return s
  })
  bench('shallowRef', () => shallowRef(makeObj(n)), o => {
    const inner = o.value
    let s = 0
    for (const k in inner) s += inner[k]
    return s
  })
  result.value.note = `已完成 ${n} 字段 × ${iterations.value} 次读。shallowRef 通常最快，reactive 在大对象上最慢。`
}

function reset() {
  result.value = {
    plain: { create: 0, read: 0 },
    reactive: { create: 0, read: 0 },
    ref: { create: 0, read: 0 },
    shallowRef: { create: 0, read: 0 },
    note: ''
  }
}
</script>

<style scoped>
.r21 { font-family: system-ui; padding: 1rem; }
.r21 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r21 input { width: 100px; margin-right: 0.6rem; }
.r21 button { margin-right: 0.4rem; }
.r21 table { border-collapse: collapse; }
.r21 th, .r21 td { border: 1px solid #ddd; padding: 4px 12px; text-align: left; }
</style>
