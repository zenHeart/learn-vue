<template>
  <section class="card">
    <h3>报表</h3>
    <table>
      <thead><tr><th>月份</th><th>PV</th><th>UV</th></tr></thead>
      <tbody>
        <tr v-for="row in data" :key="row.month">
          <td>{{ row.month }}</td><td>{{ row.pv }}</td><td>{{ row.uv }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
const data = [
  { month: '1 月', pv: 12345, uv: 4321 },
  { month: '2 月', pv: 13987, uv: 4523 },
  { month: '3 月', pv: 15601, uv: 4988 },
]
</script>

<style scoped>
table { border-collapse: collapse; }
th, td { padding: .25rem .75rem; border-bottom: 1px solid #eaecef; text-align: left; }
</style>