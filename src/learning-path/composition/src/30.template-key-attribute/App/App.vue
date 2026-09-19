<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① v-for :key：稳定 key 保留每项状态</h4>
      <input v-model="newText" @keydown.enter="addItem" placeholder="新项" />
      <button @click="addItem">添加</button>
      <ul>
        <li v-for="item in items" :key="item.id">
          <input v-model="item.text" />
          <button @click="removeItem(item.id)">删除</button>
        </li>
      </ul>
      <p class="hint">每项有 :key —— 删除中间项不会让 input 状态错乱</p>
    </section>

    <section class="card">
      <h4>② 对照：不加 :key 时的错乱</h4>
      <input v-model="newText2" @keydown.enter="addItemNoKey" placeholder="新项" />
      <button @click="addItemNoKey">添加</button>
      <ul>
        <li v-for="(item, idx) in itemsNoKey" :key="idx">
          <input :value="item.text" @input="(e) => updateNoKey(idx, (e.target as HTMLInputElement).value)" />
          <button @click="removeNoKey(idx)">删除</button>
        </li>
      </ul>
      <p class="hint">:key=idx —— 删除中间项时输入框内容错位</p>
    </section>

    <section class="card">
      <h4>③ 强制 forceUpdate（key++）</h4>
      <button @click="forceKey++">强制重渲染（forceKey++）</button>
      <span>forceKey = {{ forceKey }}</span>
      <ForceUpdatePanel :key="forceKey" />
      <p class="hint">改 :key 即便同一组件也会重建 —— 用于重置组件状态</p>
    </section>

    <section class="card">
      <h4>④ :key 与 Transition 动画</h4>
      <button @click="cyclePage">切换页面</button>
      <Transition name="fade" mode="out-in">
        <div :key="page" class="page-display">当前页: {{ page }}</div>
      </Transition>
      <p class="hint">:key 变化触发 leave+enter 动画</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ForceUpdatePanel from './ForceUpdatePanel.vue'

const title = ref('模板 :key 属性')

interface Item { id: number; text: string }
const items = ref<Item[]>([
  { id: 1, text: 'first' },
  { id: 2, text: 'second' },
  { id: 3, text: 'third' },
])
const newText = ref('')

function addItem() {
  if (!newText.value) return
  items.value.push({ id: Date.now(), text: newText.value })
  newText.value = ''
}
function removeItem(id: number) {
  items.value = items.value.filter((i) => i.id !== id)
}

const itemsNoKey = ref<Item[]>([
  { id: 10, text: 'a' },
  { id: 11, text: 'b' },
  { id: 12, text: 'c' },
])
const newText2 = ref('')
function addItemNoKey() {
  if (!newText2.value) return
  itemsNoKey.value.push({ id: Date.now(), text: newText2.value })
  newText2.value = ''
}
function updateNoKey(idx: number, v: string) {
  itemsNoKey.value[idx].text = v
}
function removeNoKey(idx: number) {
  itemsNoKey.value.splice(idx, 1)
}

const forceKey = ref(0)

const pages = ['Home', 'Docs', 'About']
const pageIdx = ref(0)
const page = computed(() => pages[pageIdx.value])
function cyclePage() {
  pageIdx.value = (pageIdx.value + 1) % pages.length
}

import { computed } from 'vue'
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
  margin-top: 4px;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 6px;
}
input {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  margin-right: 6px;
}
ul {
  margin: 6px 0;
  padding-left: 0;
  list-style: none;
}
li {
  padding: 4px 0;
  display: flex;
  gap: 4px;
  align-items: center;
}
.page-display {
  padding: 16px;
  background: #ddd6fe;
  border: 1px solid #8b5cf6;
  border-radius: 6px;
  margin-top: 6px;
}
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(8px); }
.fade-enter-active, .fade-leave-active { transition: all 0.25s; }
</style>
