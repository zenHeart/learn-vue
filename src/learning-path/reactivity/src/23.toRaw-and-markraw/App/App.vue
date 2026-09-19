<template>
  <section class="r23">
    <h2>toRaw / markRaw：脱离响应式</h2>

    <div class="card">
      <h3>① toRaw 取原始引用</h3>
      <p>原始 === 代理? {{ isSame ? '是' : '否' }}</p>
      <p>原始数据（toRaw 后 JSON 序列化）:</p>
      <pre>{{ rawJson }}</pre>
      <button @click="state.nested.x++">改 nested.x</button>
    </div>

    <div class="card">
      <h3>② markRaw 第三方实例</h3>
      <p>terrainMap === terrainMap (proxy)? {{ terrainSame ? '是（未被代理）' : '否' }}</p>
      <p>render count: {{ renderTick }}</p>
      <button @click="terrainMap.flyTo({ lat: 31 + Math.random(), lng: 121 })">
        flyTo 内部修改 (无响应)
      </button>
      <button @click="replaceTerrain">整体替换 terrainMap (有响应)</button>
    </div>

    <div class="card">
      <h3>③ 大型静态数据 markRaw 性能优化</h3>
      <p>10k 字段读取耗时: {{ readMs.toFixed(2) }} ms</p>
      <button @click="measureLarge">运行基准</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, toRaw, markRaw, shallowRef, triggerRef } from 'vue'

/* === ① toRaw === */
const state = reactive({ nested: { x: 1, y: 2 }, name: 'origin' })
const raw = toRaw(state)
const isSame = ref(false)
const rawJson = ref('')
isSame.value = raw === state
rawJson.value = JSON.stringify(raw)

watch(state, () => {
  rawJson.value = JSON.stringify(toRaw(state))
})

/* === ② markRaw 第三方实例 === */
class TerrainMap {
  lat = 31
  lng = 121
  flyTo(p: { lat: number; lng: number }) { this.lat = p.lat; this.lng = p.lng }
}
const terrain = markRaw(new TerrainMap())
const mapState = reactive({ terrainMap: terrain })
const terrainSame = ref(mapState.terrainMap === terrain)
const renderTick = ref(0)
watchEffect(() => { renderTick.value++ }) // 用于演示

function replaceTerrain() {
  mapState.terrainMap = markRaw(new TerrainMap())
  terrainSame.value = mapState.terrainMap !== terrain // 现在确实变了
}

/* === ③ 大数据 markRaw 基准 === */
const readMs = ref(0)
function measureLarge() {
  const big: Record<string, number> = {}
  for (let i = 0; i < 10000; i++) big['k' + i] = i
  const bigRaw = markRaw(big)
  const bigReactive = reactive(big)

  let s = 0
  const t0 = performance.now()
  for (const k in bigRaw) s += bigRaw[k]
  const t1 = performance.now()
  for (const k in bigReactive) s += bigReactive[k]
  const t2 = performance.now()

  readMs.value = (t1 - t0) + (t2 - t1)
}
</script>

<style scoped>
.r23 { font-family: system-ui; padding: 1rem; }
.r23 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r23 button { margin-right: 0.4rem; }
.r23 pre { background: #f6f8fa; padding: 0.4rem; font-size: 12px; }
</style>
