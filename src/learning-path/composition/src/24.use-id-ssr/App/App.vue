<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 同页多个表单实例：id 互不冲突</h4>
      <FormField label="用户名" v-model="formA" />
      <FormField label="邮箱" v-model="formB" />
      <FormField label="手机" v-model="formC" />
      <p class="hint">每个 &lt;FormField /&gt; 内部 useId() —— 同页三份表单分别拿到 v-0 / v-1 / v-2</p>
    </section>

    <section class="card">
      <h4>② SSR 稳定：服务端 / 客户端拿同一个 id</h4>
      <SsrStableDemo />
    </section>

    <section class="card">
      <h4>③ 与传统 Math.random() 方案对比</h4>
      <RandomVsUseId />
    </section>

    <section class="card">
      <h4>④ v-for + useId：每次循环产生新 id</h4>
      <ul>
        <li v-for="i in 3" :key="i" class="row">
          <label :for="`row-${i}`">固定 id row-{{ i }}</label>
          <input :id="`row-${i}`" :ref="el => bindRow(el, i)" />
        </li>
      </ul>
      <p class="hint">label 的 :for 不需要 useId；只有组件内部才用</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormField from './FormField.vue'
import SsrStableDemo from './SsrStableDemo.vue'
import RandomVsUseId from './RandomVsUseId.vue'

const title = ref('useId()：SSR 安全的稳定 id 生成')

const formA = ref('')
const formB = ref('')
const formC = ref('')

const rowElements = new Map<number, HTMLInputElement>()
function bindRow(el: Element | null, id: number) {
  if (el) rowElements.set(id, el as HTMLInputElement)
  else rowElements.delete(id)
}
</script>

<style scoped>
.demo {
  max-width: 820px;
  margin: 16px auto;
  padding: 16px;
  color: #213547;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.card {
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #1e293b;
}
.hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: #64748b;
}
.row {
  display: flex;
  gap: 8px;
  align-items: center;
}
input {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}
ul {
  margin: 0;
  padding-left: 18px;
}
</style>