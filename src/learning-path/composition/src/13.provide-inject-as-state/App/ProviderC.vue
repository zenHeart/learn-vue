<template>
  <div class="pc">
    <div>store count: <strong>{{ count }}</strong></div>
    <div class="row">
      <button @click="actions.inc()">inc</button>
      <button @click="actions.dec()">dec</button>
      <button @click="actions.reset(100)">reset</button>
    </div>
    <ChildC />
  </div>
</template>

<script setup lang="ts">
import { provide, ref, readonly } from 'vue'
import { CountKey, ActionsKey } from './keys'
import ChildC from './ChildC.vue'

const count = ref(0)
provide(CountKey, count)

// 暴露动作而非状态，避免后代组件误改 ref 引用
provide(ActionsKey, {
  inc: () => count.value++,
  dec: () => count.value--,
  reset: (v = 0) => (count.value = v),
})

// readonly 包装可防止外部 mutation
provide('readonly-count', readonly(count))
</script>

<style scoped>
.pc { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
.row { display: flex; gap: 6px; margin: 6px 0; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
