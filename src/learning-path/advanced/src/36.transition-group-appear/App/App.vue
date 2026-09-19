<template>
  <div class="demo">
    <h2>TransitionGroup：tag 与 appear</h2>

    <section class="card">
      <h3>① tag="ul"：外层渲染为列表</h3>
      <p class="hint">默认渲染为 &lt;span&gt;；这里显式写 <code>tag="ul"</code>，每个 &lt;li&gt; 自带 enter/leave 动画。</p>
      <div class="row">
        <input v-model="text" placeholder="新任务" @keydown.enter="add" />
        <button @click="add">添加</button>
      </div>
      <TransitionGroup name="todo" tag="ul" class="list">
        <li v-for="t in todos" :key="t.id">
          <span>{{ t.text }}</span>
          <button @click="remove(t.id)">×</button>
        </li>
      </TransitionGroup>
    </section>

    <section class="card">
      <h3>② appear：首屏进入动画</h3>
      <p class="hint">
        点「刷新触发 appear」会卸载整个 group 再重新 mount——新挂载时会跑一遍
        enter 动画（fade + slide）。
      </p>
      <button @click="keySeed++">刷新触发 appear</button>
      <TransitionGroup
        :key="keySeed"
        name="fade"
        appear
        tag="div"
        class="chips"
      >
        <span
          v-for="t in tags"
          :key="t"
          class="chip"
        >
          {{ t }}
        </span>
      </TransitionGroup>
    </section>

    <section class="card">
      <h3>③ tag="section" + JS hooks</h3>
      <p class="hint">
        改用 <code>tag="section"</code>；用 JS hooks 在 enter/leave 钩子里打日志，
        验证 appear 与 enter 走的是同一路径。
      </p>
      <button @click="addRandom">随机追加</button>
      <button @click="clear">清空</button>
      <TransitionGroup
        name="card"
        appear
        tag="section"
        class="cards"
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @leave="onLeave"
      >
        <div v-for="c in cards" :key="c.id" class="card-item">
          {{ c.text }}
        </div>
      </TransitionGroup>
      <p class="meta">enter 次数：{{ enterLog.length }}，leave 次数：{{ leaveLog.length }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// ①
interface Todo { id: number; text: string }
const text = ref('')
const todos = ref<Todo[]>([
  { id: 1, text: '写周报' },
  { id: 2, text: '代码评审' },
  { id: 3, text: '准备分享' },
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

// ② appear：靠 key 强制 remount
const keySeed = ref(0)
const tags = ref(['frontend', 'design', 'docs', 'review'])

// ③ JS hooks
interface CardItem { id: number; text: string }
const cards = ref<CardItem[]>([
  { id: 1, text: '首屏元素 A' },
  { id: 2, text: '首屏元素 B' },
  { id: 3, text: '首屏元素 C' },
])
const enterLog = ref<string[]>([])
const leaveLog = ref<string[]>([])
let cid = 4

const addRandom = () => {
  cards.value.push({
    id: cid++,
    text: '随机 ' + Math.floor(Math.random() * 100),
  })
}
const clear = () => {
  cards.value = []
}

const onBeforeEnter = (el: Element) => {
  enterLog.value.push('before ' + (el as HTMLElement).textContent)
}
const onEnter = (el: Element, done: () => void) => {
  enterLog.value.push('enter ' + (el as HTMLElement).textContent)
  done()
}
const onLeave = (el: Element) => {
  leaveLog.value.push('leave ' + (el as HTMLElement).textContent)
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 14px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { font-size: 12px; color: #666; margin: 0 0 10px; line-height: 1.55; }
.meta { font-size: 12px; color: #888; margin-top: 8px; }
.row { display: flex; gap: 6px; margin-bottom: 10px; }
input { padding: 5px 10px; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 5px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }

.list { list-style: none; padding: 0; margin: 0; position: relative; }
.list li { display: flex; justify-content: space-between; padding: 6px 10px; background: #fff; border: 1px solid #e5e5e5; border-radius: 4px; margin-bottom: 4px; }

.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { padding: 4px 10px; background: #e6f4ff; border: 1px solid #91caff; border-radius: 14px; font-size: 13px; }

.cards { display: flex; gap: 6px; flex-wrap: wrap; position: relative; }
.card-item { padding: 10px 14px; background: #fff; border: 1px solid #e5e5e5; border-radius: 6px; }

/* ① todo */
.todo-enter-from, .todo-leave-to { opacity: 0; transform: translateY(-10px); }
.todo-enter-active, .todo-leave-active { transition: all .3s; }
.todo-move { transition: transform .3s; }
.todo-leave-active { position: absolute; }

/* ② fade */
.fade-enter-from { opacity: 0; transform: translateX(-10px); }
.fade-leave-to { opacity: 0; transform: translateX(10px); }
.fade-enter-active, .fade-leave-active { transition: all .35s; }

/* ③ card */
.card-enter-from { opacity: 0; transform: scale(0.85); }
.card-leave-to { opacity: 0; transform: scale(1.1); }
.card-enter-active, .card-leave-active { transition: all .3s; }
.card-move { transition: transform .3s; }
</style>