<template>
  <div class="demo">
    <h2>自定义指令全生命周期</h2>

    <section class="card">
      <h3>1. 自动聚焦 (mounted)</h3>
      <input v-focus placeholder="自动聚焦" />
    </section>

    <section class="card">
      <h3>2. 全生命周期指令 (lifecycleLog)</h3>
      <input v-lifecycleLog="text" placeholder="更新我会触发 beforeUpdate" />
      <button @click="text = text + '!'">改变绑定值</button>
      <button @click="show = !show">{{ show ? '卸载' : '挂载' }}</button>
      <p class="hint">查看 console 与 element 上的 dataset 字段</p>
    </section>

    <section class="card">
      <h3>3. 防抖点击 (200ms)</h3>
      <button v-debounceClick="200">连续点击不会频繁触发</button>
      <p>已触发: {{ clicks }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { focus, lifecycleLog, debounceClick } from './directives'

const vFocus = focus
const vLifecycleLog = lifecycleLog
const vDebounceClick = debounceClick

const text = ref('hello')
const show = ref(true)
const clicks = ref(0)
const onClick = () => clicks.value++
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0 0; font-size: 12px; color: #888; }
input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; margin-right: 6px; }
</style>
