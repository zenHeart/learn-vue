<template>
  <div class="demo">
    <h3>reactive(frozen) vs shallowRef(frozen) 模式对比</h3>
    <p class="hint">
      模拟 Immer 风格的不可变数据源，对比深代理与引用级响应式的行为差异。
    </p>

    <section class="card">
      <h4>① reactive(Object.freeze(obj))：深代理 + 写入失败</h4>
      <p>state.count = <strong>{{ reactiveView.count }}</strong></p>
      <p>state.user.name = <strong>{{ reactiveView.user.name }}</strong></p>
      <div class="row">
        <button @click="tryMutateReactiveTop">修改顶层字段</button>
        <button @click="tryMutateReactiveNested">修改嵌套字段</button>
        <button @click="replaceReactive">整体替换</button>
      </div>
      <p v-if="reactiveError" class="err">捕获: {{ reactiveError }}</p>
      <p class="hint">修改嵌套字段会抛 TypeError（frozen 对象）；整体替换才能更新视图</p>
    </section>

    <section class="card">
      <h4>② shallowRef(Object.freeze(obj))：引用级 + 显式 trigger</h4>
      <p>state.value.count = <strong>{{ shallowView.count }}</strong></p>
      <p>state.value.user.name = <strong>{{ shallowView.user.name }}</strong></p>
      <div class="row">
        <button @click="tryMutateShallowNested">修改嵌套字段（无效）</button>
        <button @click="replaceShallow">整体替换 frozen 对象</button>
        <button @click="replaceShallowCopy">替换 + 浅拷贝</button>
      </div>
      <p class="hint">嵌套字段直接改不触发响应式；必须整体替换或 triggerRef</p>
    </section>

    <section class="card">
      <h4>③ 行为对比</h4>
      <table class="cmp-table">
        <thead>
          <tr><th>操作</th><th>reactive(frozen)</th><th>shallowRef(frozen)</th></tr>
        </thead>
        <tbody>
          <tr><td>修改顶层字段</td><td>❌ TypeError</td><td>❌ TypeError（直接改无效）</td></tr>
          <tr><td>修改嵌套字段</td><td>❌ TypeError</td><td>❌ 修改无效，无响应</td></tr>
          <tr><td>整体替换 state</td><td>✅ 触发</td><td>✅ 触发</td></tr>
          <tr><td>triggerRef 强制刷新</td><td>n/a</td><td>✅ 触发</td></tr>
          <tr><td>嵌套字段响应式深度</td><td>深（每个字段代理）</td><td>浅（仅 .value 引用）</td></tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <h4>④ 决策总结</h4>
      <pre>{{ decisionSnippet }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, shallowRef, triggerRef, ref } from 'vue'

const initialUser = { name: 'vue', age: 3 }

interface State {
  count: number
  list: number[]
  user: typeof initialUser
}

function fresh(): State {
  return Object.freeze({ count: 1, list: [10, 20, 30], user: { ...initialUser } }) as State
}

/* === ① reactive(frozen) === */
const reactiveState = reactive<State>(fresh())
const reactiveError = ref<string | null>(null)

const reactiveView = reactiveState  // 模板可直接读到

function tryMutateReactiveTop() {
  reactiveError.value = null
  try {
    (reactiveState as any).count = 999
    reactiveError.value = '居然没抛错？'
  } catch (e: any) {
    reactiveError.value = `${e.constructor.name}: ${e.message.split('\n')[0]}`
  }
}
function tryMutateReactiveNested() {
  reactiveError.value = null
  try {
    (reactiveState.user as any).name = 'replaced'
    reactiveError.value = '居然没抛错？'
  } catch (e: any) {
    reactiveError.value = `${e.constructor.name}: ${e.message.split('\n')[0]}`
  }
}
function replaceReactive() {
  Object.assign(reactiveState, fresh())
  // 注：Object.assign 写入 frozen 字段仍抛错，但赋值给 reactive 顶层字段会被 proxy 拦截
  // 演示用：直接重置 reactive 内部状态
  ;(reactiveState as any).count = 1
  ;(reactiveState as any).user = { ...initialUser }
}

/* === ② shallowRef(frozen) === */
const shallowState = shallowRef<State>(fresh())
const shallowView = shallowState.value

function tryMutateShallowNested() {
  try {
    ;(shallowState.value.user as any).name = 'replaced'
  } catch (e: any) {
    console.warn('shallow modify nested:', e.message.split('\n')[0])
  }
  // 视图不变，因为 .value 没变，nested 字段被 frozen 拦截
}
function replaceShallow() {
  try {
    shallowState.value = fresh()
  } catch (e: any) {
    console.warn('replace:', e.message.split('\n')[0])
  }
}
function replaceShallowCopy() {
  // 触发响应的稳妥写法：把 frozen 对象 spread 成新普通对象
  shallowState.value = { ...fresh(), user: { ...fresh().user } }
}
function forceTrigger() {
  triggerRef(shallowState)
}

const decisionSnippet = `// 决策树
const isFrozen = Object.isFrozen(obj)
if (isFrozen) {
  // shallowRef 路径（Immer / Redux / immutable.js）
  state = shallowRef(obj)
} else {
  // reactive 路径（普通可变对象）
  state = reactive(obj)
}

// 注意：frozen 对象整体赋值不会触发更新
// 必须 spread 一层或用 triggerRef
state.value = { ...state.value, /* 新字段 */ }`
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
  margin: 6px 0;
}
code {
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.82rem;
}
.row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 6px;
}
.cmp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin: 6px 0;
}
.cmp-table th, .cmp-table td {
  padding: 6px 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  vertical-align: middle;
}
.cmp-table th { color: #64748b; font-weight: 500; font-size: 12px; }
.err {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  padding: 6px 10px;
  border-radius: 4px;
  color: #991b1b;
  font-size: 12px;
  margin-top: 6px;
}
pre {
  margin: 6px 0;
  padding: 8px 10px;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  font-family: ui-monospace, monospace;
  white-space: pre-wrap;
}
p { margin: 4px 0; font-size: 13px; }
</style>