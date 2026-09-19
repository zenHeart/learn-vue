<template>
  <section class="boundary">
    <h4>错误边界</h4>
    <p class="hint">子树内任何错误都会冒泡到这里，可选返回 <code>false</code> 阻止进一步传播到 <code>errorHandler</code>。</p>
    <div v-if="!crashed">
      <slot />
    </div>
    <div v-else class="fallback">⚠️ 子树出错，已降级</div>
    <pre>{{ log.join('\n') }}</pre>
    <button @click="reset">reset</button>
  </section>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, onMounted } from 'vue'

const log = ref<string[]>([])
const crashed = ref(false)

onMounted(() => {
  log.value.push('[boundary] mounted')
})

onErrorCaptured((err: Error, instance, info) => {
  log.value.push(`[boundary] captured: ${err.message} (info=${info})`)
  crashed.value = true
  // 返回 false 阻止继续向上冒泡到 app.config.errorHandler
  return false
})

function reset() {
  crashed.value = false
  log.value = []
}
</script>

<style scoped>
.boundary {
  padding: 12px;
  background: #e0e7ff;
  border-radius: 6px;
}
.boundary h4 { margin: 0 0 8px; font-size: 14px; }
.hint { font-size: 12px; color: #475569; margin: 0 0 8px; }
.fallback {
  padding: 10px;
  background: #fef3c7;
  border-radius: 6px;
  font-size: 13px;
  color: #92400e;
}
pre {
  margin: 8px 0;
  padding: 8px;
  background: #1e293b;
  color: #f1f5f9;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.55;
  max-height: 140px;
  overflow: auto;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
code { background: #f1f5f9; padding: 1px 5px; border-radius: 3px; font-size: 12px; }
</style>