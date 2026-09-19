<template>
  <div class="force-demo">
    <p>render 次数：{{ n }}</p>
    <p>最后更新：{{ time }}</p>
    <button @click="forceUpdate">强制刷新（反模式）</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onUpdated, getCurrentInstance } from 'vue'

const n = ref(0)
const time = ref('-')

const inst = getCurrentInstance()!

onUpdated(() => {
  n.value++
  time.value = new Date().toLocaleTimeString()
})

function forceUpdate() {
  // 反模式：绕过响应式强制 patch
  inst.forceUpdate()
}
</script>

<style scoped>
.force-demo { padding: 10px 14px; background: #fff; border: 1px solid #e5e5e5; border-radius: 6px; }
.force-demo p { margin: 0 0 6px; font-size: 13px; }
.force-demo button { padding: 5px 12px; border: 1px solid #c92a2a; color: #c92a2a; background: #fff; border-radius: 4px; cursor: pointer; }
</style>