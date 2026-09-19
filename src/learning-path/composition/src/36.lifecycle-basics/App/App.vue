<template>
  <div class="demo">
    <h2>生命周期完整时序</h2>
    <p class="hint">点击「父 count++」观察 beforeUpdate / updated 父子顺序；点击「卸载子」观察 beforeUnmount / unmounted 顺序。</p>
    <Parent />
  </div>
</template>

<script setup lang="ts">
import Parent from './Parent.vue'
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
h2 { margin-top: 0; }
.hint { font-size: 12px; color: #64748b; margin: 0 0 14px; }
</style>