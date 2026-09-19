<template>
  <div class="card-inner">
    <p>当前 useId = <code>{{ id }}</code></p>
    <p class="hint">同样的渲染位置，在服务端 / 客户端会拿到同一个 id；刷新前后也保持稳定</p>
    <label :for="id">内联 label</label>
    <input :id="id" placeholder="绑定到 useId" />
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
const id = useId()
</script>

<style scoped>
.card-inner {
  padding: 8px 0;
}
input {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  margin-left: 8px;
}
.hint {
  font-size: 12px;
  color: #64748b;
}
</style>