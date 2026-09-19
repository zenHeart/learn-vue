<template>
  <div class="probe">
    <button @click="runAsync">跨 await 探针</button>
    <p class="meta">同步：{{ syncResult }}</p>
    <p class="meta">await 后：{{ asyncResult }}</p>
    <p class="meta">runWithContext 后：{{ ctxResult }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'

const syncResult = ref('')
const asyncResult = ref('')
const ctxResult = ref('')

const runAsync = () => {
  // 同步：能拿到
  const inst1 = getCurrentInstance()
  syncResult.value = inst1 ? `uid=${inst1.uid}` : 'null'

  // 微任务：拿不到了
  Promise.resolve().then(() => {
    const inst2 = getCurrentInstance()
    asyncResult.value = inst2 ? `uid=${inst2.uid}` : 'null（已失效）'
  })

  // 用 runWithContext 恢复
  if (inst1?.appContext.app) {
    inst1.appContext.app.runWithContext(() => {
      const inst3 = getCurrentInstance()
      ctxResult.value = inst3 ? `uid=${inst3.uid}` : 'null'
    })
  }
}
</script>

<style scoped>
.probe button { padding: 5px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
.meta { font-size: 12px; color: #555; margin: 6px 0; font-family: ui-monospace, monospace; }
</style>