<template>
  <div class="demo">
    <h2>TransitionGroup 列表动画</h2>

    <section class="card">
      <h3>1. 增删 + 移动</h3>
      <div class="row">
        <input v-model="text" placeholder="todo" />
        <button @click="add">添加</button>
        <button @click="shuffle">打乱</button>
      </div>

      <TransitionGroup name="todo" tag="ul" class="list">
        <li v-for="t in todos" :key="t.id">
          <span>{{ t.text }}</span>
          <button @click="remove(t.id)">×</button>
        </li>
      </TransitionGroup>
    </section>

    <section class="card">
      <h3>2. 自定义过渡（缩放）</h2>
      <div class="row">
        <input v-model="text2" placeholder="添加" />
        <button @click="addScale">添加</button>
      </div>
      <TransitionGroup name="scale" tag="div" class="chips">
        <span v-for="t in tags" :key="t" class="chip" @click="removeTag(t)">
          {{ t }}
        </span>
      </TransitionGroup>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Todo { id: number; text: string }
const text = ref('')
const todos = ref<Todo[]>([
  { id: 1, text: 'Vue 3 学习' },
  { id: 2, text: 'Composition API' },
  { id: 3, text: '响应式原理' },
])

let nid = 4
const add = () => {
  if (!text.value.trim()) return
  todos.value.push({ id: nid++, text: text.value })
  text.value = ''
}
const remove = (id: number) => {
  todos.value = todos.value.filter((t) => t.id !== id)
}
const shuffle = () => {
  todos.value = [...todos.value].sort(() => Math.random() - 0.5)
}

// 缩放列表
const text2 = ref('')
const tags = ref<string[]>(['frontend', 'design', 'docs'])
const addScale = () => {
  if (!text2.value.trim()) return
  tags.value.push(text2.value)
  text2.value = ''
}
const removeTag = (t: string) => {
  tags.value = tags.value.filter((x) => x !== t)
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.row { display: flex; gap: 6px; margin-bottom: 10px; }
input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
.list { list-style: none; padding: 0; margin: 0; position: relative; }
.list li { display: flex; justify-content: space-between; padding: 8px 10px; background: #fff; border: 1px solid #e5e5e5; border-radius: 4px; margin-bottom: 4px; }
.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { padding: 4px 10px; background: #e6f4ff; border: 1px solid #91caff; border-radius: 14px; font-size: 13px; cursor: pointer; }

/* FLIP 动画 */
.todo-enter-from, .todo-leave-to { opacity: 0; transform: translateY(-10px); }
.todo-enter-active, .todo-leave-active { transition: all .3s; }
.todo-move { transition: transform .3s; }
.todo-leave-active { position: absolute; }

/* scale */
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.5); }
.scale-enter-active, .scale-leave-active { transition: all .3s; }
.scale-move { transition: transform .3s; }
.scale-leave-active { position: absolute; }
</style>
