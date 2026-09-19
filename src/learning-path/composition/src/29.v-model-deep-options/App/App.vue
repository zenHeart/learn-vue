<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 基础：get / set 转换 number 字符串</h4>
      <NumberField v-model="count" />
      <p>父组件拿到的值: <code>{{ count }}</code> (typeof: <strong>{{ typeof count }}</strong>)</p>
    </section>

    <section class="card">
      <h4>② 修饰符：父组件传 trim/number，子组件消费</h4>
      <TrimField v-model.trim="username" placeholder="用户名（trim）" />
      <p>父组件拿到: <code>"{{ username }}"</code> (length: {{ username.length }})</p>
    </section>

    <section class="card">
      <h4>③ 自定义 debounce：延迟触发 emit</h4>
      <DebouncedField v-model="keyword" placeholder="快速输入观察延迟" />
      <p>父组件值: <code>{{ keyword }}</code></p>
      <p class="hint">子组件 set 中 debounce 300ms 后才 emit</p>
    </section>

    <section class="card">
      <h4>④ get：父组件传 ISO，子组件拿到 Date</h4>
      <DateField v-model="iso" />
      <p>父组件 prop 是 ISO 字符串: <code>{{ iso }}</code></p>
      <p class="hint">打开 DevTools 看 child 内部 ref 类型</p>
    </section>

    <section class="card">
      <h4>⑤ 多个 v-model + 不同 options</h4>
      <MultiField v-model:first="first" v-model:last="last" />
      <p>first: <code>{{ first }}</code> / last: <code>{{ last }}</code></p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NumberField from './NumberField.vue'
import TrimField from './TrimField.vue'
import DebouncedField from './DebouncedField.vue'
import DateField from './DateField.vue'
import MultiField from './MultiField.vue'

const title = ref('defineModel 深度选项：get/set/debounce/modifiers')

const count = ref<number | string>(0)
const username = ref('')
const keyword = ref('')
const iso = ref('2024-09-19T00:00:00Z')
const first = ref('')
const last = ref('')
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
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}
code {
  font-family: 'SFMono-Regular', Consolas, monospace;
  background: #fef9c3;
  padding: 1px 4px;
  border-radius: 3px;
}
</style>
