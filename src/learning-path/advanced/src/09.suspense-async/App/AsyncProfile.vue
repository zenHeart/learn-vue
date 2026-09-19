<template>
  <div class="ap">
    <h4>用户档案</h4>
    <p>name: <strong>{{ user?.name }}</strong></p>
    <p>role: <strong>{{ user?.role }}</strong></p>
  </div>
</template>

<script setup lang="ts">
interface User {
  name: string
  role: string
}

const fetchUser = (): Promise<User> =>
  new Promise((resolve) => setTimeout(() => resolve({ name: 'alice', role: 'admin' }), 1500))

// async setup 会触发 Suspense 的 pending 状态
const user = await fetchUser()
</script>

<style scoped>
.ap { padding: 12px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
</style>
