<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <p>rawProxy === raw ? <strong>{{ same }}</strong></p>
    <p>proxy.count = {{ proxy.count }}</p>
    <p>raw.count = {{ rawCount }}</p>
    <button @click="proxy.count++">通过 proxy 修改</button>
    <button @click="raw.count++">通过 raw 修改（不会触发响应）</button>
    <p class="meta">
      toRaw 返回 reactive 对象对应的原始对象，绕过 Proxy；markRaw 可以标记一个对象永远不被转为响应式。
    </p>
  </div>
</template>

<script setup>
import { reactive, toRaw, markRaw, ref } from 'vue'

const title = ref('toRaw 与 markRaw')
const proxy = reactive({ count: 0 })
const raw = toRaw(proxy)
const same = raw === proxy.__v_raw

const rawCount = ref(raw.count)

// 标记一个不会被代理的对象
const frozen = markRaw(Object.freeze({ name: 'frozen' }))
const tries = ref([])
function touchFrozen() {
  // frozen 永远不会被代理，但 isProxy 仍然会返回 false
  tries.value.push(frozen.name)
}

defineExpose({ touchFrozen })
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