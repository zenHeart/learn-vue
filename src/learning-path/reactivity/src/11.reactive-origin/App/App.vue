<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <p>state.count = {{ state.count }}</p>
    <p>state.nested.value = {{ state.nested.value }}</p>
    <button @click="state.count++">count++</button>
    <button @click="state.nested.value++">nested.value++</button>
    <p class="meta">
      Vue 3 的响应式基于 ES2015 Proxy：get 收集依赖（track），set 派发更新（trigger）。深层对象会被递归包装成 Proxy。
    </p>
    <pre>{{ json }}</pre>
  </div>
</template>

<script setup>
import { reactive, ref, toRaw } from 'vue'

const title = ref('reactive 的 Proxy 来源')

const state = reactive({
  count: 0,
  nested: { value: 0, deeper: { flag: true } }
})

const json = ref(JSON.stringify({
  isProxy: typeof state === 'object',
  keys: Object.keys(state),
  rawKeys: Object.keys(toRaw(state))
}, null, 2))
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 520px;
}
button {
  margin-right: 6px;
  padding: 4px 10px;
}
pre {
  background: #0f172a;
  color: #e2e8f0;
  padding: 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 8px;
}
.meta {
  font-size: 12px;
  color: #64748b;
}
</style>