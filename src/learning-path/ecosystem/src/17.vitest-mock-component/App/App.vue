<script setup>
import { ref } from 'vue'

const logs = ref([])

function log(msg, kind = 'info') {
  logs.value.unshift({ time: new Date().toLocaleTimeString(), msg, kind })
}

function runGlobalStubs() {
  logs.value = []
  log('--- global.stubs 用法 ---')
  log('mount(UserCard, { global: { stubs: { Avatar: true } } })', 'code')
  log('→ Avatar.vue 不渲染真实实现，但 props / attrs 仍透传', 'note')
  log('wrapper.findComponent({ name: "Avatar" }).props("src") === "/a.png"', 'check')
  log('✓ findComponent returns the stubbed instance', 'ok')
}

function runViMock() {
  logs.value = []
  log('--- vi.mock 用法 ---')
  log('vi.mock("./Avatar.vue", () => ({ default: { template: "<img />" } }))', 'code')
  log('→ 完全替换实现，wrapper 树里 Avatar 节点消失', 'note')
  log('wrapper.findComponent(Avatar) === null  // because the real module is replaced', 'check')
  log('✓ used when the real impl is expensive (e.g. canvas, charts)', 'ok')
}

function runShallow() {
  logs.value = []
  log('--- shallow: true ---')
  log('mount(UserCard, { shallow: true })', 'code')
  log('→ 等价于 global.stubs: { 全部子组件: true }', 'note')
  log('所有 findComponent 都返回占位实例', 'check')
  log('✓ 测当前组件 props / emits 时最快', 'ok')
}

function runAll() {
  logs.value = []
  runGlobalStubs()
  log('')
  runViMock()
  log('')
  runShallow()
}
</script>

<template>
  <div class="card">
    <h2>Vitest 三种组件隔离粒度</h2>
    <p class="hint">
      测试 <code>UserCard.vue</code> 时，如何处理它依赖的 <code>Avatar.vue</code>？
      答案不止一个：<code>global.stubs</code>、<code>vi.mock</code>、<code>shallow: true</code>。
    </p>

    <div class="row">
      <button class="primary" @click="runAll">跑三种 mock 的对比</button>
      <button @click="runGlobalStubs">global.stubs</button>
      <button @click="runViMock">vi.mock</button>
      <button @click="runShallow">shallow: true</button>
    </div>

    <div v-if="logs.length" class="console">
      <div v-for="(l, i) in logs" :key="i" :class="['line', l.kind]">
        <span v-if="l.time" class="time">{{ l.time }}</span>
        <span class="msg">{{ l.msg }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { font-family: ui-monospace, monospace; padding: 12px; color: #213547; max-width: 540px; }
.card h2 { font-family: system-ui, sans-serif; margin: 0 0 6px; font-size: 1rem; }
.hint { font-family: system-ui, sans-serif; font-size: 0.78rem; color: #666; margin: 0 0 10px; line-height: 1.5; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.82rem; }
.row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
button { padding: 5px 12px; border-radius: 6px; border: 1px solid #ccc; background: #fff; cursor: pointer; font-size: 0.82rem; font-family: system-ui, sans-serif; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.console { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-size: 0.78rem; line-height: 1.65; max-height: 360px; overflow-y: auto; }
.line { display: flex; gap: 8px; padding: 1px 0; }
.time { color: #888; flex-shrink: 0; }
.msg { flex: 1; white-space: pre-wrap; }
.code { color: #c4b5fd; }
.note { color: #fbbf24; }
.check { color: #93c5fd; }
.ok { color: #6ee7b7; }
</style>
