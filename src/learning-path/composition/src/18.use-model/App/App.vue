<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 基础 v-model（默认 modelValue）</h4>
      <Child v-model="text" />
      <p>父组件：{{ text }}</p>
    </section>

    <section class="card">
      <h4>② 自定义事件名（多 v-model）</h4>
      <MultiChild v-model:first="firstName" v-model:last="lastName" />
      <p>父：{{ firstName }} / {{ lastName }}</p>
    </section>

    <section class="card">
      <h4>③ transform：写入前转换（trim）</h4>
      <TrimChild v-model="tag" />
      <p>父：{{ JSON.stringify(tag) }}</p>
      <p class="hint">子组件把外部输入做了 trim 转换</p>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Child from './Child.vue'
import MultiChild from './MultiChild.vue'
import TrimChild from './TrimChild.vue'

const title = ref('useModel：函数式双向绑定')
const text = ref('hello')
const firstName = ref('张')
const lastName = ref('三')
const tag = ref('  vue  ')
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
input {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}
.hint { font-size: 12px; color: #888; }
</style>
