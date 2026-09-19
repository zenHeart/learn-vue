<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 三种 flush 触发顺序</h4>
      <button @click="bump">count++</button>
      <button @click="bulk">连续 3 次同步 ++</button>
      <pre>{{ logA }}</pre>
      <p class="hint">同步 -> pre -> post；bulk 触发 sync 会跑 3 次，pre/post 各 1 次</p>
    </section>

    <section class="card">
      <h4>② watchPostEffect 读最新 DOM</h4>
      <p>count = {{ count }}</p>
      <div ref="boxEl" class="box">{{ rendered }}</div>
      <button @click="bump">++</button>
      <pre>{{ logB }}</pre>
      <p class="hint">post flush 在 DOM 已渲染后跑；rect 拿到的总是最新尺寸</p>
    </section>

    <section class="card">
      <h4>③ flush: 'sync' 破坏批处理</h4>
      <p>sync 调用次数: <strong>{{ syncCount }}</strong></p>
      <button @click="bulkSync">连续 3 次同步 ++</button>
      <p class="hint">默认 watchEffect 在 pre 只跑 1 次；sync flush 跑 3 次</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, watchPostEffect, watchSyncEffect, useTemplateRef } from 'vue'

const title = ref('watchPostEffect / watchSyncEffect / watchEffect flush 对比')

/* === ① 触发顺序 === */
const count = ref(0)
const logA = ref('')
let idA = 0
watchEffect(() => { logA.value += `${++idA}. [pre]   count=${count.value}\n` })
watchPostEffect(() => { logA.value += `${++idA}. [post]  count=${count.value}\n` })
watchSyncEffect(() => { logA.value += `${++idA}. [sync]  count=${count.value}\n` })

function bump() {
  count.value++
  logA.value += `--- bump end ---\n`
}
function bulk() {
  count.value++
  count.value++
  count.value++
  logA.value += `--- bulk end ---\n`
}

/* === ② DOM 测量 === */
const rendered = ref('')
const boxEl = useTemplateRef<HTMLDivElement>('boxEl')
const logB = ref('')
watchEffect(() => {
  rendered.value = 'box: ' + count.value
})
watchPostEffect(() => {
  if (boxEl.value) {
    const rect = boxEl.value.getBoundingClientRect()
    logB.value = `box width=${rect.width.toFixed(1)} height=${rect.height.toFixed(1)}`
  }
})

/* === ③ sync flush 批处理破坏 === */
const syncCount = ref(0)
watchSyncEffect(() => {
  // 这个 watch 不订阅 count，但 flush:'sync' 让它每次 count 变化时同步跑
  syncCount.value++
})
function bulkSync() {
  syncCount.value = 0
  count.value++
  count.value++
  count.value++
}
</script>

<style scoped>
.demo {
  max-width: 820px;
  margin: 16px auto;
  padding: 16px;
  color: #213547;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.card {
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #1e293b;
}
.hint {
  font-size: 12px;
  color: #64748b;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 6px;
}
pre {
  margin-top: 6px;
  padding: 8px;
  background: #0f172a;
  color: #f8fafc;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  max-height: 220px;
  overflow-y: auto;
}
.box {
  display: inline-block;
  padding: 8px 16px;
  margin: 8px 0;
  background: #ecfeff;
  border: 1px solid #67e8f9;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, monospace;
}
</style>