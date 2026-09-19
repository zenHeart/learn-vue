<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <table>
      <thead>
        <tr><th>对象</th><th>isProxy</th><th>isReactive</th><th>isReadonly</th></tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.name">
          <td>{{ row.name }}</td>
          <td>{{ row.isProxy }}</td>
          <td>{{ row.isReactive }}</td>
          <td>{{ row.isReadonly }}</td>
        </tr>
      </tbody>
    </table>
    <p class="meta">isProxy 同时覆盖 reactive、shallowReactive、readonly、shallowReadonly；isReactive 只对 reactive / shallowReactive 命中。</p>
  </div>
</template>

<script setup>
import { ref, reactive, readonly, shallowReactive, computed, isProxy, isReactive, isReadonly } from 'vue'

const title = ref('isProxy / isReactive / isReadonly')

function probe(name, value) {
  return {
    name,
    isProxy: isProxy(value),
    isReactive: isReactive(value),
    isReadonly: isReadonly(value)
  }
}

const plain = { a: 1 }
const r = reactive({ a: 1 })
const ro = readonly({ a: 1 })
const sh = shallowReactive({ a: 1 })

const rows = computed(() => [
  probe('plain object', plain),
  probe('reactive(obj)', r),
  probe('readonly(obj)', ro),
  probe('shallowReactive', sh)
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