<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <table>
      <thead>
        <tr><th>值</th><th>isRef</th><th>isReactive</th><th>类型</th></tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.label">
          <td>{{ row.label }}</td>
          <td>{{ row.isRef }}</td>
          <td>{{ row.isReactive }}</td>
          <td>{{ row.kind }}</td>
        </tr>
      </tbody>
    </table>
    <p class="meta">
      isRef 仅对 ref/shallowRef 命中；isReactive 对 reactive 命中；普通对象两个都返回 false。
    </p>
  </div>
</template>

<script setup>
import { ref, reactive, shallowRef, isRef, isReactive } from 'vue'

const title = ref('isRef 与 isReactive')

const r = ref(1)
const sr = shallowRef({ a: 1 })
const ra = reactive({ a: 1 })
const plain = { a: 1 }

const rows = ref([
  { label: 'ref(1)', isRef: isRef(r), isReactive: isReactive(r), kind: 'RefImpl' },
  { label: 'shallowRef', isRef: isRef(sr), isReactive: isReactive(sr), kind: 'ShallowRefImpl' },
  { label: 'reactive(obj)', isRef: isRef(ra), isReactive: isReactive(ra), kind: 'Proxy' },
  { label: 'plain object', isRef: isRef(plain), isReactive: isReactive(plain), kind: 'Object' }
])
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
}
table {
  border-collapse: collapse;
  margin-top: 8px;
}
th, td {
  padding: 4px 10px;
  border: 1px solid #cbd5e1;
  font-size: 13px;
}
th {
  background: #e2e8f0;
}
.meta {
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
}
</style>