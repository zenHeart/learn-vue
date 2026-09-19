<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <p>count = {{ state.count }}</p>
    <p>double = {{ state.double }}</p>
    <button @click="state.count++">count++</button>
    <p class="meta">
      当 computed 直接挂在 reactive 对象上时，模板里直接访问 <code>state.double</code> 即可，无需 <code>.value</code>。
    </p>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watchEffect } from 'vue'

const title = ref('computed 作为 reactive state 的字段')

const state = reactive({
  count: 0,
  double: computed(() => state.count * 2)
})

watchEffect(() => {
  console.log('[computed-state] double =', state.double)
})
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 480px;
}
button {
  padding: 4px 12px;
  margin-top: 6px;
}
code {
  background: #e2e8f0;
  padding: 0 4px;
  border-radius: 3px;
}
.meta {
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
}
</style>