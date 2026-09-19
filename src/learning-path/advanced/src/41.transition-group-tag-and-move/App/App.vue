<template>
  <div class="demo">
    <h3>TransitionGroup 完整 prop 与 FLIP 动画</h3>
    <p class="hint">
      演示 <code>tag</code>、<code>:move-class</code>、shuffle 后 FLIP 移动动画，
      以及 enter / leave / move 三类过渡的 CSS 写法。
    </p>

    <section class="card">
      <h4>① 基础：tag="ul" + :move-class</h4>
      <div class="row">
        <input v-model="text" placeholder="添加 todo" @keyup.enter="add" />
        <button @click="add">添加</button>
        <button @click="shuffle">打乱顺序</button>
        <button @click="reset">重置</button>
      </div>

      <TransitionGroup tag="ul" name="todo" class="todo-list">
        <li v-for="t in todos" :key="t.id">
          <span>{{ t.text }}</span>
          <button class="x" @click="remove(t.id)">×</button>
        </li>
      </TransitionGroup>
    </section>

    <section class="card">
      <h4>② 自定义 move-class：spring 缓动</h4>
      <div class="row">
        <input v-model="text2" placeholder="添加 chip" @keyup.enter="addChip" />
        <button @click="addChip">添加</button>
        <button @click="shuffleChips">打乱</button>
      </div>

      <TransitionGroup tag="div" name="chip" :move-class="'chip-spring'" class="chip-list">
        <span v-for="c in chips" :key="c.id" class="chip" @click="removeChip(c.id)">
          {{ c.text }}
        </span>
      </TransitionGroup>
    </section>

    <section class="card">
      <h4>③ 网格重排：3 列卡片</h4>
      <button @click="shuffleCards">打乱卡片顺序</button>

      <TransitionGroup tag="div" name="card" class="card-grid">
        <div v-for="c in cards" :key="c.id" class="card-item">
          {{ c.text }}
        </div>
      </TransitionGroup>
    </section>

    <section class="card info">
      <h4>④ move-class 命名约定</h4>
      <p>当 <code>name="todo"</code> 时，三个 class 默认为：</p>
      <ul>
        <li><code>.todo-enter-from</code> / <code>.todo-enter-active</code> / <code>.todo-enter-to</code></li>
        <li><code>.todo-leave-from</code> / <code>.todo-leave-active</code> / <code>.todo-leave-to</code></li>
        <li><code>.todo-move</code>（FLIP 移动过渡）</li>
      </ul>
      <p class="hint">显式 <code>:move-class="'chip-spring'"</code> 时第三类被覆盖；enter/leave 不变</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Todo { id: number; text: string }
interface Chip { id: number; text: string }
interface Card { id: number; text: string }

/* === ① todo list === */
let todoNid = 0
const text = ref('')
const seed = (n: number): Todo[] => Array.from({ length: n }, (_, i) => ({
  id: ++todoNid,
  text: `初始任务 ${i + 1}`,
}))
const todos = ref<Todo[]>(seed(5))

const add = () => {
  const v = text.value.trim()
  if (!v) return
  todos.value.push({ id: ++todoNid, text: v })
  text.value = ''
}
const remove = (id: number) => {
  todos.value = todos.value.filter(t => t.id !== id)
}
const shuffle = () => {
  todos.value = [...todos.value].sort(() => Math.random() - 0.5)
}
const reset = () => {
  const max = Math.max(0, ...todos.value.map(t => t.id))
  todoNid = max
  todos.value = seed(5)
}

/* === ② chips === */
let chipNid = 0
const text2 = ref('')
const chips = ref<Chip[]>([
  { id: ++chipNid, text: 'Vue' },
  { id: ++chipNid, text: 'React' },
  { id: ++chipNid, text: 'Svelte' },
  { id: ++chipNid, text: 'Solid' },
  { id: ++chipNid, text: 'Lit' },
])
const addChip = () => {
  const v = text2.value.trim()
  if (!v) return
  chips.value.push({ id: ++chipNid, text: v })
  text2.value = ''
}
const removeChip = (id: number) => {
  chips.value = chips.value.filter(c => c.id !== id)
}
const shuffleChips = () => {
  chips.value = [...chips.value].sort(() => Math.random() - 0.5)
}

/* === ③ cards === */
let cardNid = 0
const cards = ref<Card[]>(Array.from({ length: 9 }, (_, i) => ({
  id: ++cardNid,
  text: `卡片 ${i + 1}`,
})))
const shuffleCards = () => {
  cards.value = [...cards.value].sort(() => Math.random() - 0.5)
}
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
.card.info { background: #f0f9ff; border-color: #bae6fd; }
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
.row {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
input {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 13px;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
ul {
  margin: 0;
  padding: 0;
  list-style: none;
  position: relative;
}

/* === todo list FLIP === */
.todo-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 4px;
}
.todo-list .x { padding: 2px 8px; color: #c0392b; }
.todo-enter-from { opacity: 0; transform: translateY(-10px); }
.todo-enter-active { transition: all .3s; }
.todo-leave-to { opacity: 0; transform: translateX(20px); }
.todo-leave-active { transition: all .3s; position: absolute; }
.todo-move { transition: transform .35s cubic-bezier(.4, 0, .2, 1); }

/* === chip spring === */
.chip-list { display: flex; flex-wrap: wrap; gap: 6px; min-height: 32px; position: relative; }
.chip {
  padding: 4px 10px;
  background: #ecfeff;
  border: 1px solid #67e8f9;
  border-radius: 14px;
  font-size: 13px;
  cursor: pointer;
}
.chip-enter-from { opacity: 0; transform: scale(.5); }
.chip-enter-active { transition: all .25s; }
.chip-leave-to { opacity: 0; transform: scale(.5); }
.chip-leave-active { transition: all .25s; position: absolute; }
.chip-spring {
  transition: transform .5s cubic-bezier(.34, 1.56, .64, 1);
}

/* === card grid === */
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
  position: relative;
}
.card-item {
  padding: 16px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
}
.card-enter-from { opacity: 0; transform: scale(.9); }
.card-enter-active { transition: all .25s; }
.card-leave-to { opacity: 0; transform: scale(.9); }
.card-leave-active { transition: all .25s; position: absolute; }
.card-move { transition: transform .4s; }
</style>