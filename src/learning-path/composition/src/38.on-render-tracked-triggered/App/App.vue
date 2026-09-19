<template>
  <div class="demo">
    <h2>onRenderTracked / onRenderTriggered 调试追踪</h2>
    <p class="hint">dev 模式才会触发钩子；改 count 或 toggle 触发重新渲染，观察下方日志。</p>

    <section class="card">
      <h4>{{ count }} · mounted?{{ mounted }}</h4>
      <button @click="count++">count++</button>
      <button @click="toggle">toggle</button>
    </section>

    <section class="card">
      <h4>收集阶段日志（onRenderTracked）</h4>
      <pre>{{ trackedLog.slice(-8).join('\n') }}</pre>
    </section>

    <section class="card">
      <h4>触发阶段日志（onRenderTriggered）</h4>
      <pre>{{ triggeredLog.slice(-8).join('\n') }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onRenderTracked, onRenderTriggered, onMounted } from 'vue'

const count = ref(0)
const mounted = ref(false)
const trackedLog = ref<string[]>([])
const triggeredLog = ref<string[]>([])

onMounted(() => { mounted.value = true })

function toggle() {
  count.value = Math.random() > 0.5 ? 0 : 1
}

onRenderTracked((event) => {
  trackedLog.value.push(
    `track.${event.type} ${describeTarget(event.target)}.${String(event.key)}`
  )
})

onRenderTriggered((event) => {
  triggeredLog.value.push(
    `trigger.${event.type} ${describeTarget(event.target)}.${String(event.key)} ${event.oldValue}->${event.newValue}`
  )
})

function describeTarget(t: any) {
  return t && t.constructor ? t.constructor.name : 'unknown'
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 12px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h4 { margin: 0 0 8px; font-size: 14px; }
button { padding: 4px 12px; border: 1px solid #cbd5e1; background: #fff; border-radius: 4px; cursor: pointer; margin-right: 6px; }
pre {
  margin: 6px 0 0;
  padding: 8px;
  background: #1e293b;
  color: #f1f5f9;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.55;
  max-height: 160px;
  overflow: auto;
}
</style>