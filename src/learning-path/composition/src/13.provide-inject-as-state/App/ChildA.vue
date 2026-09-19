<template>
  <div class="ca">
    <div>ChildA: <strong>{{ count }}</strong></div>
    <button @click="count++">ChildA 修改</button>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { CountKey } from './keys'

const count = inject(CountKey)!
</script>

<style scoped>
.ca { margin-top: 8px; padding: 8px; background: #fafafa; border-radius: 4px; border-left: 2px solid #1890ff; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
