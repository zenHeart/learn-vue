<template>
  <section class="r17">
    <h2>watch vs watchEffect 横向对比</h2>

    <div class="card">
      <h3>① watch：显式源 + 旧值/新值</h3>
      <p>a = {{ a }} | 上次: {{ lastA.old }} → {{ lastA.new }}</p>
      <button @click="a++">a++</button>
    </div>

    <div class="card">
      <h3>② watchEffect：隐式依赖，立即执行</h3>
      <p>任意依赖变化都会触发 effect 重新执行</p>
      <input v-model="b" />
      <input v-model.number="c" type="number" />
      <p>effect 触发次数: {{ effectCount }} (effect 写入的 message: "{{ message }}")</p>
    </div>

    <div class="card">
      <h3>③ 多源数组监听 + 数组解构</h3>
      <p>最近一组: ({{ lastPair[0] }}, {{ lastPair[1] }})</p>
      <button @click="x++">x++</button>
      <button @click="y++">y++</button>
    </div>

    <div class="card">
      <h3>④ once + immediate</h3>
      <p>once 触发次数: {{ onceCount }} / 当前 d: {{ d }}</p>
      <button @click="d++">d++ (只触发一次)</button>
    </div>

    <div class="card">
      <h3>⑤ flush 时机对比</h3>
      <p>pre / sync / post 三种 flush 在 tick 中的顺序</p>
      <button @click="e++">e++ (触发三种 watcher)</button>
      <pre>{{ flushLog }}</pre>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'

/* === ① watch 显式源 === */
let a = ref(0)
let lastA = reactive({ old: 0, new: 0 })
watch(a, (n, o) => { lastA.old = o; lastA.new = n }, { immediate: true })

/* === ② watchEffect 隐式依赖 === */
let b = ref('')
let c = ref(0)
let message = ref('')
let effectCount = ref(0)
watchEffect(() => {
  // 自动收集 b 和 c
  effectCount.value++
  message.value = `${b.value}/${c.value}`
})

/* === ③ 多源数组监听 === */
let x = ref(0)
let y = ref(0)
let lastPair = ref<[number, number]>([0, 0])
watch([x, y], ([nx, ny]) => {
  lastPair.value = [nx, ny]
}, { immediate: true })

/* === ④ once + immediate === */
let d = ref(0)
let onceCount = ref(0)
watch(d, () => { onceCount.value++ }, { immediate: true, once: true })

/* === ⑤ flush 时机 === */
let e = ref(0)
let flushLog = ref('')
const ts = () => new Date().toISOString().slice(11, 23)
watch(e, () => { flushLog.value += `\n[${ts()}] pre  e=${e.value}` }, { flush: 'pre' })
watch(e, () => { flushLog.value += `\n[${ts()}] sync e=${e.value}` }, { flush: 'sync' })
watch(e, () => { flushLog.value += `\n[${ts()}] post e=${e.value}` }, { flush: 'post' })
</script>

<script lang="ts">
import { reactive } from 'vue'
export default { name: 'R17' }
</script>

<style scoped>
.r17 { font-family: system-ui; padding: 1rem; }
.r17 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r17 button { margin-right: 0.4rem; }
.r17 input { margin-right: 0.4rem; padding: 2px 4px; }
.r17 pre { background: #f6f8fa; padding: 0.4rem; font-size: 12px; }
</style>
