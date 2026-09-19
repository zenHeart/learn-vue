<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 字符串 ref → useTemplateRef 迁移</h4>
      <input ref="inputRef" placeholder="自动聚焦" />
      <button @click="focusInput">聚焦</button>
      <button @click="selectAll">全选</button>
      <p class="hint">setup 同步阶段拿到的 ref.value === null；onMounted 之后才挂上</p>
    </section>

    <section class="card">
      <h4>② 强类型推断组件实例</h4>
      <Counter ref="counterRef" />
      <button @click="callCounter">调子组件方法</button>
      <p class="hint">useTemplateRef&lt;InstanceType&lt;typeof Counter&gt;&gt;('.') 让 IDE 给出 add()/reset() 自动补全</p>
    </section>

    <section class="card">
      <h4>③ v-for 内的动态 ref 收集</h4>
      <div class="row">
        <button
          v-for="i in items"
          :key="i.id"
          :ref="el => setItemRef(el, i.id)"
          :class="{ active: activeId === i.id }"
          @click="activeId = i.id"
        >
          {{ i.label }}
        </button>
      </div>
      <p>当前选中 id: <code>{{ activeId }}</code>；收集到的 DOM 数: <code>{{ itemRefs.size }}</code></p>
      <p class="hint">useTemplateRef 不支持 v-for；改用普通 ref + 函数 ref + Map 收集</p>
    </section>

    <section class="card">
      <h4>④ SSR 视角：模板 ref 在服务端永远为 null</h4>
      <p>当前 setup 同步拿到 inputRef.value = <code>{{ inputRef.value === null ? 'null' : 'mounted' }}</code></p>
      <p class="hint">SSR 期间不会真正产生 DOM；模板 ref 是「客户端 mounted 后才有值」的语义</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, onMounted } from 'vue'
import Counter from './Counter.vue'

const title = ref('useTemplateRef：字符串 ref 的现代化替代')

/* === ① DOM 元素 === */
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')

// setup 同步阶段必然为 null
console.log('[setup] inputRef.value =', inputRef.value)

onMounted(() => {
  console.log('[mounted] inputRef.value =', inputRef.value)
})

const focusInput = () => inputRef.value?.focus()
const selectAll = () => inputRef.value?.select()

/* === ② 组件实例 === */
const counterRef = useTemplateRef<InstanceType<typeof Counter>>('counterRef')
const callCounter = () => counterRef.value?.add()

/* === ③ v-for 收集 === */
const items = [
  { id: 1, label: 'A' },
  { id: 2, label: 'B' },
  { id: 3, label: 'C' },
]
const itemRefs = new Map<number, HTMLButtonElement>()
const activeId = ref<number | null>(1)
function setItemRef(el: Element | null, id: number) {
  if (el) itemRefs.set(id, el as HTMLButtonElement)
  else itemRefs.delete(id)
}
</script>

<style scoped>
.demo {
  max-width: 760px;
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
.row {
  display: flex;
  gap: 6px;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
button.active {
  background: #2563eb;
  color: #fff;
  border-color: #1d4ed8;
}
input {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  margin-right: 6px;
}
</style>