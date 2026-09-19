<template>
  <div class="demo">
    <h2>TransitionGroup + FLIP 原理</h2>

    <section class="card">
      <h4>① 列表 shuffle / insert / remove</h4>
      <button @click="shuffle">随机打乱</button>
      <button @click="push">追加</button>
      <button @click="pop">移除</button>
      <TransitionGroup name="flip" tag="ul" class="list">
        <li v-for="item in items" :key="item.id" class="item">
          {{ item.label }}
          <button class="x" @click="remove(item.id)">×</button>
        </li>
      </TransitionGroup>
      <p class="hint">观察 .flip-move 类（Vue 自动生成的 FLIP 过渡）</p>
    </section>

    <section class="card">
      <h4>② move-class 自定义</h4>
      <p class="hint">改 <code>move-class</code>，覆盖默认名 <code>flip-move</code>。</p>
      <TransitionGroup name="card" tag="div" move-class="card-move" class="grid">
        <div v-for="item in items" :key="item.id" class="cell" :style="{ background: item.color }">
          {{ item.label }}
        </div>
      </TransitionGroup>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

let seq = 4
const colors = ['#fca5a5', '#fdba74', '#fde68a', '#bef264', '#86efac', '#67e8f9', '#93c5fd', '#c4b5fd']
const items = ref([
  { id: 1, label: 'A', color: colors[0] },
  { id: 2, label: 'B', color: colors[1] },
  { id: 3, label: 'C', color: colors[2] },
])

function shuffle() {
  items.value = [...items.value].sort(() => Math.random() - 0.5)
}
function push() {
  seq++
  items.value.push({
    id: seq,
    label: String.fromCharCode(65 + items.value.length % 26),
    color: colors[seq % colors.length],
  })
}
function pop() {
  items.value.pop()
}
function remove(id: number) {
  items.value = items.value.filter(it => it.id !== id)
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 14px; margin-bottom: 14px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h4 { margin: 0 0 8px; font-size: 14px; }
button { padding: 4px 12px; border: 1px solid #cbd5e1; background: #fff; border-radius: 4px; cursor: pointer; margin-right: 6px; }
.list { list-style: none; padding: 0; margin: 8px 0 0; }
.item {
  padding: 8px 10px;
  margin-bottom: 4px;
  background: #eef2ff;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item .x {
  padding: 0 8px;
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 4px;
  cursor: pointer;
}

/* FLIP move class */
.flip-move {
  transition: transform 0.5s;
}

.flip-enter-from, .flip-leave-to { opacity: 0; transform: translateY(10px); }
.flip-enter-active, .flip-leave-active { transition: all 0.4s; }
.flip-leave-active { position: absolute; }

/* ② */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin-top: 8px;
}
.cell {
  padding: 18px 8px;
  text-align: center;
  border-radius: 6px;
  color: #fff;
  font-weight: bold;
}
.card-move { transition: transform 0.6s; }
.card-enter-from, .card-leave-to { opacity: 0; transform: scale(0.7); }
.card-enter-active, .card-leave-active { transition: all 0.3s; }

code { background: #f1f5f9; padding: 1px 5px; border-radius: 3px; font-size: 12px; }
.hint { font-size: 12px; color: #64748b; margin: 6px 0 0; }
</style>