<template>
  <div class="cc">
    <div>ChildC 通过 Actions 写：</div>
    <div class="row">
      <button @click="actions.inc()">+</button>
      <button @click="actions.dec()">-</button>
    </div>
    <div>读到的 count: <strong>{{ count }}</strong></div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { CountKey, ActionsKey } from './keys'

const count = inject(CountKey)!
const actions = inject(ActionsKey)!
</script>

<style scoped>
.cc { margin-top: 8px; padding: 8px; background: #fafafa; border-radius: 4px; border-left: 2px solid #fa8c16; }
.row { display: flex; gap: 6px; margin: 4px 0; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
