<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① v-memo：依赖数组内全等就跳过 patch</h4>
      <p>外部无关 state = {{ external }}</p>
      <button @click="external++">外部 unrelated++（rows.value 不变）</button>
      <p>patch 触发次数: <strong>{{ renderCount }}</strong></p>
      <ul>
        <li
          v-for="row in rows"
          :key="row.id"
          v-memo="[row.value, row.selected]"
        >
          id={{ row.id }} value={{ row.value }}
          <span :class="{ sel: row.selected }">{{ row.selected ? '★' : '☆' }}</span>
        </li>
      </ul>
      <button @click="toggleSelect(0)">切第 0 行的 selected</button>
      <button @click="incRow(0)">第 0 行的 value++</button>
      <p class="hint">rows[0].value 变化 → 行 0 重新 patch；其它行跳过（v-memo 命中）</p>
    </section>

    <section class="card">
      <h4>② v-pre：原样输出</h4>
      <div v-pre>{{ 这里的内容不会被编译 }}</div>
      <p class="hint">编译器跳过这个 div，连 mustaches 语法都不解析</p>
    </section>

    <section class="card">
      <h4>③ v-once：节点只渲染一次</h4>
      <p>当前时间: {{ currentTime }}</p>
      <p>v-once 节点的时间: <span v-once>{{ currentTime }}</span></p>
      <button @click="tick">tick 时间</button>
      <p class="hint">v-once 的 span 永远显示首次渲染时的时间，tick 不会刷新它</p>
    </section>

    <section class="card">
      <h4>④ v-cloak + CSS：首屏防闪烁</h4>
      <div class="cloak-demo" v-cloak>动态内容: {{ msg }}</div>
      <button @click="msg += '!'">msg++</button>
      <p class="hint">v-cloak 在组件挂载完成后被移除；mount 前由 CSS 隐藏</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onUpdated } from 'vue'

const title = ref('v-memo / v-pre / v-once / v-cloak 编译时优化指令')

/* === ① v-memo === */
const rows = ref([
  { id: 0, value: 1, selected: false },
  { id: 1, value: 2, selected: false },
  { id: 2, value: 3, selected: false },
])
const external = ref(0)
const renderCount = ref(0)

onUpdated(() => {
  renderCount.value++
})

function toggleSelect(id: number) {
  const r = rows.value.find(x => x.id === id)
  if (r) r.selected = !r.selected
}
function incRow(id: number) {
  const r = rows.value.find(x => x.id === id)
  if (r) r.value++
}

/* === ③ v-once === */
const currentTime = ref(new Date().toLocaleTimeString())
function tick() {
  currentTime.value = new Date().toLocaleTimeString()
}

/* === ④ v-cloak === */
const msg = ref('init')
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
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 6px;
}
ul {
  margin: 8px 0;
  padding-left: 18px;
}
.sel {
  color: #f59e0b;
}
.cloak-demo {
  padding: 6px 12px;
  background: #ecfeff;
  border: 1px solid #67e8f9;
  border-radius: 4px;
}
:deep([v-cloak]) {
  display: none;
}
</style>