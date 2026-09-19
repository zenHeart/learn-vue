<template>
  <div class="demo">
    <h2>defineModel 对比手写 props + emit</h2>

    <section class="card">
      <h3>1. 基础 v-model 绑定</h3>
      <input v-model="title" placeholder="标题" />
      <p>父组件同步: <strong>{{ title }}</strong></p>
    </section>

    <section class="card">
      <h3>2. 多个 v-model</h3>
      <NameEditor v-model:first="firstName" v-model:last="lastName" />
      <p>first: <strong>{{ firstName }}</strong> / last: <strong>{{ lastName }}</strong></p>
    </section>

    <section class="card">
      <h3>3. modifiers: trim + number</h3>
      <NumberField v-model.number="age" placeholder="年龄" />
      <p>父组件拿到的值类型: <strong>{{ typeof age }}</strong> = {{ age }}</p>
      <p class="hint">输入框已带 .number 修饰符，输入 1.5 自动转 number</p>
    </section>

    <section class="card">
      <h3>4. local / 受控 / 非受控切换</h3>
      <UncontrolledBox />
      <p class="hint">传入 local: true 后父组件不绑定也能内部维护状态</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NameEditor from './NameEditor.vue'
import NumberField from './NumberField.vue'
import UncontrolledBox from './UncontrolledBox.vue'

const title = ref('hello')
const firstName = ref('张')
const lastName = ref('三')
const age = ref<number | string>(18)
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0 0; font-size: 12px; color: #888; }
input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; }
</style>
