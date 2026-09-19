<template>
  <div class="demo">
    <h3>toRef 两种签名 + toValue 与 unref</h3>
    <p class="hint">
      <code>toRef(obj, key)</code> 桥接字段；<code>toRef(getter)</code> 只读包装。
      <code>toValue</code> 比 <code>unref</code> 多接受 getter 入参。
    </p>

    <section class="card">
      <h4>① toRef(state, 'count')：双向桥</h4>
      <p>state.count = <strong>{{ state.count }}</strong>，countRef.value = <strong>{{ countRef.value }}</strong></p>
      <button @click="state.count++">state.count++</button>
      <button @click="countRef.value++">countRef.value++</button>
      <p class="hint">两个写法同步更新；内部走 ObjectRefImpl 共享引用</p>
    </section>

    <section class="card">
      <h4>② toRef(getter)：只读包装</h4>
      <p>state.name = <code>"{{ state.name }}"</code></p>
      <p>nameLength.value = <strong>{{ nameLength.value }}</strong></p>
      <button @click="state.name += '!'">name 加感叹号</button>
      <p class="hint">getter 形式的 ref 只读；尝试写值会被 Vue 警告</p>
    </section>

    <section class="card">
      <h4>③ watch + toRef：精确监听嵌套字段</h4>
      <p>profile.score 历史: <code>{{ scoreLog }}</code></p>
      <button @click="state.profile.score++">score++</button>
      <p class="hint">toRef(getter) 让 watch 显式订阅 score 这一个依赖</p>
    </section>

    <section class="card">
      <h4>④ toValue vs unref：MaybeRefOrGetter 解包</h4>
      <table class="cmp-table">
        <thead>
          <tr><th>输入</th><th>unref</th><th>toValue</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in cmpRows" :key="row.label">
            <td><code>{{ row.label }}</code></td>
            <td><code>{{ row.unref }}</code></td>
            <td><code>{{ row.toValue }}</code></td>
          </tr>
        </tbody>
      </table>
      <p class="hint">unref 不解包 getter；toValue 完整覆盖三种入参</p>
    </section>

    <section class="card">
      <h4>⑤ 实战：composable 用 toValue 接受 MaybeRefOrGetter</h4>
      <div class="row">
        <button @click="callAsRef">传 ref</button>
        <button @click="callAsGetter">传 getter</button>
        <button @click="callAsValue">传普通值</button>
      </div>
      <p>当前结果: <strong>{{ currentCall }}</strong></p>
      <p class="hint">useGreeting(source: MaybeRefOrGetter&lt;string&gt;) 内部 toValue(source) 即可</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, toRef, toValue, unref, ref, watch } from 'vue'

const state = reactive({ count: 0, name: 'vue', profile: { score: 10 } })

/* === ① toRef(state, 'count') === */
const countRef = toRef(state, 'count')

/* === ② toRef(getter) === */
const nameLength = toRef(() => state.name.length)

/* === ③ watch 单字段 === */
const scoreLog = ref('')
watch(
  toRef(() => state.profile.score),
  (next, prev) => { scoreLog.value += `${prev}→${next}; ` },
)

/* === ④ toValue vs unref === */
const ref1 = ref(42)
const getter1 = () => 99

const cmpRows = [
  { label: 'ref(42)', unref: String(unref(ref1)), toValue: String(toValue(ref1)) },
  { label: '() => 99', unref: String(unref(getter1)), toValue: String(toValue(getter1)) },
  { label: '42', unref: String(unref(42)), toValue: String(toValue(42)) },
]

/* === ⑤ MaybeRefOrGetter composable === */
function useGreeting(source: Parameters<typeof toValue>[0]) {
  return toValue(source)
}

const currentCall = ref('—')
function callAsRef() { currentCall.value = useGreeting(ref('hi via ref')) }
function callAsGetter() { currentCall.value = useGreeting(() => 'hi via getter') }
function callAsValue() { currentCall.value = useGreeting('hi via plain value') }
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
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 6px;
}
.row { display: flex; gap: 6px; flex-wrap: wrap; }
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