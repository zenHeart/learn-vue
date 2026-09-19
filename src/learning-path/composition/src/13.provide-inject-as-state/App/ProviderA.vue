<template>
  <div class="pa">
    <div class="row">A 组件读到的 count: <strong>{{ count }}</strong></div>
    <button @click="count++">A 修改 +1</button>
    <ChildA />
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import { CountKey } from './keys'
import ChildA from './ChildA.vue'

const count = ref(0)
provide(CountKey, count)
</script>

<style scoped>
.pa { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
.row { padding: 2px 0; }
button { margin-top: 4px; padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
