<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <Child @greet="onGreet">
      <template #default>插槽默认内容</template>
      <template #extra>额外插槽</template>
    </Child>
    <p>收到 greet 事件：<strong>{{ message }}</strong></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const title = ref('setup 的第二个参数 context')
const message = ref('')
function onGreet(payload) {
  message.value = JSON.stringify(payload)
}
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 520px;
}
</style>