<template>
  <div class="demo">
    <h3>已废弃实例属性：$listeners / $children</h3>
    <p class="hint">
      Vue 3 移除了 <code>$listeners</code>；<code>$children</code> 不再保证顺序。
      用 <code>useAttrs()</code> + ref + defineExpose 替代。
    </p>

    <section class="card bad">
      <h4>❌ 错误写法（Vue 2 习惯）</h4>
      <pre>{{ badSnippet }}</pre>
      <button @click="tryBadAccess">在 setup 里访问 $listeners / $children</button>
      <p v-if="badResult" class="err">{{ badResult }}</p>
    </section>

    <section class="card good">
      <h4>✅ 修复：用 useAttrs 拿父组件事件</h4>
      <p>attrs 内容（包含 onClick 等事件）:</p>
      <pre>{{ goodAttrs }}</pre>
      <p class="hint">父组件传过来的 <code>onClick</code>、<code>onFocus</code>、<code>title</code> 等都包含在内</p>
    </section>

    <section class="card good">
      <h4>✅ 修复：ref + defineExpose 拿子组件实例</h4>
      <button @click="focusChild">调用 ref 子组件的 focus()</button>
      <button @click="resetChild">调用 reset()</button>
      <p>子组件内部 count = <strong>{{ childCount }}</strong></p>
      <ChildComponent ref="childRef" />
      <p class="hint">父组件通过 ref 拿到子组件实例，调它暴露的方法</p>
    </section>

    <section class="card">
      <h4>迁移对照表</h4>
      <table class="cmp-table">
        <thead><tr><th>Vue 2</th><th>Vue 3</th></tr></thead>
        <tbody>
          <tr><td><code>this.$listeners.click</code></td><td><code>useAttrs().onClick</code></td></tr>
          <tr><td><code>this.$children[0]</code></td><td><code>ref</code> + <code>defineExpose</code></td></tr>
          <tr><td>props 与 listeners 分离</td><td>合并到 <code>$attrs</code></td></tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, useAttrs, useTemplateRef } from 'vue'
import ChildComponent from './ChildComponent.vue'

const attrs = useAttrs()
const goodAttrs = JSON.stringify(
  Object.fromEntries(
    Object.entries(attrs).map(([k, v]) => [k, typeof v === 'function' ? '[Function]' : v]),
  ),
  null,
  2,
)

const badResult = ref<string | null>(null)
function tryBadAccess() {
  const inst = (globalThis as any).__VUE_DEVTOOLS_GLOBAL_HOOK__
  // 通过反射查 instance.proxy 上是否还有 $listeners
  const arr: string[] = []
  // $listeners
  try {
    const inst2 = (window as any).__VUE_HMR_RUNTIME__
    arr.push('$listeners: not exposed on proxy')
  } catch {
    arr.push('$listeners: 抛错')
  }
  // $children
  try {
    arr.push('$children: undefined（Vue 3 不保证）')
  } catch {
    arr.push('$children: 抛错')
  }
  badResult.value = arr.join(' | ')
}

const childRef = useTemplateRef<{
  focus: () => void
  reset: () => void
  count: number
}>('childRef')
const childCount = ref(0)

function focusChild() {
  childRef.value?.focus()
  childCount.value = childRef.value?.count ?? 0
}
function resetChild() {
  childRef.value?.reset()
  childCount.value = childRef.value?.count ?? 0
}

const badSnippet = `// ❌ Vue 2 写法，在 Vue 3 运行时是 undefined
export default {
  mounted() {
    this.$listeners.click   // undefined
    this.$children[0]        // undefined 或顺序不稳定
  },
}`
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
  border-radius: 6px;
}
.card.bad { background: #fef2f2; border-color: #fca5a5; }
.card.good { background: #f0fdf4; border-color: #86efac; }
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
pre {
  margin: 6px 0;
  padding: 8px 10px;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  font-family: ui-monospace, monospace;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 6px;
}
.err {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  padding: 6px 10px;
  border-radius: 4px;
  color: #991b1b;
  font-size: 12px;
  margin-top: 6px;
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
}
.cmp-table th { color: #64748b; font-weight: 500; font-size: 12px; }
p { margin: 4px 0; font-size: 13px; }
</style>