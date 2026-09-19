<template>
  <section class="r18">
    <h2>watch 源的三种形式与 deep 选项</h2>

    <div class="card">
      <h3>① ref 源</h3>
      <p>ref1 = {{ ref1 }}</p>
      <p>触发: {{ ref1Log.length }}</p>
      <button @click="ref1++">ref1++</button>
    </div>

    <div class="card">
      <h3>② reactive 源（隐式 deep，new === old）</h3>
      <p>obj.a.b = {{ obj.a.b }} | 触发: {{ reactiveLog.length }}</p>
      <p>new === old? {{ reactiveSameRef ? 'yes' : 'no' }}</p>
      <button @click="obj.a.b++">obj.a.b++</button>
    </div>

    <div class="card">
      <h3>③ getter 源 + 引用比较</h3>
      <p>getter 返回 obj.a 引用：{{ getterLast.new?.b }} (触发 {{ getterLog.length }})</p>
      <button @click="obj.a.b++">obj.a.b++ (引用未变，不触发)</button>
      <button @click="obj.a = { b: 999 }">替换 obj.a (新引用，触发)</button>
    </div>

    <div class="card">
      <h3>④ deep: 1（Vue 3.5 新增）</h3>
      <p>只追踪一层；深层修改不触发</p>
      <p>触发: {{ deepLog.length }}</p>
      <button @click="obj.x = obj.x + 1">改 obj.x (第 1 层,触发)</button>
      <button @click="obj.a.b = obj.a.b + 1">改 obj.a.b (第 2 层,不触发)</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

/* === ① ref 源 === */
let ref1 = ref(0)
let ref1Log = ref<number[]>([])
watch(ref1, v => { ref1Log.value.push(v) }, { immediate: true })

/* === ② reactive 源 === */
const obj = reactive({ a: { b: 0 }, x: 0 })
let reactiveLog = ref<number[]>([])
let reactiveSameRef = ref(false)
watch(obj, (n, o) => {
  reactiveSameRef.value = n === o
  reactiveLog.value.push(reactiveLog.value.length)
}, { immediate: true })

/* === ③ getter 源 === */
let getterLog = ref<{ new?: any; old?: any }[]>([])
let getterLast = ref<{ new?: any }>({})
watch(() => obj.a, (n, o) => {
  getterLast.value = { new: n }
  getterLog.value.push({ new: n, old: o })
}, { immediate: true })

/* === ④ deep: 1（仅 Vue 3.5+ 支持） === */
let deepLog = ref<number[]>([])
watch(() => obj, () => {
  deepLog.value.push(deepLog.value.length)
}, { deep: 1 })
</script>

<style scoped>
.r18 { font-family: system-ui; padding: 1rem; }
.r18 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r18 button { margin-right: 0.4rem; }
</style>
