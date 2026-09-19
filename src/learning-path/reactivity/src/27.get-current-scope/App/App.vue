<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① composable 中 getCurrentScope()</h4>
      <p>调用 useTick 时所在 scope = <code>{{ tickScopeLabel }}</code></p>
      <p>composable 内部新建的 detached scope = <code>{{ scopeLabel }}</code></p>
      <p>计数: <strong>{{ tick }}</strong></p>
      <button @click="bumpTick">手动 ++</button>
      <button @click="stopComposable">stop composable scope</button>
      <p class="hint">stop 之后 watch 不再响应；bumpTick 按钮的修改也走不进 watcher</p>
    </section>

    <section class="card">
      <h4>② 嵌套 scope：父子 scope 的链式记录</h4>
      <p>当前 activeEffectScope = <code>{{ activeLabel }}</code></p>
      <button @click="buildNested">建一个嵌套 scope + 内层 watch</button>
      <pre>{{ nestedLog }}</pre>
      <p class="hint">外层 scope.stop() 会级联释放所有子 scope 与 watch</p>
    </section>

    <section class="card">
      <h4>③ 测试隔离：临时 scope 用完即抛</h4>
      <button @click="runIsolated">开一个临时 scope 跑 3 次计数</button>
      <pre>{{ isolatedLog }}</pre>
      <p class="hint">scope.stop() 后再 ++，原 watch 不再触发</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, effectScope, getCurrentScope, watch, onUnmounted } from 'vue'

const title = ref('getCurrentScope / effectScope：副作用容器与作用域查询')

/* === ① composable 演示 === */
function useTick() {
  // detached scope：调用方 stop() 决定生命周期
  const scope = effectScope(true)
  const tick = ref(0)
  scope.run(() => {
    watch(tick, (v) => console.log('[composable watcher]', v))
  })
  onUnmounted(() => scope.stop())
  return { tick, scope, isInScope: getCurrentScope() === scope }
}

const tickScopeLabel = ref(getCurrentScope() ? 'component scope' : 'undefined')
const { tick, scope, isInScope } = useTick()
const scopeLabel = ref(isInScope ? 'component scope' : 'detached scope')
const bumpTick = () => tick.value++
const stopComposable = () => scope.stop()

/* === ② 嵌套 scope === */
const activeLabel = ref('—')
const nestedLog = ref('')
function buildNested() {
  const outer = effectScope()
  let id = 0
  outer.run(() => {
    activeLabel.value = 'outer'
    console.log('[outer]', getCurrentScope() === outer)
    const inner = effectScope()
    inner.run(() => {
      activeLabel.value = 'inner'
      console.log('[inner]', getCurrentScope() === inner)
      watch(
        () => ++id,
        (v) => {
          nestedLog.value += `watcher fires: id=${v}\n`
        },
      )
    })
    // 离开 inner.run，但仍在 outer 内
    activeLabel.value = 'back to outer'
  })
  activeLabel.value = 'after run()'
  // 一次性停掉整个 scope 树：watch 不会再触发
  outer.stop()
  nestedLog.value += 'outer.stop() called → watcher 已停\n'
}

/* === ③ 测试隔离 === */
const isolatedLog = ref('')
function runIsolated() {
  const scope = effectScope()
  const r = ref(0)
  scope.run(() => {
    watch(r, (v) => {
      isolatedLog.value += `isolated watcher fires: ${v}\n`
    })
  })
  r.value++
  r.value++
  r.value++
  // 用完即抛
  scope.stop()
  isolatedLog.value += 'scope.stop() called\n'
  // 这次 ++ 不再触发
  r.value++
  isolatedLog.value += 'stop 后再 ++，无新增日志\n'
}
</script>

<style scoped>
.demo {
  max-width: 780px;
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
  margin: 6px 0 0;
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
}
</style>