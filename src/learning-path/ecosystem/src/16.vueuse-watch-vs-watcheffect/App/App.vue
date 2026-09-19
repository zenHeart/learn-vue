<script setup>
import { ref } from 'vue'
import { watchDebounced, watchThrottled, watchOnce, watchPausable } from '@vueuse/core'

// 1) 防抖搜索：300ms 静默期后才查询
const keyword = ref('')
const searchResults = ref('')
const searchTimestamps = ref([])

watchDebounced(
  keyword,
  (q) => {
    if (!q) {
      searchResults.value = ''
      return
    }
    const ts = new Date().toLocaleTimeString()
    searchTimestamps.value.push(ts)
    searchResults.value = `查询 "${q}" @ ${ts}`
  },
  { debounce: 300, maxWait: 1000 }
)

// 2) 节流：拖拽时实时跟随，~100ms 一次
const sliderValue = ref(0)
const throttleLog = ref([])

watchThrottled(
  sliderValue,
  (v) => {
    throttleLog.value.push(`${new Date().toLocaleTimeString()}.${String(Date.now()).slice(-3)} → ${v}`)
    if (throttleLog.value.length > 8) throttleLog.value.shift()
  },
  { throttle: 100, trailing: true, leading: true }
)

// 3) watchOnce：触发一次后停止
const user = ref(null)
const welcomeShown = ref(false)

watchOnce(user, (u) => {
  if (u) {
    welcomeShown.value = true
    welcomeMsg.value = `欢迎 ${u.name}`
  }
})
const welcomeMsg = ref('')

function login(name) {
  user.value = { name }
}

// 4) watchPausable：路由切换时暂停
const windowSize = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const sizeLog = ref([])
const { pause, resume, isActive } = watchPausable(
  windowSize,
  (v) => sizeLog.value.push(`${new Date().toLocaleTimeString()} → w=${v}`)
)

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    windowSize.value = window.innerWidth
  })
}
</script>

<template>
  <div class="card">
    <h2>VueUse watch 变体</h2>
    <p class="hint">4 个 watch 家族成员：debounce / throttle / once / pausable。</p>

    <section>
      <h3>1. watchDebounced — 搜索</h3>
      <input v-model="keyword" placeholder="连续打字" />
      <p class="result">{{ searchResults || '等待静默期…' }}</p>
      <p class="meta">触发时间点：{{ searchTimestamps.length }} 次</p>
    </section>

    <section>
      <h3>2. watchThrottled — 拖拽节流</h3>
      <input v-model.number="sliderValue" type="range" min="0" max="100" />
      <span>当前：{{ sliderValue }}</span>
      <ul class="log">
        <li v-for="(line, i) in throttleLog" :key="i">{{ line }}</li>
      </ul>
    </section>

    <section>
      <h3>3. watchOnce — 首次登录</h3>
      <div class="row">
        <button @click="login('Alice')">登录为 Alice</button>
        <button @click="login('Bob')">登录为 Bob（不再触发）</button>
      </div>
      <p v-if="welcomeShown" class="result">{{ welcomeMsg }}</p>
      <p v-else class="meta">尚未登录</p>
    </section>

    <section>
      <h3>4. watchPausable — 路由切换暂停</h3>
      <p class="meta">状态：{{ isActive ? '监听中' : '已暂停' }}</p>
      <div class="row">
        <button @click="pause">暂停</button>
        <button @click="resume">恢复</button>
      </div>
      <p class="meta">调整窗口大小会向 sizeLog 写入；暂停时不写。</p>
      <p class="meta">当前 sizeLog 条数：{{ sizeLog.length }}</p>
    </section>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 520px; }
.card h2 { margin: 0 0 6px; font-size: 1rem; }
.hint { font-size: 0.78rem; color: #666; margin: 0 0 10px; }
section { margin: 12px 0; padding: 10px; background: #f6f8fa; border-radius: 8px; }
section h3 { margin: 0 0 8px; font-size: 0.9rem; color: #35495e; }
input[type="text"], input:not([type]) { width: 100%; padding: 5px 8px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; font-size: 0.85rem; }
input[type="range"] { width: 70%; }
.row { display: flex; gap: 6px; }
button { padding: 4px 10px; border-radius: 6px; border: 1px solid #ccc; background: #fff; cursor: pointer; font-size: 0.82rem; }
.result { background: #fff; padding: 6px 8px; border-radius: 6px; font-size: 0.82rem; color: #18a058; margin: 6px 0; min-height: 1.4em; }
.meta { font-size: 0.75rem; color: #888; margin: 4px 0; }
.log { font-family: ui-monospace, monospace; font-size: 0.72rem; color: #666; max-height: 80px; overflow-y: auto; background: #1e1e1e; color: #d4d4d4; padding: 6px 8px; border-radius: 6px; margin: 6px 0; }
.log li { line-height: 1.4; }
</style>
