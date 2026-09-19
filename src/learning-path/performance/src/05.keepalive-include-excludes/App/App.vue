<script setup>
import { ref, onActivated, onDeactivated, defineComponent, h } from 'vue'

const TABS = ['A', 'B', 'C', 'D', 'E']
const current = ref('A')
const eventLog = ref([])
const cacheKeys = ref(['A']) // 简化版：手动维护 LRU 顺序

function log(msg) {
  eventLog.value.unshift({ msg, t: Date.now() })
  if (eventLog.value.length > 12) eventLog.value.length = 12
}

function selectTab(name) {
  current.value = name
  // 简化 LRU：把 name 移到末尾
  const idx = cacheKeys.value.indexOf(name)
  if (idx >= 0) cacheKeys.value.splice(idx, 1)
  cacheKeys.value.push(name)
  if (cacheKeys.value.length > 3) {
    const evicted = cacheKeys.value.shift()
    log(`淘汰 ${evicted}`)
  }
  log(`激活 ${name}`)
}

// 用工厂动态定义 Tab 子组件，便于看到 activated / deactivated
const TabPanel = defineComponent({
  name: 'TabPanel',
  props: ['tab'],
  setup(props) {
    onActivated(() => log(`onActivated: ${props.tab}`))
    onDeactivated(() => log(`onDeactivated: ${props.tab}`))
    return () => h('div', { class: 'panel' }, `面板 ${props.tab} 内容`)
  },
})
</script>

<template>
  <div class="demo">
    <p class="badge">KeepAlive :max + LRU</p>

    <div class="tabs">
      <button
        v-for="t in TABS"
        :key="t"
        :class="{ active: t === current }"
        @click="selectTab(t)"
      >{{ t }}</button>
    </div>

    <div class="stage">
      <TabPanel :tab="current" v-if="current" />
    </div>

    <div class="meta">
      <strong>缓存顺序（最近访问在末尾）:</strong>
      <span class="cache">{{ cacheKeys.join(' → ') }}</span>
    </div>

    <ul class="log">
      <li v-for="(e, i) in eventLog" :key="e.t + i">
        <span class="dot" :class="{ on: e.msg.startsWith('激活') || e.msg.startsWith('onActivated') }"></span>
        {{ e.msg }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.tabs { display: flex; gap: 4px; margin-bottom: 10px; }
.tabs button { padding: 5px 14px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.85rem; }
.tabs button.active { background: #42b883; color: #fff; border-color: #42b883; }
.stage { background: #f6f8fa; padding: 16px; border-radius: 8px; margin-bottom: 8px; min-height: 60px; }
.panel { font-weight: 600; color: #2c8e63; }
.meta { font-size: 0.78rem; color: #666; margin-bottom: 6px; }
.cache { font-family: ui-monospace, monospace; margin-left: 4px; }
.log { list-style: none; padding: 6px 10px; margin: 0; background: #f6f8fa; border-radius: 6px; max-height: 160px; overflow-y: auto; font-size: 0.78rem; }
.log li { padding: 2px 0; display: flex; gap: 6px; align-items: center; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: #ccc; }
.dot.on { background: #42b883; }
</style>
