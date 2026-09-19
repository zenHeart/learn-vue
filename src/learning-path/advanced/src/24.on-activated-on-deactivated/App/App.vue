<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 切换不同 KeepAlive 子组件，查看生命周期</h4>
      <div class="tabs">
        <button
          v-for="t in tabs"
          :key="t.key"
          :class="{ active: activeKey === t.key }"
          @click="activeKey = t.key"
        >
          {{ t.label }}
        </button>
      </div>

      <KeepAlive :max="3">
        <component :is="activeComp" :key="activeKey" />
      </KeepAlive>
      <p class="hint">点击 tab 切换 → 只触发 deactivated / activated；KeepAlive max=3，超过会 LRU 淘汰</p>
    </section>

    <section class="card">
      <h4>② 日志：生命周期序列</h4>
      <pre>{{ log }}</pre>
      <button @click="log = ''">清空</button>
    </section>

    <section class="card">
      <h4>③ 内部状态缓存：切走再回来，组件内部 ref 仍在</h4>
      <p class="hint">在 A 组件点几下 + 1 → 切到 B → 切回 A：状态会保留</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, onActivated, onDeactivated } from 'vue'
import TabA from './TabA.vue'
import TabB from './TabB.vue'
import TabC from './TabC.vue'

const title = ref('onActivated / onDeactivated：KeepAlive 子树的两个生命周期')

const tabs = [
  { key: 'a', label: 'Tab A', comp: TabA },
  { key: 'b', label: 'Tab B', comp: TabB },
  { key: 'c', label: 'Tab C', comp: TabC },
]
const activeKey = ref<'a' | 'b' | 'c'>('a')
const activeComp = computed(() => tabs.find(t => t.key === activeKey.value)!.comp)

const log = ref('')
function append(s: string) {
  log.value += `[${new Date().toLocaleTimeString()}] ${s}\n`
}

// 把 append 通过 provide 暴露给子组件，子组件用 inject 拿到
provide('appendLog', append)
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
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}
.tabs button {
  padding: 6px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.tabs button.active {
  background: #2563eb;
  color: #fff;
  border-color: #1d4ed8;
}
pre {
  margin-top: 6px;
  padding: 8px;
  background: #0f172a;
  color: #f8fafc;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  max-height: 240px;
  overflow-y: auto;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 4px;
}
</style>