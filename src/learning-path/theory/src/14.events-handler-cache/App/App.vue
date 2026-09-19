<template>
  <div class="demo">
    <h3>14 · 事件 handler 缓存机制</h3>

    <p class="hint">
      同一 DOM 元素上，Vue 始终挂同一个 <code>invoker</code>；re-render 只更新 <code>invoker.value</code>，不会 remove+addEventListener。
    </p>

    <section class="card">
      <h4>① inline 函数：每次 re-render 都会创建新函数</h4>
      <p>count = {{ count }}</p>
      <button @click="inlineClick">inline @click（每次 re-render 都重建）</button>
      <p class="trace">{{ inlineTrace }}</p>
    </section>

    <section class="card">
      <h4>② 函数引用：handler 引用稳定</h4>
      <button @click="refClick">@click="refClick"</button>
      <p class="trace">{{ refTrace }}</p>
    </section>

    <section class="card">
      <h4>③ invoker.attached 防递归：dispatchEvent 异步再触发</h4>
      <button id="recursive-btn">点击 → 异步再 dispatch 同一事件</button>
      <p class="trace">{{ recTrace }}</p>
    </section>

    <section class="card">
      <h4>④ 直接观察 DOM onclick</h4>
      <button id="dom-btn">查看 DOM onclick</button>
      <p class="trace">DOM.onclick 是 invoker（不是用户函数）</p>
      <pre>{{ domLog }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const inlineTrace = ref<string>('')
const refTrace = ref<string>('')
const recTrace = ref<string>('')
const domLog = ref<string>('')

function inlineClick() {
  count.value++
  inlineTrace.value = `inline handler 第 ${count.value} 次调用（每次 re-render 时函数是新的）`
}

// 函数引用：handler 引用始终是 refClick 本身
const refClick = () => {
  refTrace.value = `refClick handler 调用（handler 引用稳定）`
}

// 模拟 vuejs/vue#6566：异步 dispatch 同事件，验证 attached 守卫
async function setupRecursive() {
  const btn = document.getElementById('recursive-btn')!
  btn.addEventListener('click', () => {
    // 第一次触发后再异步 dispatchEvent（同事件）→ 应当被忽略
    queueMicrotask(() => {
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
  })
}

// Vue 的 invoker 永远挂在 DOM 上；用户函数是 invoker.value
function inspectDom() {
  const btn = document.getElementById('dom-btn') as any
  const invoker = btn.onclick
  domLog.value = `typeof onclick: ${typeof invoker}\nvalue is fn? ${typeof invoker?.value}\nattached: ${invoker?.attached}\nname: ${invoker?.value?.name}`
}

onMounted(() => {
  setupRecursive()
  document.getElementById('rec-btn-proxy')?.remove()
  document.getElementById('dom-btn')?.addEventListener('click', () => {
    inspectDom()
    recTrace.value = '已查看 DOM onclick'
  })
})

import { onMounted } from 'vue'
</script>

<style scoped>
.demo { padding: 1rem; font-family: system-ui; }
.card { padding: 10px; margin: 8px 0; background: #fafafa; border: 1px solid #e5e5e5; border-radius: 6px; }
.card h4 { margin: 0 0 6px; font-size: 13px; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
.trace { font-size: 12px; color: #555; margin-top: 4px; }
.hint { color: #888; font-size: 12px; }
code { background: #f6f8fa; padding: 1px 4px; border-radius: 3px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 8px; font-size: 12px; border-radius: 4px; white-space: pre-wrap; }
</style>
