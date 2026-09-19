<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① toRef(obj, 'key')：双向桥</h4>
      <p>state.count = <code>{{ state.count }}</code></p>
      <p>countRef.value = <code>{{ countRef.value }}</code></p>
      <button @click="incViaState">通过 state ++</button>
      <button @click="incViaRef">通过 countRef ++</button>
      <p class="hint">两个 ++ 等价：底层走 ObjectRefImpl 共享引用</p>
    </section>

    <section class="card">
      <h4>② toRef(getter)：只读包装</h4>
      <p>state.name = <code>{{ state.name }}</code></p>
      <p>nameLengthRef.value = <code>{{ nameLength.value }}</code></p>
      <button @click="rename">改名（push）</button>
      <p class="hint">getter 形式的 ref 是只读；尝试写入会被警告</p>
    </section>

    <section class="card">
      <h4>③ watch + toRef：精确跟踪单字段</h4>
      <p>profile.score 历史: <code>{{ scoreLog }}</code></p>
      <button @click="bumpScore">score ++</button>
      <p class="hint">watch(toRef(() => state.profile.score), ...) —— getter 形式天然 deep</p>
    </section>

    <section class="card">
      <h4>④ toRef(props, 'count')：把父 props 拆成可写视图</h4>
      <Child :count="state.count" @plus="state.count++" />
      <p class="hint">子组件内部 useCounter(toRef(props, 'count')) 不再重新 watch；ref 双向同步</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, toRef, watch, ref } from 'vue'
import Child from './Child.vue'

const title = ref('toRef：把对象的某个字段桥接到 ref')

/* === ① 双向桥 === */
const state = reactive({ count: 0, name: 'vue' })
const countRef = toRef(state, 'count')
const incViaState = () => state.count++
const incViaRef = () => countRef.value++

/* === ② 只读 getter === */
const nameLength = toRef(() => state.name.length)
const rename = () => {
  state.name += '!'
}

/* === ③ watch 单字段 === */
const scoreLog = ref('')
const stateWithProfile = reactive({ profile: { score: 10 } })
watch(
  toRef(() => stateWithProfile.profile.score),
  (v, prev) => {
    scoreLog.value += `${prev}→${v}; `
  },
)
const bumpScore = () => stateWithProfile.profile.score++
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
</style>