<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <p>解构前 state.count = {{ state.count }}</p>
    <p>普通解构后：<code>plain</code> 改值 {{ plain }}（已断开响应）</p>
    <p>toRefs 解构：<code>refCount</code> 改值 {{ refCount }}</p>
    <button @click="plain.count++">改 plain.count（不会更新视图）</button>
    <button @click="refCount.count++">改 refCount.count（仍响应）</button>
    <p class="meta">
      <code>toRefs(state)</code> 把每个属性变成 ref，结构等价于 <code>{ count: ref(0) }</code>，解构后仍保持响应式。
    </p>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs } from 'vue'

const title = ref('toRefs 解构保持响应式')
const state = reactive({ count: 0 })

const { count: plain } = state
const { count: refCount } = toRefs(state)
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 520px;
}
button {
  margin-right: 6px;
  padding: 4px 10px;
}
code {
  background: #e2e8f0;
  padding: 0 4px;
  border-radius: 3px;
}
.meta {
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
}
</style>