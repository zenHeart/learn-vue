<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① label + input 关联</h4>
      <FormField label="用户名" v-model="username" />
      <FormField label="邮箱" v-model="email" />
      <p>用户名：{{ username }}</p>
      <p>邮箱：{{ email }}</p>
    </section>

    <section class="card">
      <h4>② 同一 setup 内多次 useId</h4>
      <p>for 关联 id：{{ idA }}</p>
      <p>aria-describedby id：{{ idB }}</p>
      <p class="hint">每次调用 useId() 自增，必须缓存到 const 才能双向引用</p>
    </section>

    <section class="card">
      <h4>③ 多次实例：每个独立 ID</h4>
      <FormField label="实例1" v-model="f1" />
      <FormField label="实例2" v-model="f2" />
    </section>
  </div>
</template>

<script setup>
import { ref, useId } from 'vue'
import FormField from './FormField.vue'

const title = ref('useId：SSR 安全 ID 生成')

const username = ref('')
const email = ref('')
const f1 = ref('')
const f2 = ref('')

// ② 多次调用
const idA = useId()
const idB = useId()
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
  margin-left: 6px;
}
.hint { font-size: 12px; color: #888; }
</style>
