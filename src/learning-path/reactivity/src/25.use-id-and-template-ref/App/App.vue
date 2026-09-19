<template>
  <section class="r25">
    <h2>25 · useId() + useTemplateRef()（Vue 3.5+）</h2>

    <div class="card">
      <h3>① 表单 label / input 配对（useId 双向）</h3>
      <p class="hint">label 的 <code>for</code> 与 input 的 <code>id</code> 来自同一 <code>useId()</code>，无需手写 ID 也不会重复。</p>
      <FormField label="姓名" v-model="name" placeholder="请输入" />
      <FormField label="邮箱" v-model="email" placeholder="user@example.com" />
      <FormField label="备注" v-model="note" placeholder="..." />
    </div>

    <div class="card">
      <h3>② 当前值</h3>
      <p>name: <strong>{{ name }}</strong></p>
      <p>email: <strong>{{ email }}</strong></p>
      <p>note: <strong>{{ note }}</strong></p>
    </div>

    <div class="card">
      <h3>③ useTemplateRef 自动 focus</h3>
      <button @click="focusFirst">focus 第一个 input</button>
      <button @click="logInputs">打印所有 input ref</button>
      <pre>{{ log }}</pre>
      <FormField label="可被聚焦 #1" v-model="v1" ref-name="i1" />
      <FormField label="可被聚焦 #2" v-model="v2" ref-name="i2" />
      <FormField label="可被聚焦 #3" v-model="v3" ref-name="i3" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormField from './FormField.vue'

const name = ref('')
const email = ref('')
const note = ref('')

const v1 = ref('')
const v2 = ref('')
const v3 = ref('')

const log = ref<string>('')

function focusFirst() {
  // 通过 FormField 暴露的 focus 方法
  inputs.value[0]?.focus?.()
}
function logInputs() {
  log.value = inputs.value
    .map((el, i) => `[${i}] ${el?.tagName ?? 'null'} (id=${el?.id ?? 'n/a'})`)
    .join('\n')
}

// 收集 v-for 风格的多个 useTemplateRef：使用静态 ref 收集
import { useTemplateRef } from 'vue'
const inputRef1 = useTemplateRef<HTMLInputElement>('i1')
const inputRef2 = useTemplateRef<HTMLInputElement>('i2')
const inputRef3 = useTemplateRef<HTMLInputElement>('i3')
const inputs = ref<(HTMLInputElement | null)[]>([inputRef1.value, inputRef2.value, inputRef3.value])
</script>

<style scoped>
.r25 { font-family: system-ui; padding: 1rem; max-width: 760px; margin: 0 auto; }
.r25 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r25 button { margin-right: 0.4rem; padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
.r25 pre { background: #1e1e1e; color: #d4d4d4; padding: 8px; font-size: 12px; border-radius: 4px; white-space: pre-wrap; }
code { background: #f6f8fa; padding: 1px 4px; border-radius: 3px; }
.hint { color: #888; font-size: 12px; margin-bottom: 6px; }
</style>
