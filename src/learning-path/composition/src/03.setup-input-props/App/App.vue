<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <Child :user="user" :count="count" />
    <button @click="user.name = 'Vue'">改名</button>
    <button @click="count++">count++</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const title = ref('setup 的第一个参数 props')
const user = ref({ name: 'Hello' })
const count = ref(0)
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 480px;
}
button {
  margin-right: 6px;
  padding: 4px 10px;
}
</style>