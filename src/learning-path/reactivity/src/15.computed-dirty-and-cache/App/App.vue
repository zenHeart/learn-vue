<template>
  <section class="r15">
    <h2>computed 缓存与 dirty 标记演示</h2>

    <!-- ① lazy + 缓存 -->
    <div class="card">
      <h3>① 缓存：连续读取同一 .value 只计算一次</h3>
      <p>double 值: {{ double }}</p>
      <p>计算次数: {{ computeCount }}</p>
      <button @click="count.value++">count++ (依赖变化)</button>
      <button @click="readDouble">读取 double (重新触发 lazy)</button>
    </div>

    <!-- ② 嵌套 computed 依赖链 -->
    <div class="card">
      <h3>② 嵌套 computed 依赖链</h3>
      <p>a = {{ a }}, b = a*2 = {{ b }}, c = b+1 = {{ c }}</p>
      <p>每次 a 变化后必须访问 .value 才级联重算</p>
      <button @click="a.value++">a++</button>
      <button @click="readAll">依次读取 b c (触发重算)</button>
    </div>

    <!-- ③ 反模式：computed getter 修改其他 ref -->
    <div class="card warn">
      <h3>③ 反模式 ❌ 在 computed getter 内修改其他 ref</h3>
      <p>打开控制台查看警告："Write operation failed: computed value is readonly"</p>
      <p>尝试读取 <code>bad.value</code> 会触发警告并中断</p>
      <button @click="accessBad">读取 bad.value</button>
    </div>

    <!-- ④ 修复方式：effect + flush:'sync' -->
    <div class="card ok">
      <h3>④ 正确方式 ✅ effect + flush:'sync' 做副作用同步</h3>
      <p>{{ echo }}</p>
      <button @click="a.value++">a++ (触发同步 effect)</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, effect } from 'vue'

/* === ① 缓存演示 === */
const count = ref(1)
const computeCount = ref(0)
const double = computed(() => {
  computeCount.value++
  return count.value * 2
})
function readDouble() {
  // 同步读取：同一次 tick 中多次读 double.value 不会重算
  const x = double.value
  const y = double.value
  return x + y
}

/* === ② 嵌套依赖链 === */
const a = ref(1)
const b = computed(() => a.value * 2)
const c = computed(() => b.value + 1)
function readAll() {
  return c.value
}

/* === ③ 反模式：computed 内修改 ref === */
const other = ref(0)
const bad = computed(() => {
  // ❌ 永远不要这么做
  other.value = a.value
  return a.value * 10
})
function accessBad() {
  // 触发写保护警告
  void bad.value
}

/* === ④ 修复方式 === */
const echo = ref('')
effect(() => {
  echo.value = `synced from a = ${a.value}`
})
</script>

<style scoped>
.r15 { font-family: system-ui; padding: 1rem; }
.r15 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r15 .card.warn { border-color: #e08585; background: #fff5f5; }
.r15 .card.ok { border-color: #6ec06e; background: #f5fff5; }
.r15 button { margin-right: 0.4rem; }
</style>
