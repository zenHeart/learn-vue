<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <table>
      <thead>
        <tr><th>值</th><th>isRef</th><th>isReactive</th><th>isReadonly</th><th>isShallow</th></tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.label">
          <td>{{ row.label }}</td>
          <td>{{ row.isRef }}</td>
          <td>{{ row.isReactive }}</td>
          <td>{{ row.isReadonly }}</td>
          <td>{{ row.isShallow }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, reactive, shallowRef, shallowReactive, readonly, shallowReadonly, isRef, isReactive, isReadonly, isShallow, computed } from 'vue'

const title = ref('isRef / isReactive / isReadonly / isShallow')

function probe(label, value) {
  return {
    label,
    isRef: isRef(value),
    isReactive: isReactive(value),
    isReadonly: isReadonly(value),
    isShallow: isShallow(value)
  }
}

const r = ref(1)
const sr = shallowRef({ a: 1 })
const ra = reactive({ a: 1 })
const sra = shallowReactive({ a: 1 })
const ro = readonly({ a: 1 })
const sro = shallowReadonly({ a: 1 })
const plain = { a: 1 }

const rows = computed(() => [
  probe('ref', r),
  probe('shallowRef', sr),
  probe('reactive', ra),
  probe('shallowReactive', sra),
  probe('readonly', ro),
  probe('shallowReadonly', sro),
  probe('plain object', plain)
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
  font-size: 12px;
}
th {
  background: #e2e8f0;
}
</style>