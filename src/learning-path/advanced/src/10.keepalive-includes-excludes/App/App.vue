<template>
  <div class="demo">
    <h2>KeepAlive include/exclude/max</h2>

    <section class="card">
      <h3>1. include 数组形式</h3>
      <div class="tabs">
        <button :class="{ active: current === 'A' }" @click="current = 'A'">PageA</button>
        <button :class="{ active: current === 'B' }" @click="current = 'B'">PageB</button>
        <button :class="{ active: current === 'C' }" @click="current = 'C'">PageC</button>
      </div>
      <KeepAlive :include="['PageA', 'PageB']">
        <component :is="componentMap[current]" :key="current" />
      </KeepAlive>
      <p class="hint">切到 PageC 再回到 A/B 时数据会保留；回到 C 时重新挂载</p>
    </section>

    <section class="card">
      <h3>2. 正则匹配</h2>
      <KeepAlive :include="/Page/">
        <component :is="componentMap[current]" :key="current" />
      </KeepAlive>
      <p class="hint">所有 name 包含 "Page" 的组件都被缓存</p>
    </section>

    <section class="card">
      <h3>3. max=1 LRU 缓存</h3>
      <KeepAlive :max="1">
        <component :is="componentMap[current]" :key="current" />
      </KeepAlive>
      <p class="hint">最多缓存 1 个实例，超过会按 LRU 淘汰</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { markRaw } from 'vue'
import PageA from './PageA.vue'
import PageB from './PageB.vue'
import PageC from './PageC.vue'

const componentMap = {
  A: markRaw(PageA),
  B: markRaw(PageB),
  C: markRaw(PageC),
} as const

const current = ref<'A' | 'B' | 'C'>('A')
import { ref } from 'vue'
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0 0; font-size: 12px; color: #888; }
.tabs { display: flex; gap: 6px; margin-bottom: 8px; }
.tabs button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
.tabs button.active { background: #1677ff; color: #fff; border-color: #1677ff; }
</style>
