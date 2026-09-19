<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 强类型组件实例</h4>
      <Counter ref="counterRef" />
      <button @click="callAdd">add()</button>
      <button @click="callReset">reset()</button>
      <p class="hint">counterRef 被推断为 InstanceType&lt;typeof Counter&gt; —— add/reset 自动补全</p>
    </section>

    <section class="card">
      <h4>② 链式 helper：把 ref 抽到工具函数里</h4>
      <Counter ref="counter2Ref" />
      <button @click="bulkReset">一次性调用 helper 把所有计数清零</button>
      <p class="hint">helper 接受 Counter ref 数组 —— 类型由 useTemplateRef 顺流而下</p>
    </section>

    <section class="card">
      <h4>③ 子组件未 defineExpose：访问会拿到空</h4>
      <Silent ref="silentRef" />
      <button @click="accessSilent">尝试访问方法</button>
      <pre>{{ silentLog }}</pre>
      <p class="hint">Silent.vue 没 defineExpose；访问 nonexistent() 类型错误 + 运行时 undefined</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import Counter from './Counter.vue'
import Silent from './Silent.vue'

const title = ref('useTemplateRef 类型推断（组件实例）')

/* === ① Counter === */
const counterRef = useTemplateRef<InstanceType<typeof Counter>>('counterRef')
const callAdd = () => counterRef.value?.add()
const callReset = () => counterRef.value?.reset()

/* === ② helper === */
function resetAll(targets: ReadonlyArray<InstanceType<typeof Counter>>) {
  targets.forEach(t => t?.reset())
}
const counter2Ref = useTemplateRef<InstanceType<typeof Counter>>('counter2Ref')
const bulkReset = () => resetAll([counterRef.value!, counter2Ref.value!])

/* === ③ Silent === */
const silentRef = useTemplateRef<InstanceType<typeof Silent>>('silentRef')
const silentLog = ref('')
const accessSilent = () => {
  silentLog.value = ''
  const inst = silentRef.value
  silentLog.value += `inst 类型: ${typeof inst}\n`
  silentLog.value += `inst.silentMethod 存在? ${typeof (inst as any)?.silentMethod}\n`
  // 下面这一行如果取消注释会触发 TS 类型错误
  // inst?.silentMethod()
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