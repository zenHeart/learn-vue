<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <p>scope 内 count = {{ state.count }}</p>
    <button @click="state.count++">在当前 scope 内 ++</button>
    <button @click="detach()">停止 effect</button>
    <p>effect 触发次数：{{ triggerCount }}</p>
    <p class="meta">
      <code>effect(fn, { scope })</code> 把 effect 显式绑定到一个 effectScope；<code>scope.stop()</code> 会一次性停止其中所有 effect。
    </p>
  </div>
</template>

<script setup>
import { ref, watchEffect, effectScope, getCurrentScope } from 'vue'

const title = ref('watchEffect 显式 scope 绑定')
const state = ref({ count: 0 })
const triggerCount = ref(0)
let stopFn = null

const scope = effectScope()
scope.run(() => {
  const stop = watchEffect(() => {
    if (state.value.count === undefined) return
    triggerCount.value++
  })
  stopFn = stop
})

function detach() {
  if (stopFn) stopFn()
  scope.stop()
}

const currentScope = getCurrentScope()
console.log('[watch-effect-bind] currentScope =', currentScope)
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