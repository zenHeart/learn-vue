<template>
  <div class="demo">
    <h2>useTemplateRef 模板 ref</h2>

    <section class="card">
      <h3>1. 基础用法（focus / scrollIntoView）</h3>
      <input ref="inputRef" placeholder="自动聚焦" />
      <button @click="focusInput">聚焦</button>
      <button @click="selectAll">全选</button>
    </section>

    <section class="card">
      <h3>2. 强类型推断 (组件实例)</h3>
      <Counter ref="counterRef" />
      <button @click="callCounter">调用子组件方法</button>
    </section>

    <section class="card">
      <h3>3. v-for 中动态 ref 数组</h3>
      <div class="row">
        <button v-for="i in items" :key="i.id" :ref="el => setItemRef(el, i.id)">
          {{ i.label }}
        </button>
      </div>
      <p class="hint">v-for 内 useTemplateRef 不直接支持，用数组管理</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import Counter from './Counter.vue'

const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
const counterRef = useTemplateRef<InstanceType<typeof Counter>>('counterRef')

const focusInput = () => inputRef.value?.focus()
const selectAll = () => inputRef.value?.select()

const callCounter = () => counterRef.value?.add()

// v-for 中动态管理 ref
const items = [
  { id: 1, label: 'A' },
  { id: 2, label: 'B' },
  { id: 3, label: 'C' },
]
const itemRefs = new Map<number, HTMLButtonElement>()
function setItemRef(el: Element | null, id: number) {
  if (el) itemRefs.set(id, el as HTMLButtonElement)
  else itemRefs.delete(id)
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0 0; font-size: 12px; color: #888; }
.row { display: flex; gap: 6px; }
input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
