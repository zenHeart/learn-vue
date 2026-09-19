<template>
  <div class="cc">
    <p>子组件读到的 count: <strong>{{ countRef.value }}</strong></p>
    <button @click="countRef.value++">从子组件改</button>
    <p class="hint">修改后父组件 count 也会同步刷新</p>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { CountKey } from './keys'

const countRef = inject(CountKey)
</script>

<style scoped>
.cc { margin-top: 8px; padding: 10px; background: #fafafa; border-radius: 4px; }
.hint { font-size: 12px; color: #888; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
