<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① :max="3" + LRU 淘汰演示</h4>
      <div class="tabs">
        <button :class="{ active: current === 'A' }" @click="current = 'A'">A</button>
        <button :class="{ active: current === 'B' }" @click="current = 'B'">B</button>
        <button :class="{ active: current === 'C' }" @click="current = 'C'">C</button>
        <button :class="{ active: current === 'D' }" @click="current = 'D'">D</button>
      </div>
      <KeepAlive :max="3">
        <component :is="compMap[current]" :key="current" />
      </KeepAlive>
      <p class="hint">访问 D → A → B → C → A 时，A 已被 LRU 淘汰（重新挂载）</p>
    </section>

    <section class="card">
      <h4>② 钩子触发顺序：mounted → activated → deactivated → unmounted</h4>
      <pre>{{ lifecycleLog }}</pre>
      <p class="hint">点击上方 Tab 切换时观察日志</p>
    </section>

    <section class="card">
      <h4>③ 验证 LRU 缓存命中</h4>
      <p>当前缓存实例名（DOM 中存在的子组件）: <code>{{ cachedNames }}</code></p>
      <p class="hint">手动操作：A → B → A，观察 A 是否保留其内部输入</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw } from 'vue'
import PageA from './PageA.vue'
import PageB from './PageB.vue'
import PageC from './PageC.vue'
import PageD from './PageD.vue'

const title = ref('KeepAlive :max + LRU 淘汰')

const compMap = {
  A: markRaw(PageA),
  B: markRaw(PageB),
  C: markRaw(PageC),
  D: markRaw(PageD),
} as const

const current = ref<keyof typeof compMap>('A')

const lifecycleLog = ref('')
// 子组件会通过 window.__KEEP_LOG__ 写入日志（开发期约定）
declare global {
  interface Window {
    __KEEP_LOG__?: string[]
  }
}
if (typeof window !== 'undefined' && !window.__KEEP_LOG__) {
  window.__KEEP_LOG__ = []
}
setInterval(() => {
  if (typeof window !== 'undefined' && window.__KEEP_LOG__) {
    const logs = window.__KEEP_LOG__
    lifecycleLog.value = logs.slice(-15).join('\n')
  }
}, 200)

const cachedNames = ref('A')
setInterval(() => {
  if (typeof document !== 'undefined') {
    const root = document.querySelector('.tabs')?.nextElementSibling
    cachedNames.value = root ? root.textContent?.slice(0, 30) ?? '' : ''
  }
}, 400)
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
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}
.tabs button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.tabs button.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}
pre {
  margin-top: 6px;
  padding: 8px;
  background: #0f172a;
  color: #f8fafc;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}
code {
  font-family: 'SFMono-Regular', Consolas, monospace;
  background: #fef9c3;
  padding: 1px 4px;
  border-radius: 3px;
}
</style>
