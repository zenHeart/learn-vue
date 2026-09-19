<template>
  <div class="form">
    <label>
      名称: <input v-model="name" />
    </label>
    <p>当前输入: <code>{{ name }}</code></p>
    <p class="hint">外部 :key 改变时，本组件会重新挂载 —— state 重置</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const name = ref('init-name')

onMounted(() => {
  console.log('[FormPanel] mounted')
})
</script>

<style scoped>
.form {
  padding: 12px;
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  border-radius: 6px;
}
input {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  margin-left: 6px;
}
code {
  font-family: 'SFMono-Regular', Consolas, monospace;
}
.hint {
  font-size: 12px;
  color: #047857;
  margin-top: 4px;
}
</style>
