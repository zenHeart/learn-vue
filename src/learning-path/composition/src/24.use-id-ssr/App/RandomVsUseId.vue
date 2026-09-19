<template>
  <div class="compare">
    <div class="col">
      <strong>Math.random() 方案（hydration 危险）</strong>
      <label :for="randomId">label</label>
      <input :id="randomId" placeholder="客户端刷新会重新生成" />
      <code>{{ randomId }}</code>
    </div>
    <div class="col">
      <strong>useId() 方案（hydration 安全）</strong>
      <label :for="stableId">label</label>
      <input :id="stableId" placeholder="刷新前后保持一致" />
      <code>{{ stableId }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

// 服务端不会跑 Math.random（或者每次都不一样），客户端 hydration 拿到不同 id → mismatch
const randomId = `r-${Math.random().toString(36).slice(2, 8)}`
const stableId = useId()
</script>

<style scoped>
.compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.col {
  padding: 8px;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
}
input {
  display: block;
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  margin: 4px 0;
}
code {
  font-size: 11px;
  color: #475569;
}
</style>