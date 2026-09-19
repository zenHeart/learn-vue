<template>
  <section class="r13">
    <h2>集合类型响应式：Map / Set / shallow / markRaw</h2>

    <!-- Part 1: reactive(Map) -->
    <div class="card">
      <h3>① reactive(new Map()) 触发更新</h3>
      <button @click="addMap">map.set('k{{ map.size }}', ...)</button>
      <button @click="map.delete('k0')">delete k0</button>
      <p>size: {{ map.size }} — entries: {{ mapEntries }}</p>
    </div>

    <!-- Part 2: shallowReactive 不递归 -->
    <div class="card">
      <h3>② shallowReactive 不递归</h3>
      <p>外层替换 <strong>会</strong>触发；内部 push <strong>不会</strong>触发</p>
      <button @click="shallow.inner.list.push(shallow.inner.list.length)">
        shallow.inner.list.push (无响应)
      </button>
      <button @click="replaceShallow">整个 shallow = 新对象 (有响应)</button>
      <p>render count: {{ renderCount }}</p>
    </div>

    <!-- Part 3: markRaw 第三方实例 -->
    <div class="card">
      <h3>③ markRaw 阻止代理</h3>
      <button @click="thirdParty.tick()">第三方实例 .tick()</button>
      <button @click="reassign">替换 thirdParty 为新对象</button>
      <p>raw === wrapped? {{ sameRef ? 'yes (没被代理)' : 'no (被代理了)' }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, shallowReactive, markRaw, ref, onRenderTriggered } from 'vue'

/* === ① reactive(Map) ============================================ */
const map = reactive(new Map<string, number>())
map.set('k0', 0)
const mapEntries = ref('')
function refreshMapEntries() {
  mapEntries.value = JSON.stringify([...map.entries()])
}
refreshMapEntries()
function addMap() {
  const k = `k${map.size}`
  map.set(k, map.size)
  refreshMapEntries()
}
// 监听 delete 后刷新文本
import { watch } from 'vue'
watch(map, refreshMapEntries)

/* === ② shallowReactive 不递归 ================================== */
const shallow = shallowReactive<{ inner: { list: number[] } }>({
  inner: { list: [1, 2, 3] }
})
const renderCount = ref(0)
onRenderTriggered(() => { renderCount.value++ })
function replaceShallow() {
  shallow.inner = { list: [99, 100] } // 外层属性赋值才会触发
}

/* === ③ markRaw 跳过代理 ======================================== */
class ThirdParty {
  ticks = 0
  tick() { this.ticks++ }
}
const raw = new ThirdParty()
const wrapped = reactive({ inst: markRaw(raw) })
const sameRef = ref(wrapped.inst === raw)
function reassign() {
  // 替换属性依然有效（reactive 本身是深代理）
  wrapped.inst = markRaw(new ThirdParty())
}
</script>

<style scoped>
.r13 { font-family: system-ui; padding: 1rem; }
.r13 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r13 button { margin-right: 0.4rem; }
</style>
