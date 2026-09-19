<template>
  <div class="user-list">
    <table>
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="{ width: col.width ? `${col.width}px` : undefined }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
// PropType<User[]> 让模板里 user.name 自动推断
const props = defineProps({
  users: {
    type: Array as () => User[],
    required: true,
  },
  columns: {
    type: Array as () => Column[],
    default: () => [],
  },
})

interface User {
  id: number
  name: string
  email: string
}
interface Column {
  key: string
  label: string
  width?: number
}
</script>

<style scoped>
.user-list { font-family: system-ui, sans-serif; font-size: 13px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 4px 8px; border-bottom: 1px solid #e2e8f0; text-align: left; }
th { background: #f8fafc; font-weight: 600; color: #475569; }
</style>