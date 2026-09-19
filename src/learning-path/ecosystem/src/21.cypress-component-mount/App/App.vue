<script setup>
import { ref } from 'vue'

const logs = ref([])

function log(msg, kind = 'info') {
  logs.value.unshift({ time: new Date().toLocaleTimeString(), msg, kind })
}

function simulateMount() {
  logs.value = []
  log('cy.mount(Counter, { props: { initial: 3 } })', 'code')
  log('→ 浏览器创建容器 → Vue app.mount(容器)', 'note')
  log('[data-test=count] 实际文本: "Count: 3"', 'check')
  log('✓ renders initial value', 'ok')
  log('cy.get("button").click()', 'code')
  log('→ Cypress auto-waits → 派发真实点击 → 触发 @click', 'note')
  log('[data-test=count] 现在文本: "Count: 4"', 'check')
  log('✓ increments on click', 'ok')
}

function simulateSlots() {
  logs.value = []
  log('cy.mount(Modal, { slots: { default: "<p>Hi</p>" } })', 'code')
  log('→ default 插槽被注入到 <slot /> 位置', 'note')
  log('cy.contains("Hi").should("exist")', 'check')
  log('✓ renders default slot', 'ok')
}

function simulateGlobal() {
  logs.value = []
  log('cy.mount(Counter, { global: { plugins: [i18n] } })', 'code')
  log('→ app.use(i18n)，组件内 useI18n() 可拿到 t()', 'note')
  log('cy.contains("计数")  // i18n 切换到 zh-CN 后的产物', 'check')
  log('✓ injects global plugin', 'ok')

  log('cy.mount(App, { global: { provide: { theme: "dark" } } })', 'code')
  log('→ inject("theme") 在组件树里返回 "dark"', 'note')
  log('✓ injects provide value', 'ok')
}

function simulateStubs() {
  logs.value = []
  log('cy.mount(UserCard, { global: { stubs: ["Avatar"] } })', 'code')
  log('→ Avatar 组件被 Cypress 替换为占位 <AvatarStub>', 'note')
  log('cy.get("[data-cy=avatar]").should("not.exist")', 'check')
  log('✓ stubbed component does not render real impl', 'ok')
}
</script>

<template>
  <div class="card">
    <h2>Cypress cy.mount 实战</h2>
    <p class="hint">
      <code>cy.mount(Comp, opts)</code> 在真浏览器里跑组件测试。
      比 <code>mount()</code>（jsdom）慢，但焦点、<code>ResizeObserver</code>、<code>getBoundingClientRect</code> 都是真实的。
    </p>

    <div class="row">
      <button class="primary" @click="simulateMount">mount + 交互</button>
      <button @click="simulateSlots">slots</button>
      <button @click="simulateGlobal">global.plugins/provide</button>
      <button @click="simulateStubs">stubs</button>
    </div>

    <div v-if="logs.length" class="console">
      <div v-for="(l, i) in logs" :key="i" :class="['line', l.kind]">
        <span v-if="l.time" class="time">{{ l.time }}</span>
        <span class="msg">{{ l.msg }}</span>
      </div>
    </div>

    <h3>mount 选项速查</h3>
    <table class="table">
      <thead><tr><th>选项</th><th>作用</th></tr></thead>
      <tbody>
        <tr><td><code>props</code></td><td>组件 props</td></tr>
        <tr><td><code>slots</code></td><td>命名插槽</td></tr>
        <tr><td><code>attrs</code></td><td>根元素 attribute 透传</td></tr>
        <tr><td><code>global.plugins</code></td><td>app.use(plugin)</td></tr>
        <tr><td><code>global.provide</code></td><td>app.provide(key, val)</td></tr>
        <tr><td><code>global.stubs</code></td><td>stub 子组件</td></tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.card { font-family: ui-monospace, monospace; padding: 12px; color: #213547; max-width: 540px; }
.card h2 { font-family: system-ui, sans-serif; margin: 0 0 6px; font-size: 1rem; }
.card h3 { font-family: system-ui, sans-serif; margin: 12px 0 6px; font-size: 0.9rem; color: #35495e; }
.hint { font-family: system-ui, sans-serif; font-size: 0.78rem; color: #666; margin: 0 0 10px; line-height: 1.5; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.78rem; }
.row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
button { padding: 5px 10px; border-radius: 6px; border: 1px solid #ccc; background: #fff; cursor: pointer; font-size: 0.78rem; font-family: system-ui, sans-serif; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.console { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-size: 0.78rem; line-height: 1.6; max-height: 320px; overflow-y: auto; }
.line { display: flex; gap: 8px; }
.time { color: #888; flex-shrink: 0; }
.msg { flex: 1; white-space: pre-wrap; }
.code { color: #c4b5fd; }
.note { color: #fbbf24; }
.check { color: #93c5fd; }
.ok { color: #6ee7b7; }
.table { width: 100%; border-collapse: collapse; font-size: 0.78rem; font-family: system-ui, sans-serif; }
.table th, .table td { padding: 4px 6px; border-bottom: 1px solid #eee; text-align: left; }
.table th { color: #888; font-weight: 500; }
</style>
