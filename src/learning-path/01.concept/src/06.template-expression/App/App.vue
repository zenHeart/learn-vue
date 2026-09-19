<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <ul>
      <li>字符串反转：{{ reversed }}</li>
      <li>数字运算：{{ a }} + {{ b }} = {{ a + b }}</li>
      <li>三元表达式：{{ score >= 60 ? '及格' : '未及格' }}</li>
      <li>Math 全局可用：{{ Math.round(price * 100) / 100 }}</li>
      <li>数组方法：{{ list.join(' / ') }}</li>
    </ul>
    <p class="meta">
      注意：模板表达式只能使用白名单全局（Math、Date、JSON 等），不能声明 <code>var/let/const</code>，也不能使用 <code>if/for</code> 等语句。
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const title = ref('模板表达式与限制')
const a = ref(7)
const b = ref(13)
const score = ref(82)
const price = ref(12.345)
const list = ref(['apple', 'banana', 'cherry'])

const reversed = computed(() => 'hello'.split('').reverse().join(''))
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
}
ul {
  margin: 8px 0;
  padding-left: 18px;
}
code {
  background: #e2e8f0;
  padding: 0 4px;
  border-radius: 3px;
}
.meta {
  font-size: 12px;
  color: #64748b;
}
</style>