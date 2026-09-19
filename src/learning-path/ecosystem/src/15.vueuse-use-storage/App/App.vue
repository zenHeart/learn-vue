<script setup>
import { ref, watch } from 'vue'
import { useStorage, useLocalStorage, useSessionStorage } from '@vueuse/core'

// 基础：useLocalStorage
const name = useLocalStorage('demo.name', 'guest')

// 自定义序列化：Date 类型 localStorage 不支持，得自己转 ISO 字符串
const lastLogin = useStorage(
  'demo.lastLogin',
  new Date(),
  localStorage,
  {
    serializer: {
      read: (v) => v ? new Date(v) : new Date(),
      write: (v) => v instanceof Date ? v.toISOString() : String(v),
    },
  }
)

// sessionStorage：标签关闭即失效
const draft = useSessionStorage('demo.draft', '')

// 跨标签同步演示：A 标签页改 shared，B 标签页自动跟
const shared = useStorage('demo.shared', 0)
const externalUpdate = ref(null)
window.addEventListener('storage', (e) => {
  if (e.key === 'demo.shared') {
    externalUpdate.value = `${new Date().toLocaleTimeString()} — 其他标签写入 ${e.newValue}`
  }
})

function bump() {
  shared.value++
}

function reset() {
  name.value = 'guest'
  draft.value = ''
  shared.value = 0
  localStorage.removeItem('demo.lastLogin')
}
</script>

<template>
  <div class="card">
    <h2>VueUse useStorage / useLocalStorage / useSessionStorage</h2>
    <p class="hint">
      三个 hook 都基于 <code>useStorage</code>：自动持久化 + 跨标签同步（默认 <code>listenToStorageChanges: true</code>）。
      同一 ref 在多个标签里打开同一站点，<strong>写入会自动广播到其他标签</strong>。
    </p>

    <label class="field">
      <span>姓名（localStorage）</span>
      <input v-model="name" type="text" />
    </label>

    <label class="field">
      <span>草稿（sessionStorage）— 关闭标签即丢</span>
      <input v-model="draft" type="text" placeholder="试试关掉这个 tab 再开" />
    </label>

    <div class="field">
      <span>上次登录（自定义 Date 序列化）</span>
      <div class="row">
        <input :value="lastLogin.toISOString()" readonly />
        <button @click="lastLogin = new Date()">记为现在</button>
      </div>
    </div>

    <div class="field">
      <span>跨标签计数器：{{ shared }}</span>
      <div class="row">
        <button class="primary" @click="bump">+1</button>
        <span class="hint">打开第二个 tab 试试</span>
      </div>
      <p v-if="externalUpdate" class="notice">{{ externalUpdate }}</p>
    </div>

    <button class="ghost" @click="reset">清空所有 demo key</button>
  </div>
</template>

<style scoped>
.card { font-family: system-ui, sans-serif; padding: 12px; color: #213547; max-width: 480px; }
.card h2 { margin: 0 0 6px; font-size: 1rem; }
.hint { font-size: 0.78rem; color: #666; margin: 0 0 8px; line-height: 1.5; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.82rem; }
.field { display: block; margin: 10px 0; font-size: 0.85rem; }
.field > span { display: block; color: #35495e; margin-bottom: 4px; font-weight: 500; }
.field input { width: 100%; padding: 6px 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.88rem; box-sizing: border-box; }
.row { display: flex; gap: 6px; align-items: center; }
.row input { flex: 1; background: #f8fafc; }
button { padding: 5px 12px; border-radius: 6px; border: 1px solid #ccc; background: #fff; cursor: pointer; font-size: 0.85rem; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
button.ghost { margin-top: 10px; font-size: 0.78rem; color: #888; }
.notice { background: #f0f9eb; border: 1px solid #42b883; padding: 6px 8px; border-radius: 6px; font-size: 0.78rem; color: #18a058; margin: 6px 0 0; }
</style>
