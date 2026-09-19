<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① toValue 处理三种输入</h4>
      <table>
        <thead><tr><th>输入</th><th>toValue 结果</th><th>类型</th></tr></thead>
        <tbody>
          <tr><td>ref(42)</td><td>{{ fromRef }}</td><td>number</td></tr>
          <tr><td>() => 42</td><td>{{ fromGetter }}</td><td>number</td></tr>
          <tr><td>42</td><td>{{ fromRaw }}</td><td>number</td></tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <h4>② useTitle composable：响应式跟随</h4>
      <input v-model="pageTitle" placeholder="页面标题" />
      <p>document.title 已绑定（运行时同步）</p>
    </section>

    <section class="card">
      <h4>③ 与 unref 的差异</h4>
      <p>toValue(getterFn) → {{ toOnGetter }}</p>
      <p>unref(getterFn) → 仍是函数：{{ typeof unrefOnGetter }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref, toValue, unref, watchEffect, isRef } from 'vue'

const title = ref('toValue（3.3+）：统一 ref / getter / 原始值')

/* === ① === */
const r = ref(42)
const g = () => 42
const fromRef = toValue(r)
const fromGetter = toValue(g)
const fromRaw = toValue(42)

/* === ② useTitle === */
const pageTitle = ref('Vue 3 demo')
function useTitle(source) {
  watchEffect(() => {
    document.title = toValue(source)
  })
}
useTitle(pageTitle)

/* === ③ 对比 === */
const getterFn = () => 'computed'
const toOnGetter = toValue(getterFn)
const unrefOnGetter = unref(getterFn)
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 720px;
}
.card {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 10px;
  margin: 10px 0;
  background: #fff;
}
table { border-collapse: collapse; width: 100%; font-size: 13px; }
th, td { border: 1px solid #e2e8f0; padding: 4px 8px; text-align: left; }
input { padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; }
</style>
