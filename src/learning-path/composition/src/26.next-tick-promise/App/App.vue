<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① Promise 形式 nextTick</h4>
      <p>count = <strong id="cnt">{{ count }}</strong></p>
      <button @click="bumpAsync">++ 后 await nextTick</button>
      <pre>{{ logA }}</pre>
    </section>

    <section class="card">
      <h4>② 多次同步改动 → 一次 DOM 更新</h4>
      <p>list 长度 = <strong>{{ list.length }}</strong></p>
      <ul ref="listEl">
        <li v-for="i in list" :key="i" :ref="el => bindItem(el, i)">{{ i }}</li>
      </ul>
      <button @click="bulkPush">push 5 项</button>
      <pre>{{ logB }}</pre>
      <p class="hint">5 次 push 合并成一次 DOM flush；listEl 高度一次性更新</p>
    </section>

    <section class="card">
      <h4>③ vs queueMicrotask：nextTick 跟随 Vue 批处理</h4>
      <button @click="race">比较 nextTick 与 queueMicrotask</button>
      <pre>{{ logC }}</pre>
      <p class="hint">Vue 的 flushJob 在 queueMicrotask 之前完成；nextTick 严格保证 DOM 已更新</p>
    </section>

    <section class="card">
      <h4>④ flushSync vs nextTick：批处理会丢</h4>
      <button @click="useFlushSync">flushSync 强制立即更新</button>
      <pre>{{ logD }}</pre>
      <p class="hint">flushSync 会立即同步 flush，但下一个同步赋值不再合并</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, flushSync, useTemplateRef } from 'vue'

const title = ref('nextTick Promise API + DOM 更新顺序')

/* === ① 基础 === */
const count = ref(0)
const logA = ref('')
async function bumpAsync() {
  logA.value = ''
  count.value++
  logA.value += `同步读 DOM: ${document.getElementById('cnt')?.textContent}\n`
  await nextTick()
  logA.value += `await nextTick 后: ${document.getElementById('cnt')?.textContent}\n`
}

/* === ② 批处理 === */
const list = ref<number[]>([])
const logB = ref('')
const listEl = useTemplateRef<HTMLUListElement>('listEl')
const itemElements = new Map<number, HTMLLIElement>()
function bindItem(el: Element | null, id: number) {
  if (el) itemElements.set(id, el as HTMLLIElement)
  else itemElements.delete(id)
}

async function bulkPush() {
  logB.value = ''
  const startHeight = listEl.value?.getBoundingClientRect().height ?? 0
  logB.value += `改动前 list 高度: ${startHeight}\n`

  list.value.push(1, 2, 3, 4, 5)

  // 同步阶段：DOM 还没更新
  logB.value += `同步阶段 childNodes: ${listEl.value?.children.length}\n`

  await nextTick()
  logB.value += `nextTick 后 childNodes: ${listEl.value?.children.length}\n`
  logB.value += `nextTick 后高度: ${listEl.value?.getBoundingClientRect().height}\n`
}

/* === ③ nextTick vs queueMicrotask === */
const logC = ref('')
async function race() {
  logC.value = ''
  list.value.push(101)
  const p1 = nextTick().then(() => logC.value += 'nextTick 触发\n')
  const p2 = queueMicrotask(() => logC.value += 'queueMicrotask 触发\n')
  await Promise.all([p1, p2])
}

/* === ④ flushSync === */
const items = ref<number[]>([])
const logD = ref('')
function useFlushSync() {
  logD.value = ''
  // flushSync 内：DOM 立即更新；调用方应只在极端场景使用
  flushSync(() => { items.value.push(1); items.value.push(2) })
  logD.value += `flushSync 后长度: ${items.value.length}\n`
  // 注意：flushSync 后续同步赋值不会自动合并（批处理丢失）
  items.value.push(3)
  items.value.push(4)
  // 用 nextTick 等下一轮批处理
  nextTick(() => {
    logD.value += `nextTick 后长度: ${items.value.length}\n`
  })
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
ul {
  margin: 8px 0;
  padding-left: 18px;
}
</style>